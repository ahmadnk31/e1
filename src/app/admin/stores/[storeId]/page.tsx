import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { StoreDialog } from "../components/store-dialog";
import { StoreUpdateForm } from "./components/store-update-form";


export default async function StoresPage({params}:{
    params:{
        storeId:string
    }
})
{
    const session=await auth();
    if(!session){
        return redirect('/auth/sign-in')
    }
    const store=await prisma.store.findUnique({
        where:{
            id:params.storeId
        }
    })
    if(!store){
        return redirect('/admin/stores')
    }
    return(
        <div className="p-4">
            <div className="flex items-center justify-between mb-4">
                <span>
                <h1 className="text-2xl font-semibold">Stores</h1>
                <p className="text-gray-500">Manage your stores</p>
                </span>
             <StoreDialog />
            </div>
            {
                store ? (
                    <StoreUpdateForm  description={store.description ?? ''} name={store.name ?? ''} id={store.id}/>
                ):(
                    <h1>Store not found</h1>
                )
            }
        </div>
    )
}
    