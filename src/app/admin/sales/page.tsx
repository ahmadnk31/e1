import { auth } from "@/auth";
import { SaleDialog } from "./components/sale-dialog";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SaleForm } from "./components/sales-form";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";

export default async function SalesPage(){
    const session=await auth();
    if(!session){
        return redirect('/auth/sign-in')
    }
    const store=await prisma.store.findFirst({
        where:{
            userId:session?.user?.id || ''
        }
    })
    const stores=await prisma.store.findMany({
        where:{
            userId:session?.user?.id
        }
    })

    const sales=await prisma.sale.findMany({
        where:{
            storeId:store?.id||''
        },
        include:{
            store:true,
            products:true
        }
    })
    const formattedSales=sales.map(sale=>({
        id:sale.id||'',
        name:sale.name||'',
        storeId:sale.storeId||'',
        storeName:store?.name||'',
        status:sale.status||'',
        createdAt:new Date(sale.createdAt).toLocaleDateString(),
    }))
    const formattedStores=stores.map((store)=>({
        id:store.id||'',
        name:store.name||''
    }))
    return(
        <div className="p-4">
            <div className="flex items-center justify-between mb-4">
                <span>
                    <h1 className="text-2xl font-semibold">Sales</h1>
                    <p className="text-gray-500">Manage your sales</p>
                </span>
                <SaleDialog stores={formattedStores}/>
            </div>
            {/* <DataTable columns={columns} data={formattedSales}/> */}
            {
                sales.length===0&&(
                    <SaleForm stores={formattedStores}/>
                )
            }
            {
                sales.length>0&&(
                    <DataTable columns={columns} data={formattedSales}/>
                )
            }
        </div>
    )
}