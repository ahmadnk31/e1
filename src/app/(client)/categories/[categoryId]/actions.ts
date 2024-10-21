'use server'

import { prisma } from '@/lib/prisma'

export async function getFilteredProducts({
  categories = [],
  variants = [],
  minPrice = 0,
  maxPrice = Number.MAX_SAFE_INTEGER,
  onSale = false,
  onDiscount = false,
}: {
  categories?: string[]
  variants?: string[]
  minPrice?: number
  maxPrice?: number
  onSale?: boolean
  onDiscount?: boolean
}) {
  try {
    const whereClause: any = {}

    // Add price filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      whereClause.price = {
        gte: minPrice,
        lte: maxPrice
      }
    }

    // Add category filter with parent/child relationship
    if (categories.length > 0) {
      whereClause.OR = [
        // Match direct category
        {
          categoryId: {
            in: categories
          }
        },
        // Match parent category
        {
          category: {
            parentCategoryId: {
              in: categories
            }
          }
        }
      ]
    }

    // Add variant filter
    if (variants.length > 0) {
      whereClause.ProductVariant = {
        some: {
          id: {
            in: variants
          }
        }
      }
    }

    // Add sale filter
    if (onSale) {
      whereClause.saleId = {
        not: null
      }
    }

    // Add discount filter
    if (onDiscount) {
      whereClause.discountId = {
        not: null
      }
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        Image: true,
        category: {
          include: {
            parentCategory: true
          }
        },
        ProductVariant: true,
        sale: true,
        Discount: true,
      }
    })

    return products
  } catch (error) {
    console.error('Error fetching filtered products:', error)
    throw new Error('Failed to fetch filtered products')
  }
}

export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        parentCategory: true,
        childCategories: true,
        Sale: true,
        Discount: true,
        Collection: true,
        products: {
          include: {
            ProductVariant: true
          }
        }
      }
    })

    return categories
  } catch (error) {
    console.error('Error fetching categories:', error)
    throw new Error('Failed to fetch categories')
  }
}

export async function getProductVariants() {
  try {
    const variants = await prisma.productVariant.findMany({
      include: {
        product: {
          include: {
            Image: true
          }
        }

      }
    })
    return variants
  } catch (error) {
    console.error('Error fetching variants:', error)
    throw new Error('Failed to fetch variants')
  }
}