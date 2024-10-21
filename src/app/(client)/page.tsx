import { auth } from "@/auth"
import { signIn, signOut } from "next-auth/react";
import { SignOut } from "../components/sign-out";
import { Banner } from "@/components/banner";
import { Section } from "@/components/product-section";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { CategorySlider } from "../admin/banners/components/category-slider";
export const revalidate=60
export default async function Home(){
  const banners=await prisma.banner.findMany({
    include:{
      Image:true
    }
  })
  const collections=await prisma.collection.findMany({
    where:{
      status:'ACTIVE'
    },
    select:{
      name:true,
      products:{
        select:{
          id:true,
          name:true,
          description:true,
          Image:{
            select:{
              url:true
            }
          }
        }
      }
    }
  })
  
  const bannerSlides=banners.map(banner=>({
    id:banner.id,
    image:banner.Image.map(image=>image.url),
    title:banner.name,
    description:banner.description,
    buttonText:banner.buttonText,
    buttonLink:banner.buttonLink
  }))
 
  const discounts=await prisma.discount.findMany({
    where:{
      status:'ACTIVE'
    },
    select:{
      name:true,
      id:true,
      status:true,
      code:true,
      products:{
        select:{
          id:true,
          name:true,
          description:true,
          Image:{
            select:{
              url:true
            }
          }
        }
      }
    }
  })
  const sales=await prisma.sale.findMany({
    where:{
      status:'ACTIVE'
    },
    select:{
      name:true,
      id:true,
      status:true,
      products:{
        select:{
          id:true,
          name:true,
          description:true,
          Image:{
            select:{
              url:true
            }
          }
        }
      }
    }
  })

  const categories=await prisma.category.findMany({})
  console.log(categories)

  return <div className="container mx-auto px-4 py-8">
    <Banner slides={bannerSlides} />
    <div>
      <h2 className="text-2xl font-bold mb-4 mt-6">Categories</h2>
     <CategorySlider categories={categories} />
    </div>
    {
      collections.map(deal=>(
        deal.products.length>0&&(
          <Section
          baseUrl="collections"
          key={deal.name}
         title={deal.name||''} products={deal.products.map(product=>({
          id:product.id,
          key:product.id,
          name:product.name,
          description:product.description,
          images:product.Image.map(image=>image)
        }))} />
        )
      ))  
    }
    {
      discounts.map(discount=>(
        <Section
        baseUrl='discounts'
          key={discount.name}
          code={discount.code}
          title={discount.name||''} products={discount.products.map(product=>({
          id:product.id,
          key:product.id,
          name:product.name,
          description:product.description,
          images:product.Image.map(image=>image)
        }))} />
      ))
    }
    {
      sales.map(sale=>(
        <Section
        baseUrl='sales'
          key={sale.name}
          title={sale.name||''} products={sale.products.map(product=>({
          id:product.id,
          key:product.id,
          name:product.name,
          description:product.description,
          images:product.Image.map(image=>image)
        }))} />
      ))
    }
    {

    }
  {/* />
  <Section title="Top Deals" products={formattedProducts} />
  {/* <Section title="New Arrivals" products={newArrivals} /> */}
  {/* <Section title="Sales of the Day" products={salesOfTheDay} /> */} 
  <div className="my-8 p-6 bg-gray-100 rounded-lg text-center">
    <h2 className="text-2xl font-bold mb-2">Special Summer Collection</h2>
    <p className="mb-4">Use code SUMMER20 for 20% off on selected items</p>
    <Button>Shop the Collection</Button>
  </div>
</div>
}