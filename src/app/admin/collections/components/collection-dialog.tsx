'use client'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CollectionForm } from "./collection-form"

type Store={
    id:string;
    name:string;
  }

    type CategoryDialogProps={
        stores:Store[];
       
    }

export const CollectionDialog = ({stores}:CategoryDialogProps) => {
    return(
        <Dialog>
     <DialogTrigger>
        <Button>Create a new collection
          <Plus className="ml-2 h-4 w-4"/>
        </Button>
     </DialogTrigger>
       <DialogContent className="p-0 w-auto overflow-y-scroll h-screen">
    <DialogHeader>
      <CollectionForm stores={stores}/>
    </DialogHeader>
  </DialogContent>
</Dialog>

    )
}