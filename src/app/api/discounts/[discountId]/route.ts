import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest,{params}:{params:{discountId:string}}) {
    const { discountId } = params;
    const { name, description, startDate, endDate, status, storeId, code, value, type, minPurchase } = await req.json();
    const session = await auth();
    if (!session) {
        return redirect('/auth/sign-in');
    }
    try {
        await prisma.discount.update({
            where: {
                id: discountId
            },
            data: {
                name,
                description,
                code,
                value,
                type,
                minPurchase,
                storeId: storeId,
                startDate,
                endDate,
                status,
            }
        });
        revalidatePath('/admin/discounts');
        return new NextResponse('Collection updated successfully', { status: 201 });
    }
    catch (e) {
        return new NextResponse('Failed to update collection', { status: 500 });
    }
}

export async function DELETE(req: NextRequest,{params}:{params:{discountId:string}}) {
    const { discountId } = params;
    const session = await auth();
    if (!session) {
        return redirect('/auth/sign-in');
    }
    try {
        await prisma.discount.delete({
            where: {
                id: discountId
            }
        });
        revalidatePath('/admin/discounts');
        return new NextResponse('Collection deleted successfully', { status: 201 });
    }
    catch (e) {
        return new NextResponse('Failed to delete collection', { status: 500 });
    }
}