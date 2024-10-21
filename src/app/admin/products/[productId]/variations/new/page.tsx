import { auth } from "@/auth";
import { VariationForm } from "../variation-form";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function NewVariationPage(){
    const session=await auth();
    if(!session){
        return redirect('/auth/sign-in')
    }
    const store=await prisma.store.findFirst({
        where:{
            userId:session?.user?.id
        }
    })
    const products=await prisma.product.findMany({
        where:{
            storeId:store?.id
        }
    })
    const formattedProducts=products.map(product=>({
        id:product.id||'',
        name:product.name||'',
        price:product.price||0
    }))
    
    return(
        <div className="flex flex-col items-center justify-center py-8">
            <h1 className="text-2xl font-semibold mb-4">Create a new variation</h1>
            <VariationForm products={formattedProducts}/>
        </div>
    )
}