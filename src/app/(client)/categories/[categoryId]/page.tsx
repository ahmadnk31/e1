'use client'

import { useEffect, useState } from 'react'
import { getFilteredProducts, getCategories, getProductVariants } from './actions'
import { ProductFilter } from './components/product-filter'
import { ProductGrid } from './components/product-grid'
import { Product, ProductVariant } from '@prisma/client'

interface CategoryPageProps {
  params: {
    categoryId: string
  }
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [variants, setVariants] = useState<ProductVariant[]>([])

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log('Fetching initial data for storeId:',) // Debug log

        // Fetch initial products
        const initialProducts = await getFilteredProducts({
          categories: params.categoryId ? [params.categoryId] : []
        })

        console.log('Fetched initial products:', initialProducts) // Debug log

        // Fetch categories
        const categoriesData = await getCategories()

        setProducts(initialProducts)
        setCategories(categoriesData)
      } catch (err) {
        console.error('Error fetching initial data:', err)
        setError('Failed to load products. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
  }, [params.categoryId])
  console.log('Categories:', categories) // Debug log
  console.log('Products:', products) // Debug log


  const handleFilterChange = async (newProducts: Product[]) => {
    setProducts(newProducts)
  }

  useEffect(() => {
    const fetchVariants = async () => {
      try {
        const fetchedVariants = await getProductVariants()
        setVariants(fetchedVariants)
      } catch (error) {
        console.error('Error fetching variants:', error)
      }
    }

    fetchVariants()
  }, [])

  console.log('Variants:', variants) // Debug log

  if (error) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        {params.categoryId ? `${params.categoryId} Products` : 'All Products'}
      </h1>

      {loading ? (
        <div className="flex items-center justify-center h-[200px]">
          <p>Loading products...</p>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-8">
          <ProductFilter 
            initialCategories={categories}
            initialCategoryId={params.categoryId}
            onFilterChange={handleFilterChange}
          />
          <div className="w-full md:w-3/4">
            <ProductGrid products={products} />
          </div>
        </div>
      )}
    </div>
  )
}
