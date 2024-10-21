"use client"

import * as React from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Badge } from "@/components/ui/badge"
import { Percent, Tag, ShoppingBag } from "lucide-react"
import Link from "next/link"

type Category = {
  id: string
  name: string
  description?: string
  iconUrl?: string
  imageUrl?: string
  saleId?: string
  discountId?: string
  collectionId?: string
  [key: string]: any // This allows for any additional properties
}

type DynamicCategorySliderProps = {
  categories: Category[]
}

const getCategoryImage = (category: Category) => {
  if (category.iconUrl) {
    return (
      <Image
        src={category.iconUrl}
        alt={category.name}
        width={32}
        height={32}
        className="h-8 w-8 object-contain"
      />
    )
  }
  if (category.imageUrl) {
    return (
      <Image
        src={category.imageUrl}
        alt={category.name}
        width={64}
        height={64}
        className="h-16 w-16 object-cover rounded-full"
      />
    )
  }
  return null
}

const getBadges = (category: Category) => {
  const badges = []
  if (category.saleId) badges.push({ label: 'Sale', icon: <Percent className="h-3 w-3 mr-1" /> })
  if (category.discountId) badges.push({ label: 'Discount', icon: <Tag className="h-3 w-3 mr-1" /> })
  if (category.collectionId) badges.push({ label: 'Collection', icon: <ShoppingBag className="h-3 w-3 mr-1" /> })
  return badges
}

export function CategorySlider({ categories }: DynamicCategorySliderProps) {
  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-4xl xl:max-w-6xl mx-auto"
    >
      <CarouselContent>
        {categories.map((category) => (
          <CarouselItem key={category.id} className="md:basis-1/2 lg:basis-1/3">
            <div className="p-1">
              <Card>
                <Link href={`/categories/${category.id}`}>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="mb-4">
                    {getCategoryImage(category)}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                  {category.description && (
                    <p className="text-sm text-muted-foreground text-center mb-4">{category.description}</p>
                  )}
                  <div className="flex flex-wrap justify-center gap-2">
                    {getBadges(category).map((badge, index) => (
                      <Badge key={index} variant="secondary">
                        {badge.icon}
                        {badge.label}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                </Link>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}