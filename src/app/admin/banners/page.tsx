import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { BannerDialog } from "./components/banner-dialog";
import { BannerForm } from "./components/banner-form";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";

export default async function BannersPage() {
    const session=await auth();
    if(!session){
        return redirect('/auth/sign-in')
    }
    const banners=await prisma.banner.findMany({
        include:{
            store:true,
            Image:true,
            discount:{
                select:{
                    name:true,
                    status:true,
                    id:true
                }
            },
            sale:{
                select:{
                    name:true,
                    status:true,
                    id:true
                }
            },
            collection:{
                select:{
                    name:true,
                    status:true,
                    id:true
                }
            },
            category:{
                select:{
                    name:true,
                    id:true
                }
            }

        }
    })
    const stores=await prisma.store.findMany({
        where:{
            userId:session?.user?.id || ''
        }
    })
    const collections=await prisma.collection.findMany({
        select:{
            name:true,
            id:true,
            status:true
        }
    })
    const sales=await prisma.sale.findMany({
        select:{
            name:true,
            id:true,
            status:true
        }
    })
    const discounts=await prisma.discount.findMany({
        select:{
            name:true,
            id:true,
            status:true
        }
    })
    const categories=await prisma.category.findMany({
        select:{
            name:true,
            id:true,
            
        }
    })
    const formattedCategories=categories.map(category=>({
        id:category.id||'',
        name:category.name||'',
    }))
    const formattedSales=sales.map(sale=>({
        id:sale.id||'',
        name:sale.name||'',
        status:sale.status||''
    }))
    const formattedDiscounts=discounts.map(discount=>({
        id:discount.id||'',
        name:discount.name||'',
        status:discount.status||''
    }))
    const formattedCollections=collections.map(collection=>({
        id:collection.id||'',
        name:collection.name||'',
        status:collection.status||''
    }))
    const formattedStores=stores.map(store=>({
        id:store.id||'',
        name:store.name||'',
    }))
    
    const formattedBanners=banners.map(banner=>({
        id:banner.id||'',
        name:banner.name||'',
        image:banner.Image||'',
        storeId:banner.storeId||'',
        storeName:banner.store?.name||'',
        createdAt:new Date(banner.createdAt).toLocaleDateString(),
        category:banner.discount?.name||banner.sale?.name||banner.collection?.name||banner.category?.name||'',
    }))
  return (
    <div className='p-4'>
      <div className="flex items-center justify-between mb-4">
        <span>
          <h1 className="text-2xl font-semibold">Banners</h1>
          <p className="text-gray-500">Manage your banners</p>
        </span>
        <BannerDialog 
        sales={formattedSales}
        discounts={formattedDiscounts}
        collections={formattedCollections}
        categories={formattedCategories}
        stores={formattedStores} />
        {/* <BannerDialog /> */}
        </div>
        {/* <BannerForm /> */}
        {
            banners.length===0&&(
                <BannerForm 
                sales={formattedSales}
                discounts={formattedDiscounts}
                collections={formattedCollections}
                categories={formattedCategories}
                stores={formattedStores}
                 />
            )
        }
        {
            banners.length>0&&(
               <DataTable columns={columns} data={formattedBanners}/>
            )
        }
    </div>
  )
}