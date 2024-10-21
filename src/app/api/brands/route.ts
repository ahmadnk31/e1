import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req:NextRequest){
    const session=await auth();
    if(!session){
        return redirect('/auth/sign-in')
    }
    const {name,description,image,storeId}=await req.json();
    try{
        const brand=await prisma.brand.create({
            data:{
                name,
                description,
                storeId,
                Image:image&&image.length>0?{
                    createMany:{
                        data:image.map((img:{key:string,url:string})=>({...img}))
                    }
                }:undefined
            }
        })
        revalidatePath('/api/brands')
        return new NextResponse('Brand created successfully',{status:201})
    }catch(e){
        console.log(e)
        return new NextResponse('An error occurred',{status:500})
    }
}

export async function GET(req:NextRequest){
    const session=await auth();
    if(!session){
        return redirect('/auth/sign-in')
    }
    const store=await prisma.store.findFirst({
        where:{
            userId:session?.user?.id
        }
    })
    const brands=await prisma.brand.findMany({
        where:{
            storeId:store?.id
        },
        include:{
            Image:true
        }
    })
    return NextResponse.json(brands)
}