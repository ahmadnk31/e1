import Link from "next/link"
import { Product, ProductCard } from "./product-card"
import { ArrowRight } from "lucide-react"

type SectionProps = {
    title: string
    products: Product[]
    code?: string
    baseUrl?: string
    }

export const Section = ({ title, products,code,baseUrl }:SectionProps) => {
    return (
      <div className="my-8">
        <div className="flex justify-between items-center">
        <span>
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        {
          code&&(
            <p className="mb-4">Use code 
              <span className="font-semibold text-2xl text-red-500"> {code} </span>
             for 
              <span className="font-semibold text-2xl text-red-500"> 20% </span>
              off on selected items</p>
          )
        }
        </span>
        <Link className="text-blue-500 flex items-center" href={`/${baseUrl}`}>
        View all
        <ArrowRight className="size-4 ml-2" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    )
  }
  