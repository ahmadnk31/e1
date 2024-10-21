import { auth } from "@/auth";
import { CollectionForm } from "./components/collection-form";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CollectionDialog } from "./components/collection-dialog";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";

export default async function CollectionsPage() {
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
    const collections=await prisma.collection.findMany({
        where:{
            storeId:store?.id||''
        },
        include:{
            store:true,
        }
    })

    const formattedCollections=collections.map(collection=>({
        id:collection.id||'',
        name:collection.name||'',
        description:collection.description||'',
        startDate:collection.startDate||'',
        endDate:collection.endDate||'',
        status:collection.status||'',
        storeId:collection.storeId||'',
        storeName:store?.name||'',
        createdAt:new Date(collection.createdAt).toLocaleDateString()
    }))
  return (
    <div className='p-4'>
      <div className="flex items-center justify-between mb-4">
        <span>
          <h1 className="text-2xl font-semibold">Collections</h1>
          <p className="text-gray-500">Manage your collections</p>
        </span>
        <CollectionDialog stores={formattedStores} />
        {/* <CollectionDialog /> */}
        </div>
        {/* <CollectionForm /> */}
        {
            stores.length===0&&(
                <CollectionForm stores={formattedStores} />
            )
        }
        {
            stores.length>0&&(
               <DataTable columns={columns} data={formattedCollections}/>
            )
        }
    </div>
  )
}