'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Loader2, Star, ShoppingCart, Heart } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { useToast } from "@/hooks/use-toast"

type Image = {
  url: string
  id: string
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  Image: Image[]
  ProductVariant: ProductVariant[]
  createdAt: string
}

interface ProductVariant {
  id: string
  name: string
  value: string
  price: number
  stock: number
  description: string
  Image: Image[]
}

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  isVariant: boolean
  variantInfo?: {
    name: string
    value: string
  }
}

const ProductImages = ({ images }: { images: Image[] }) => {
  return (
    <Carousel className="w-full">
      <CarouselContent>
        {images.map((image, index) => (
          <CarouselItem key={index}>
            <div className="relative h-64">
              <Image
                src={image.url}
                alt={`Product image ${index + 1}`}
                layout="fill"
                objectFit="cover"
                className="rounded-lg"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}

const ProductCard = ({
  id,
  name,
  description,
  price,
  images,
  isNew,
  isVariant = false,
  variantInfo,
  stock,
  onAddToCart,
  onToggleWishlist,
  isInWishlist,
}: {
  id: string
  name: string
  description: string
  price: number
  images: Image[]
  isNew?: boolean
  isVariant?: boolean
  variantInfo?: { name: string; value: string }
  stock?: number
  onAddToCart: () => void
  onToggleWishlist: () => void
  isInWishlist: boolean
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="relative">
          <ProductImages images={images} />
          {isNew && (
            <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
              New
            </Badge>
          )}
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-semibold mb-2">
              {isVariant ? `${name} - ${variantInfo?.value}` : name}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleWishlist}
              className={`${isInWishlist ? 'text-red-500' : 'text-muted-foreground'}`}
            >
              <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
            </Button>
          </div>
          
          <p className="text-muted-foreground mb-4">{description}</p>
          
          <div className="flex justify-between items-center mb-4">
            <span className="text-2xl font-bold text-primary">
              ${price.toFixed(2)}
            </span>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-5 h-5 fill-primary text-primary" />
              ))}
            </div>
          </div>

          {isVariant && stock !== undefined && (
            <p className="text-sm text-muted-foreground mb-4">
              Stock: {stock} units
            </p>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="">
        <Button 
          className="w-full" 
          onClick={onAddToCart}
          disabled={isVariant && stock === 0}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {isVariant && stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </CardFooter>
    </Card>
  </motion.div>
)

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [wishlist, setWishlist] = useState<Set<string>>(new Set())
  const [cart, setCart] = useState<CartItem[]>([])
const {toast}= useToast()
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/products')
        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }
        const data = await response.json()
        setProducts(data)
      } catch (err) {
        console.error('Error fetching products:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()

    // Load wishlist and cart from localStorage
    const savedWishlist = localStorage.getItem('wishlist')
    const savedCart = localStorage.getItem('cart')
    if (savedWishlist) {
      setWishlist(new Set(JSON.parse(savedWishlist)))
    }
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }, [])

  // Save wishlist and cart to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify([...wishlist]))
  }, [wishlist])

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  const toggleWishlist = (id: string) => {
    setWishlist(prev => {
      const newWishlist = new Set(prev)
      if (newWishlist.has(id)) {
        newWishlist.delete(id)
        toast({
          description: "Removed from wishlist",
        })
      } else {
        newWishlist.add(id)
        toast({
          description: "Added to wishlist",
        })
      }
      return newWishlist
    })
  }

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const existingItem = prev.find(
        i => i.id === item.id && 
        i.isVariant === item.isVariant && 
        i.variantInfo?.value === item.variantInfo?.value
      )

      if (existingItem) {
        return prev.map(i => 
          i === existingItem 
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }

      return [...prev, { ...item, quantity: 1 }]
    })

    toast({
      description: "Added to cart",
    })
  }

  const isNewProduct = (createdAt: string): boolean => {
    const productDate = new Date(createdAt)
    const currentDate = new Date()
    const differenceInDays = (currentDate.getTime() - productDate.getTime()) / (1000 * 3600 * 24)
    return differenceInDays <= 3
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Our Products</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {products.map(product => (
          <div key={product.id} className="space-y-8">
            {/* Main Product Card */}
            <ProductCard
              id={product.id}
              name={product.name}
              description={product.description}
              price={product.price}
              images={product.Image}
              isNew={isNewProduct(product.createdAt)}
              onAddToCart={() => addToCart({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                isVariant: false
              })}
              onToggleWishlist={() => toggleWishlist(product.id)}
              isInWishlist={wishlist.has(product.id)}
            />

            {/* Variant Cards */}
            {product.ProductVariant.map(variant => (
              <ProductCard
                key={variant.id}
                id={variant.id}
                name={product.name}
                description={variant.description || product.description}
                price={variant.price}
                images={variant.Image.length > 0 ? variant.Image : product.Image}
                isVariant={true}
                variantInfo={{
                  name: variant.name,
                  value: variant.value
                }}
                stock={variant.stock}
                onAddToCart={() => addToCart({
                  id: variant.id,
                  name: product.name,
                  price: variant.price,
                  quantity: 1,
                  isVariant: true,
                  variantInfo: {
                    name: variant.name,
                    value: variant.value
                  }
                })}
                onToggleWishlist={() => toggleWishlist(variant.id)}
                isInWishlist={wishlist.has(variant.id)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}