import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { utapi } from "@/server/uploadthing";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req:NextRequest,{params}:{
    params:{
        variantId:string
    }
}){
    const {name,description,price,productId,saleId,collectionId,discountId}=await req.json();
    const session = await auth();
    const variantId=params.variantId;
    if (!session) {
        return redirect("/auth/sign-in");
    }
    const variant=await prisma.productVariant.findUnique({
        where:{
            id:variantId
        }
    })
    if(!variant){
        return new NextResponse('Variant not found',{status:404})
    }
    try{
        const variant=await prisma.productVariant.update({
            where:{
                id:variantId,
            },
            data:{
                name,
                description,
                price,
                productId,
                saleId,
                collectionId,
                discountId
            }
        })
        revalidatePath(`/admin/products/${productId}`)
        return NextResponse.json(variant)
    }
    catch(e){
        return new NextResponse('Something went wrong',{status:500})
    }
}

export async function DELETE(req:NextRequest,{params}:{
    params:{
        variantId:string
    }
}){
    const {variantId}=params;
    const session = await auth();
    if (!session) {
        return redirect("/auth/sign-in");
    }
    const variant=await prisma.productVariant.findUnique({
        where:{
            id:variantId
        }
    })
    if(!variant){
        return new NextResponse('Variant not found',{status:404})
    }

    try{
        const image=await prisma.image.findMany({
            where:{
                productVariantId:variantId
            }
        })
        const keys=image.map((img)=>img.key).filter((key): key is string => key !== null)
        if(image.length>0){
            await utapi.deleteFiles(keys)
        }
        await prisma.productVariant.delete({
            where:{
                id:variantId
            }
        })
        revalidatePath(`/admin/products/${variant.productId}`)
        return new NextResponse('Variant deleted successfully',{status:200})
    }
    catch(e){
        return new NextResponse('Something went wrong',{status:500})
    }
}