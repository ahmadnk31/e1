import { auth } from "@/auth";
import { StoreForm } from "./components/store-form";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";
import { StoreDialog } from "./components/store-dialog";


export default async function AdminStores() {
    const session=await auth();
    if(!session){
        return redirect("/auth/sign-in")
      }
    const stores=await prisma.store.findMany({
        where:{
            userId:session?.user?.id || ''
        }
    })
   
    const formattedStores=stores.map(store=>({
        id:store.id||'',
        name:store.name||'',
        description:store.description||'',
        createdAt:new Date(store.createdAt).toLocaleDateString(),
    }))
    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-4">
                <span>
                <h1 className="text-2xl font-semibold">Stores</h1>
                <p className="text-gray-500">Manage your stores</p>
                </span>
               <StoreDialog/>
            </div>
            {stores?.length > 0 && <DataTable data={formattedStores} columns={columns}/>}
            {
                stores?.length===0&&(<StoreForm/>)
            }
        </div>
    )
}