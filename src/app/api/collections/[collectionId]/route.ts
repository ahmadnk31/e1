import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { utapi } from "@/server/uploadthing"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { NextRequest, NextResponse } from "next/server"

export async function PATCH(req:NextRequest,{params}:{params:{collectionId:string}}){
    const {name,description,startDate,endDate,status,storeId}=await req.json()
    const session=await auth()
    if(!session){
        return redirect('/auth/sign-in')
    }
    try{
        await prisma.collection.update({
            where:{
                id:params.collectionId
            },
            data:{
                name,
                description,
                startDate,
                endDate,
                status,
                storeId,
            }
        })
        revalidatePath('/admin/collections')
        return new NextResponse('Collection updated successfully',{status:200})   
    }
    catch(e){
         return new NextResponse('Failed to update collection',{status:500})
    }
}

export async function DELETE(req:NextRequest,{params}:{params:{collectionId:string}}){
    const session=await auth()
    if(!session){
        return redirect('/auth/sign-in')
    }

    try{
        const collection=await prisma.collection.findFirst({
            where:{
                id:params.collectionId
            }
        })
        if(!collection){
            return new NextResponse('Collection not found',{status:404})
        }
        const images=await prisma.image.findMany({
            where:{
                collectionId:params.collectionId
            }
        })
        const keys=images.map(image=>image.key).filter((key): key is string => key !== null)
        await utapi.deleteFiles(keys)
        await prisma.collection.delete({
            where:{
                id:params.collectionId
            }
        })
        revalidatePath('/admin/collections')
        return new NextResponse('Collection deleted successfully',{status:200})   
    }
    catch(e){
         return new NextResponse('Failed to delete collection',{status:500})
    }
}