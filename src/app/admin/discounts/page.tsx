import { auth } from "@/auth";
import { DiscountDialog } from "./components/discount-dialog";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";
import { DiscountForm } from "./components/discount-form";
import { stat } from "fs";

export default async function DiscountsPage() {
    const session=await auth();
    if(!session){
        return redirect('/auth/sign-in')
    }
    const stores=await prisma.store.findMany({
        where:{
            userId:session?.user?.id || ''
        }
    })
    const store=await prisma.store.findFirst({
        where:{
            userId:session?.user?.id || ''
        }
    })
    const formattedStores=stores.map(store=>({
        id:store.id||'',
        name:store.name||'',
    }))
    const discounts=await prisma.discount.findMany({
        include:{
            store:true,
        }
    })
    const formattedDiscounts=discounts.map(discount=>({
        id:discount.id||'',
        name:discount.name||'',
        description:discount.description||'',
        code:discount.code||'',
        type:discount.type||'',
        value:String(discount.value)||'',
        storeId:discount.storeId||'',
        storeName:discount.store.name||'',
        createdAt:new Date(discount.createdAt).toLocaleDateString(),
        status:discount.status||'',
    }))
    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <span>
                <h1 className="text-2xl font-semibold">Discounts</h1>
                <p className="text-gray-500">Manage your discounts</p>
                </span>
                <DiscountDialog stores={formattedStores} />
            </div>
            {
                discounts.length===0&&(
                    <DiscountForm stores={formattedStores} />
                )
            }
            {
                discounts.length>0&&(
                    <DataTable columns={columns} data={formattedDiscounts} />
                )
            }
        </div>
    )
}