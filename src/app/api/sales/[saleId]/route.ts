import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req:NextRequest,{params}:{params:{saleId:string}}){
    const {name,description,startDate,endDate,status,storeId,discountType,discountValue}=await req.json();
    const session=await auth();
    if(!session){
        return redirect('/auth/sign-in')
    }
    const saleId=params.saleId;
    try{
        await prisma.sale.update({
            where:{
                id:saleId
            },
            data:{
                name,
                description,
                startDate,
                endDate,
                status,
                storeId,
                discountType,
                discountValue
            }
        })
        revalidatePath(`/admin/sales/${saleId}`);
        return new NextResponse('Sale updated successfully',{status:200})
    }
    catch(e){
        return new NextResponse('Failed to update sale',{status:500})
    }
}