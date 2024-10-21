import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { BrandForm } from "./components/brand-form";
import { BrandDialog } from "./components/brand-dialog";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";

export default async function BrandsPage(){
    const session=await auth();
    if(!session){
        return redirect('/auth/sign-in')
    }

    const stores=await prisma.store.findMany({
        where:{
            userId:session?.user?.id||''
        },
        include:{
            Image:true
        }
    })
    const formattedStores=stores.map(store=>({
        id:store.id,
        name:store.name||'',
        description:store.description,
    }))
    const brands=await prisma.brand.findMany({
        where:{
            storeId:{
                in:stores.map(store=>store.id)
            }
        },
        include:{
            Image:true,
            store:{
                select:{
                    id:true,
                    name:true
                }
            }
        }
    })
    const formattedBrands=brands.map(brand=>({
        id:brand.id||'',
        name:brand?.name||'',
        description:brand?.description||'',
        storeId:brand?.storeId||'',
        storeName:brand?.store.name||'',
        createdAt:new Date(brand.createdAt).toLocaleDateString()
    }))
    return(
        <div className='p-4'>
            <div className='flex justify-between items-center'>
                <span className="mb-4">
                    <h1 className="
                    text-2xl font-semibold mb-2">Brands</h1>
                    <p
                    className="text-gray-500">Manage your brands</p>
                </span>
                <BrandDialog stores={formattedStores}/>
                </div>
                {brands?.length>0&&<DataTable data={formattedBrands} columns={columns}/>}
                {
                    brands?.length===0&&(<BrandForm stores={formattedStores}/>)
                }
        </div>
    )
}