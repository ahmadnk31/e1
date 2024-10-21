import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req:NextRequest,{params}:{params:{storeId:string}}){
    const session=await auth();
    if(!session){
        return redirect('/auth/sign-in')
    }
    const storeId=params.storeId;
    const data=await req.json();
    try{
        const updatedStore=await prisma.store.update({
            where:{
                id:storeId
            },
            data:{
                name:data.name,
                description:data.description
            }
        })
        revalidatePath(`/admin/stores/${storeId}`);
        return new NextResponse('Store updated successfully',{status:200})
    }
    catch(e){
        console.error(e);
        return new NextResponse('Something went wrong',{status:500});
    }
}

export async function DELETE(req:NextRequest,{params}:{params:{storeId:string}}){
    const session=await auth();
    if(!session){
        return redirect('/auth/sign-in')
    }
    const storeId=params.storeId;
    try{
        const store=await prisma.store.delete({
            where:{
                id:storeId
            }
        })
        revalidatePath('/admin/stores');
        return new NextResponse('Store deleted successfully',{status:200})
    }
    catch(e){
        console.error(e);
        return new NextResponse('Something went wrong',{status:500});
    }
}