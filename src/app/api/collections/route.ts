import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest){
    const {name,description,startDate,endDate,status,storeId,image}=await req.json()
    const session=await auth()
    if(!session){
        return redirect('/auth/sign-in')
    }
   try{
    await prisma.collection.create({
        data:{
            name,
            description,
            startDate,
            endDate,
            status,
            storeId:storeId,
            Image:image.length>0?{
                createMany:{
                    data:image
                }
            }:undefined
        }
    })
    revalidatePath('/admin/collections')
    return new NextResponse('Collection created successfully',{status:201})   
   }
    catch(e){
         return new NextResponse('Failed to create collection',{status:500})
    }
}