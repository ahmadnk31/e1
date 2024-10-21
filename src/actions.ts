'use server'

import { redirect } from "next/navigation"
import { signIn } from "@/auth"
import { AuthError } from "next-auth"
import { prisma } from "@/lib/prisma"

export async function handleSignIn(formData: FormData) {
  try {
    await signIn("credentials", Object.fromEntries(formData))
  } catch (error) {
    if (error instanceof AuthError) {
      return redirect(`${process.env.SIGNIN_ERROR_URL}?error=${error.type}`)
    }
    throw error
  }
}

// Types
export type Category = {
  id: string
  name: string
  parentCategoryId: string | null
  children: Category[]
}

type ProductVariant = {
  id: string
  name: string | null
  price: number | null
  stock: number | null
  description: string
  value: string | null
}


export type Image = {
  key: string
  url: string
}
export type Product={
  id:string
  name:string
  description:string
  price:number
  categoryId:string
  Image:Image[]
  ProductVariant:ProductVariant[]
}

// Server actions
export async function fetchCategories(): Promise<Category[]> {
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      parentCategoryId: true,
    }
  })
  return createCategoryHierarchy(categories)
}

function createCategoryHierarchy(categories: any[]): Category[] {
  const categoryMap: Record<string, Category> = {}

  categories.forEach(category => {
    categoryMap[category.id] = { ...category, children: [] }
  })

  const rootCategories: Category[] = []
  categories.forEach(category => {
    if (category.parentCategoryId) {
      const parent = categoryMap[category.parentCategoryId]
      if (parent) {
        parent.children.push(categoryMap[category.id])
      }
    } else {
      rootCategories.push(categoryMap[category.id])
    }
  })

  return rootCategories
}

async function getAllChildCategoryIds(categoryId: string): Promise<string[]> {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: { childCategories: true }
  })

  if (!category) return []

  let childIds = [category.id]

  for (const child of category.childCategories) {
    childIds = childIds.concat(await getAllChildCategoryIds(child.id))
  }

  return childIds
}

export async function searchProductsByName(name: string, categoryId?: string): Promise<Product[]> {
  let whereClause: any = {
    name: {
      contains: name,
      mode: 'insensitive'
    }
  }

  if (categoryId && categoryId !== "all") {
    const allCategoryIds = await getAllChildCategoryIds(categoryId)
    whereClause.categoryId = { in: allCategoryIds }
  }

  const products = await prisma.product.findMany({
    where: whereClause,
    include: {
      Image: true,
      ProductVariant: {
        include: {
          VariantAttribute: true
        }
      }
    }
  })

  return products.map(product => ({
    ...product,
    name: product.name ?? '',
    description: product.description ?? '',
    price: product.basePrice ?? 0,
    categoryId: product.categoryId ?? '',
    Image: product.Image.map(image => ({
      key: image.key ?? '',
      url: image.url ?? '',

    })),
    ProductVariant: product.ProductVariant.map(variant => ({
      ...variant,
      name: variant.name ?? '',
      description: variant.description ?? '',
      price: variant.price ?? 0,
      value: variant.VariantAttribute.map(attr => attr.value).join(', '),
      stock: variant.stock ?? 0,
    }))
  }))
}

export async function uploadImage(){}