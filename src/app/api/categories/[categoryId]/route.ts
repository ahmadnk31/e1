import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { utapi } from "@/server/uploadthing";

export async function PATCH(req:NextRequest,{params}:{params:{categoryId:string}}){
    const session=await auth();
    if(!session){
        return redirect('/auth/sign-in')
    }
    const categoryId=params.categoryId;
    const data=await req.json();
    try{
        const updatedCategory = await prisma.category.update({
            where: {
                id: categoryId,
            },
            data: {
                name: data.name,
                description: data.description,
                saleId: data.saleId,
                discountId: data.discountId,
                collectionId: data.collectionId,
                Image: {
                    upsert: (data.images || []).map((image: { id: string, url: string,key:string }) => ({
                        where: { key: image.key },
                        update: { url: image.url },
                        create: { url: image.url, categoryId: categoryId },
                    })),
                },
            },
        });
        revalidatePath(`/admin/categories/${categoryId}`);
        return new NextResponse('Category updated successfully',{status:200})
    }
    catch(e){
        console.error(e);
        return new NextResponse('Something went wrong',{status:500});
    }
}

export async function DELETE(req:NextRequest,{params}:{params:{categoryId:string}}){
    const session=await auth();
    if(!session){
        return redirect('/auth/sign-in')
    }
    const categoryId=params.categoryId;
    try{
        const images=await prisma.image.findMany({
            where:{
                categoryId:categoryId
            }
        })
        const keys=images.map(image=>image.key).filter((key): key is string => key !== null);
        await utapi.deleteFiles(keys);
        console.log(keys);
        await prisma.category.delete({
            where:{
                id:categoryId
            }
        })
        revalidatePath('/admin/categories');
        return new NextResponse('Category deleted successfully',{status:200})
    }
    catch(e){
        console.error(e);
        return new NextResponse('Something went wrong',{status:500});
    }
}


export async function GET(req:NextRequest){
    const session=await auth();
    if(!session){
        return redirect('/auth/sign-in')
    }
    if (!session.user?.id) {
        return new NextResponse('Unauthorized',{status:401})
    }
    const categories=await prisma.category.findMany({
        where:{
            storeId:session.user.id
        },
        include:{
            Image:true,
            products:true,
            childCategories:{
                include:{
                    Image:true,
                    products:true
                }
            }
        }
    })
    return NextResponse.json({data:categories})
}