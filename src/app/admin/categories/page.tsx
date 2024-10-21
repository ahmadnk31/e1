import { auth } from "@/auth";
import { CategoryDialog } from "./components/category-dialog";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CategoryForm } from "./components/category-form";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";

export default async function CategoriesPage() {
    const session=await auth();
    if(!session){
        return redirect('/auth/sign-in')
    }
    const categories=await prisma.category.findMany({
        include:{
            store:true,
            parentCategory:true,
            Collection:{
                select:{
                    name:true,
                    id:true,
                    status:true
                }
            },
            Discount:{
                select:{
                    name:true,
                    id:true,
                    status:true
                }
            },
            Sale:{
                select:{
                    name:true,
                    id:true,
                    status:true
                }
            },
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
    const collections=await prisma.collection.findMany({
        select:{
            name:true,
            id:true,
            status:true
        }
    })
    const formattedCategories=categories.map(category=>({
        id:category.id||'',
        name:category.name||'',
        parentCategoryId:category.parentCategoryId||'',
        description:category.description||'',
        storeId:category.storeId||'',
        storeName:category.store.name||'',
        parentName:category.parentCategory?.name||'',
        saleName:category.Sale?.name||'',
        saleId:category.saleId||'',
        sales:sales,
        createdAt:new Date(category.createdAt).toLocaleDateString(),
        discountName:category.Discount?.name||'',
        discountId:category.discountId||'',
        discounts:discounts,
        collectionName:category.Collection?.name ?? '',
        collectionId:category.collectionId||'',
        collections:collections.map(collection=>({
            id:collection.id,
            name:collection.name||'',
            status:collection.status
        })),
    }))
    console.log(formattedCategories)
    const stores=await prisma.store.findMany({
        where:{
            userId:session?.user?.id || ''
        }
    })

    const formattedStores=stores.map(store=>({
        id:store.id||'',
        name:store.name||''
    }))
    console.log(sales)
  return (
    <div className="p-4">
       <div className="flex items-center justify-between mb-4">
            <span>
                <h1 className="text-2xl font-semibold">Categories</h1>
                <p className="text-gray-500">Manage your categories</p>
                </span>
                <CategoryDialog stores={formattedStores} categories={formattedCategories}/>
            </div>
        {
            categories.length===0&&(
                <CategoryForm stores={formattedStores} categories={formattedCategories} />
            )
        }
        {
            categories.length>0&&(
                <DataTable columns={columns} data={formattedCategories}/>
            )
        }
    </div>
  );
}