'use client'
import React from "react"
import { useState } from "react"
import { Button } from "./ui/button"
import { ChevronLeft, ChevronRight, Heart, ShoppingCart } from "lucide-react"
import { Badge } from "./ui/badge"
type Image = {
  url: string
}
export type Product = {
    id: string
    name: string
    description: string
    price?: number
    images: Image[]
    badge?: string
    stock?: number
    value?: string
    }

type ProductCardProps = {
    product: Product
    }
export const ProductCard = ({ product }:ProductCardProps) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [isHovered, setIsHovered] = useState(false)
  
    const nextImage = () => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
      )
    }
  
    const prevImage = () => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
      )
    }
  
    React.useEffect(() => {
      let interval: string | number | NodeJS.Timeout | undefined
      if (isHovered) {
        interval = setInterval(nextImage, 3000)
      }
      return () => clearInterval(interval)
    }, [isHovered])
  
    return (
      <div 
        className="relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-square overflow-hidden rounded-lg">
          <img
            src={product.images[currentImageIndex].url}
            alt={product.name}
            className="object-cover w-full h-full transition-all duration-300 group-hover:scale-105"
          />
          {isHovered && (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/80 hover:bg-white"
                onClick={prevImage}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/80 hover:bg-white"
                onClick={nextImage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2 bg-white/80 hover:bg-white"
        >
          <Heart className="h-4 w-4" />
        </Button>
        {product.badge && (
          <Badge className="absolute top-2 left-2" variant="secondary">
            {product?.badge}
          </Badge>
        )}
        
        <div className="mt-2">
          <h3 className="text-sm font-medium">{product?.name}</h3>
          <p className="text-sm text-gray-500">{product?.description}</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-lg font-bold">{product?.price}</span>
            <Button size="sm">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    )
  }