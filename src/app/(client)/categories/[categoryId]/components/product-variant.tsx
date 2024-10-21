'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { ShoppingBag, Loader2 } from 'lucide-react'
import { formatter } from '@/lib/format-price'

interface Variant {
  id: string
  name: string
  value: string
  price: number
  image?: string
}

interface Product {
  id: string
  name: string
  description: string
  variants: Variant[]
}

interface ProductVariantsProps {
  productId: string
  initialProduct?: Product
}

export function ProductVariants({ productId, initialProduct }: ProductVariantsProps) {
  const [product, setProduct] = useState<Product | null>(initialProduct || null)
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null)
  const [isLoading, setIsLoading] = useState(!initialProduct)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!initialProduct) {
      fetchProduct()
    }
  }, [productId, initialProduct])

  const fetchProduct = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/products/${productId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch product')
      }
      const data = await response.json()
      setProduct(data)
      setSelectedVariant(data.variants[0] || null)
    } catch (err) {
      setError('Error fetching product. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVariantChange = (variantId: string) => {
    const variant = product?.variants.find(v => v.id === variantId)
    setSelectedVariant(variant || null)
  }

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  if (error || !product) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <p className="text-center text-red-500">{error || 'Product not found'}</p>
        </CardContent>
      </Card>
    )
  }

  if (!product.variants.length) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <p className="text-center text-gray-500">No variants available for this product.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-4">{product.name}</h2>
        <p className="text-gray-600 mb-6">{product.description}</p>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Select Variant</h3>
          <RadioGroup onValueChange={handleVariantChange} defaultValue={selectedVariant?.id}>
            {product.variants.map((variant) => (
              <div key={variant.id} className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value={variant.id} id={variant.id} />
                <Label htmlFor={variant.id} className="flex items-center space-x-2 cursor-pointer">
                  <span>{variant.name}: {variant.value}</span>
                  <span className="font-semibold">{formatter.format(variant.price)}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        
        {selectedVariant && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Selected Variant</h3>
            <div className="flex items-center space-x-4">
              {selectedVariant.image && (
                <Image
                  src={selectedVariant.image}
                  alt={`${selectedVariant.name} - ${selectedVariant.value}`}
                  width={100}
                  height={100}
                  className="rounded-md object-cover"
                />
              )}
              <div>
                <p className="font-medium">{selectedVariant.name}: {selectedVariant.value}</p>
                <p className="text-xl font-bold mt-1">{formatter.format(selectedVariant.price)}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-6 pt-0">
        <Button className="w-full" disabled={!selectedVariant}>
          <ShoppingBag className="mr-2 h-4 w-4" /> Add to Cart
        </Button>
      </CardFooter>
    </Card>
  )
}