import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProductDialog } from "@/app/admin/products/components/product-dialog";
import { DataTable as ProductDataTable } from "./components/data-table";

import { ProductForm } from "@/app/admin/products/components/product-form";
import { columns } from "./components/columns";



export default async function ProductsPage({params}:{
    params:{
        storeId:string
    }
}) {
    const session = await auth();
    if (!session) {
        return redirect('/auth/sign-in')
    }
    const stores = await prisma.store.findMany({
        where: {
            userId: session?.user?.id || ""
        },
        select: {
            id: true,
            name: true
        }
    })
    const store= await prisma.store.findUnique({
        where: {
            id: params.storeId
        },
        select: {
            id: true,
            name: true
        }
    })

    const products = await prisma.product.findMany({
        where: {
            
                storeId:store?.id||""
            
        },
        include: {
            store: true,
            category: true,
        }
    })

    const categories = await prisma.category.findMany({
        select: {
            id: true,
            name: true
        }
    })
    const formattedProducts=products.map(product=>({
        id:product.id||'',
        name:product.name||'',
        storeId:product.store.id||'',
        storeName:product.store.name||'',
        categoryName:product.category.name||'',
        price:product.price||0,
        stock:product.stock||0,
        createdAt:new Date(product.createdAt).toLocaleDateString(),
    }))

    const formattedCategories = categories.map(category => ({
        id: category.id || '',
        name: category.name || '',
    }))
    const formattedStores = stores.map(store => ({
        id: store.id || '',
        name: store.name || '',
    }))

    

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-4">
                <span>
                    <h1 className="text-2xl font-semibold">Products</h1>
                    <p className="text-gray-500">Manage your products</p>
                </span>
                <ProductDialog stores={formattedStores} categories={formattedCategories} />
            </div>
           
                
               
                    {
                        products.length === 0 && (
                            <ProductForm stores={formattedStores} categories={formattedCategories} />
                        )
                    }
                    {
                        products.length > 0 && (
                            <ProductDataTable data={formattedProducts} columns={columns} />
                        )
                    }
             


        </div>
    )
}