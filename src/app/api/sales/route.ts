import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { name, description, startDate, endDate, status, storeId,discountType,discountValue  } = await req.json();
    const session = await auth();
    if (!session) {
        return redirect('/auth/sign-in');
    }
    try {
        await prisma.sale.create({
            data: {
                name,
                description,
                startDate,
                endDate,
                status,
                storeId,
                discountValue,
                discountType
            }
        });
        revalidatePath('/admin/sales');
        return new NextResponse('Sale created successfully', { status: 201 });
    }
    catch (e) {
        return new NextResponse('Failed to create sale', { status: 500 });
    }
}