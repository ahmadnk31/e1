'use client'

import React, { useCallback, useEffect, useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Category, Product, ProductVariant } from '@prisma/client'
import { getFilteredProducts, getCategories, getProductVariants } from '../actions'
import debounce from 'lodash/debounce'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface ProductFilterProps {
  initialCategories?: Category[]
  initialCategoryId?: string
  onFilterChange: (products: Product[]) => void
}

interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[]
  products?: Product[]
}

interface FilterState {
  categories: string[]
  minPrice: number
  maxPrice: number
  onSale: boolean
  onDiscount: boolean
  variants: string[]
}

export function ProductFilter({ 
  initialCategories = [], 
  initialCategoryId,
  onFilterChange 
}: ProductFilterProps) {
  const [filters, setFilters] = useState<FilterState>({
    categories: initialCategoryId ? [initialCategoryId] : [],
    minPrice: 0,
    maxPrice: 2000,
    variants: [],
    onSale: false,
    onDiscount: false,
  })

  const [priceRange, setPriceRange] = useState([filters.minPrice, filters.maxPrice])
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [expandedVariantGroups, setExpandedVariantGroups] = useState<string[]>([])

  // Group variants by their names
  const groupedVariants = useMemo(() => {
    return variants
      .filter(variant => variant.name !== null)
      .reduce((acc, variant) => {
        if (variant.name && !acc[variant.name]) {
          acc[variant.name] = []
        }
        if (variant.name) {
          acc[variant.name].push(variant)
        }
        return acc
      }, {} as Record<string, ProductVariant[]>)
  }, [variants])

  // Fetch categories and variants if not provided initially
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        if (categories.length === 0) {
          const fetchedCategories = await getCategories()
          setCategories(fetchedCategories)
        }
        const fetchedVariants = await getProductVariants()
        setVariants(fetchedVariants)
      } catch (error) {
        console.error('Error fetching initial data:', error)
      }
    }
    fetchInitialData()
  }, [])

  // Organize categories into a tree structure
  const categoryTree = useMemo(() => {
    if (categories.length === 0) return []

    const tree: CategoryWithChildren[] = []
    const map: { [key: string]: CategoryWithChildren } = {}

    categories.forEach(category => {
      map[category.id] = { ...category, children: [] }
    })

    categories.forEach(category => {
      if (category.parentCategoryId) {
        const parent = map[category.parentCategoryId]
        if (parent) {
          parent.children = parent.children || []
          parent.children.push(map[category.id])
        }
      } else {
        tree.push(map[category.id])
      }
    })

    return tree
  }, [categories])

  // Debounced function to fetch filtered products
  const debouncedFetchProducts = useCallback(
    debounce(async (filterParams: FilterState) => {
      try {
        const filteredProducts = await getFilteredProducts(filterParams)
        onFilterChange(filteredProducts)
      } catch (error) {
        console.error('Error applying filters:', error)
      }
    }, 500),
    [onFilterChange]
  )

  // Update filters and fetch products
  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value }
      debouncedFetchProducts(newFilters)
      return newFilters
    })
  }

  // Handle price range changes from slider
  const handlePriceRangeChange = (value: number[]) => {
    setPriceRange(value)
    handleFilterChange('minPrice', value[0])
    handleFilterChange('maxPrice', value[1])
  }

  // Handle price input changes
  const handlePriceInputChange = (type: 'min' | 'max', value: number) => {
    const newRange = type === 'min' 
      ? [value, priceRange[1]]
      : [priceRange[0], value]
    
    setPriceRange(newRange)
    handleFilterChange('minPrice', newRange[0])
    handleFilterChange('maxPrice', newRange[1])
  }

  // Handle variant selection
  const handleVariantToggle = (variantId: string) => {
    setFilters(prev => {
      const newVariants = prev.variants.includes(variantId)
        ? prev.variants.filter(id => id !== variantId)
        : [...prev.variants, variantId]
      
      const newFilters = { ...prev, variants: newVariants }
      debouncedFetchProducts(newFilters)
      return newFilters
    })
  }

  // Toggle category expansion
  const toggleCategory = async (category: CategoryWithChildren) => {
    const isExpanded = expandedCategories.includes(category.id)
    setExpandedCategories(prev => 
      isExpanded
        ? prev.filter(id => id !== category.id)
        : [...prev, category.id]
    )

    if (!isExpanded && !category.products) {
      try {
        const products = await getFilteredProducts({ categories: [category.id] })
        setCategories(prev => 
          prev.map(cat => 
            cat.id === category.id ? { ...cat, products } : cat
          )
        )
      } catch (error) {
        console.error('Error fetching products for category:', error)
      }
    }
  }

  // Toggle variant group expansion
  const toggleVariantGroup = (groupName: string) => {
    setExpandedVariantGroups(prev =>
      prev.includes(groupName)
        ? prev.filter(name => name !== groupName)
        : [...prev, groupName]
    )
  }

  // Render variant filters
  const renderVariantFilters = () => (
    <div className="space-y-4">
      <h3 className="font-medium">Variants</h3>
      {Object.entries(groupedVariants).map(([variantName, variantsGroup]) => (
        <div key={variantName} className="space-y-2">
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => toggleVariantGroup(variantName)}
          >
            {expandedVariantGroups.includes(variantName) ? 
              <ChevronDown size={16} /> : 
              <ChevronRight size={16} />
            }
            <span className="text-sm font-medium">{variantName}</span>
          </div>
          
          {expandedVariantGroups.includes(variantName) && (
            <div className="ml-6 space-y-2">
              {variantsGroup.map(variant => (
                <div key={variant.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`variant-${variant.id}`}
                    checked={filters.variants.includes(variant.id)}
                    onCheckedChange={() => handleVariantToggle(variant.id)}
                  />
                  <Label 
                    htmlFor={`variant-${variant.id}`}
                    className="text-sm cursor-pointer"
                  >
                    {variant.value}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )

  // Recursive function to render category tree
  const renderCategoryTree = (categories: CategoryWithChildren[], level = 0) => {
    return categories.map((category) => (
      <div key={category.id} className="mb-2">
        <div className="flex items-center space-x-2" style={{ marginLeft: `${level * 20}px` }}>
          <Checkbox
            id={`category-${category.id}`}
            checked={filters.categories.includes(category.id)}
            onCheckedChange={(checked) => {
              toggleCategory(category)
              let newCategories: string[]
              if (checked) {
                newCategories = [...filters.categories, category.id]
              } else {
                newCategories = filters.categories.filter((c) => c !== category.id)
              }
              handleFilterChange("categories", newCategories)
            }}
          />
          <label 
            htmlFor={`category-${category.id}`}
            className="text-sm cursor-pointer"
          >
            {category.name}
          </label>
        </div>
        {expandedCategories.includes(category.id) && (
          <>
            {category.products && category.products.map(product => (
              <div key={product.id} className="ml-6 mt-1">
                <Checkbox
                  id={`product-${product.id}`}
                  checked={filters.categories.includes(product.id)}
                  onCheckedChange={(checked) => {
                    let newCategories = [...filters.categories]
                    if (checked) {
                      newCategories.push(product.id)
                    } else {
                      newCategories = newCategories.filter(c => c !== product.id)
                    }
                    handleFilterChange("categories", newCategories)
                  }}
                />
                <label 
                  htmlFor={`product-${product.id}`}
                  className="text-sm ml-2 cursor-pointer"
                >
                  {product.name}
                </label>
              </div>
            ))}
            {category.children && renderCategoryTree(category.children, level + 1)}
          </>
        )}
      </div>
    ))
  }

  // Initial filter application
  useEffect(() => {
    const applyInitialFilters = async () => {
      try {
        const initialProducts = await getFilteredProducts(filters)
        onFilterChange(initialProducts)
      } catch (error) {
        console.error('Error applying initial filters:', error)
      }
    }

    applyInitialFilters()
  }, [])

  if (categories.length === 0) {
    return <div>Loading categories...</div>
  }

  return (
    <div className="w-full md:w-1/4 space-y-6">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Filters</h2>
          <div className="space-y-6">
            {/* Categories Section */}
            <div>
              <h3 className="font-medium mb-2">Categories</h3>
              {renderCategoryTree(categoryTree)}
            </div>

            {/* Price Range Section */}
            <div>
              <h3 className="font-medium mb-2">Price Range</h3>
              <div className="flex items-center space-x-2 mb-4">
                <Input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => handlePriceInputChange('min', Number(e.target.value))}
                  className="w-24"
                  min={0}
                />
                <span>to</span>
                <Input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => handlePriceInputChange('max', Number(e.target.value))}
                  className="w-24"
                  max={5000}
                />
              </div>
              <Slider
                min={0}
                max={5000}
                step={100}
                value={priceRange}
                onValueChange={handlePriceRangeChange}
                className="mt-2"
              />
            </div>

            {/* Variant Filters Section */}
            {renderVariantFilters()}

            {/* Additional Filters Section */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="on-sale"
                  checked={filters.onSale}
                  onCheckedChange={(checked) => handleFilterChange("onSale", checked)}
                />
                <label htmlFor="on-sale">On Sale</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="on-discount"
                  checked={filters.onDiscount}
                  onCheckedChange={(checked) => handleFilterChange("onDiscount", checked)}
                />
                <label htmlFor="on-discount">On Discount</label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}