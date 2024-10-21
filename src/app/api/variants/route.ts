import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

export async function POST(req:Request){
    const session=await auth();
    if(!session){
        return redirect('/auth/sign-in')
    }
    const data=await req.json();
    try{
        const variation=await prisma.productVariant.create({
            data:{
                name:data.name,
                price:data.price,
                stock:data.stock,
                description:data.description,
                value:data.value,
                productId:data.productId,
                Image: data.image.length > 0 ? {
                    createMany: {
                        data: data.image
                    }
                } : undefined
            }
        })
        revalidatePath(`/admin/products/${data.productId}`);
        return new NextResponse('Variation created successfully',{status:201})
    }
    catch(e){
        console.error(e);
        return new NextResponse('Something went wrong',{status:500});
    }
}