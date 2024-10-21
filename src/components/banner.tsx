"use client"
import Image from "next/image"
import { Button } from "./ui/button"
import Autoplay from "embla-carousel-autoplay"
import {useRouter} from 'next/navigation'
import { Carousel,CarouselContent,CarouselItem,CarouselNext,CarouselPrevious } from "./ui/carousel"
import React from "react"

type Slide = {
    title:string,
    description:string,
    image:string,
    buttonText:string
    buttonLink:string
}
export type BannerProps = {
    slides:Slide[]
}
export const Banner = ({ slides }:BannerProps) => {
  const router=useRouter()
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  )
    return (
      <Carousel 
      plugins={[plugin.current]}
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
      className="w-full max-w-5xl mx-auto">
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem key={index}>
              <div className="relative aspect-[2/1] overflow-hidden rounded-lg">
                <img 
                  src={slide.image} 
                  alt={slide.title} 
                  width='1000'
                  height='1000'
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h2 className="text-3xl font-bold mb-2">{slide.title}</h2>
                    <p className="mb-4">{slide.description}</p>
                    <Button variant='secondary' onClick={()=>router.push(slide.buttonLink)}>
                      {slide.buttonText}
                    </Button>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    )
  }
  