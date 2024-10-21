'use client'

import React, { useState } from 'react'
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Percent, Tag, ShoppingBag } from "lucide-react"
import { formatter } from "@/lib/format-price"
import {ProductVariants} from './product-variant'

interface Image {
  id: string
  url: string
}

export interface Product {
  id: string
  name: string | null
  description: string | null
  price: number | null
  Image: Image[]
  sale: { id: string } | null
  discount: { id: string } | null
  status: string
}

interface ProductGridProps {
  products: Product[]
}

export function ProductGrid({ products }: ProductGridProps) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)

  if (!products?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] w-full">
        <ShoppingBag className="h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-xl font-semibold text-gray-600">No products found</h3>
        <p className="mt-2 text-sm text-gray-500">Try adjusting your filters</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="group overflow-hidden">
            <CardContent className="p-4">
              <div className="aspect-square relative rounded-lg overflow-hidden">
                <Image
                  src={product.Image?.[0]?.url || "/placeholder.jpg"}
                  alt={product.name || "Product image"}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  priority={false}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                {(product.sale || product.discount) && (
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    {product.sale && (
                      <Badge variant="destructive" className="px-2 py-1">
                        <Percent className="h-3 w-3 mr-1" />
                        Sale
                      </Badge>
                    )}
                    {product.discount && (
                      <Badge variant="secondary" className="px-2 py-1">
                        <Tag className="h-3 w-3 mr-1" />
                        Discount
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              <div className="mt-4 space-y-2">
                <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-lg">
                    {product.price ? formatter.format(product.price) : 'Contact for price'}
                  </p>
                  {product.status === 'OUT_OF_STOCK' && (
                    <Badge variant="secondary">Out of Stock</Badge>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-4">
              <Button
                className="w-full"
                disabled={product.status === 'OUT_OF_STOCK'}
                onClick={() => setSelectedProductId(product.id)}
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                View Variants
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {selectedProductId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <ProductVariants productId={selectedProductId} />
            <Button 
              variant="outline" 
              className="m-4" 
              onClick={() => setSelectedProductId(null)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}