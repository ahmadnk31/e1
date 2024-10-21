import { prisma } from "@/lib/prisma"
import { CategoryDialog } from "../components/category-dialog"
import { CategoryUpdateForm } from "./components/category-update-form"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function CategoryPage({params}:{
    params:{
        categoryId:string
    }
    
}){
    const session=await auth();
    if(!session){
        return redirect('/auth/sign-in')
    }
    const category=await prisma.category.findUnique({
        where:{
            id:params.categoryId
        },
        include:{
            Image:true
        }
    })
    const stores=await prisma.store.findMany({
        where:{
            userId:session?.user?.id || ''
        }
    })
    const formattedStores=stores.map(store=>({
        id:store.id||'',
        name:store.name||'',
    }))
    if(!category){
        return redirect('/admin/categories')
    }
    return(
        <div className="p-4">
            <div className="flex items-center justify-between mb-4">
            <span>
                <h1 className="text-2xl font-semibold">{category?.name}</h1>
                <p className="text-gray-500">Manage your categories</p>
                </span>
                <CategoryDialog stores={formattedStores} />
            </div>
            {
                category&&(
                    <CategoryUpdateForm
                    images={
                        category.Image.map(image=>({
                            id:image.id||'',
                            url:image.url||'',
                            key:image.key||''
                        }))
                    }
                     description={category?.description ?? ''} name={category?.name ?? ''} id={category.id}/>
                )
            }
            {
                !category&&(
                    <p>Category not found</p>
                )
            }
        </div>
    )
}