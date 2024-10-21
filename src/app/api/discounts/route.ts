import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { name, description, startDate, endDate, status, storeId,code,value,type,minPurchase } = await req.json();
    const session = await auth();
    if (!session) {
        return redirect('/auth/sign-in');
    }
    try {
        await prisma.discount.create({
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
        return new NextResponse('Collection created successfully', { status: 201 });
    }
    catch (e) {
        return new NextResponse('Failed to create collection', { status: 500 });
    }
}