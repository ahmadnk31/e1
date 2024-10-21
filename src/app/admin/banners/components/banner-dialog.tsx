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
import { BannerForm } from "./banner-form"


type Status = "ACTIVE" | "INACTIVE" | "SCHEDULED" | "EXPIRED"


type Store = {
    id: string
    name: string
    }

    type Collection = {
    id: string
    name: string
    status: Status
    }

    type Discount = {
    id: string
    name: string
    status:Status
    }

    type Sale = {
    id: string
    name: string
    status:Status
    }

    type Category = {
    id: string
    name: string
    }

  type CategoryDialogProps={
    stores:Store[];
    categories?:Category[];
    sales:Sale[];
    discounts:Discount[];
    collections:Collection[];
  }

export const BannerDialog = ({stores,categories,discounts,collections,sales}:CategoryDialogProps) => {
    return(
        <Dialog>
     <DialogTrigger>
        <Button>Create a new banner
          <Plus className="ml-2 h-4 w-4"/>
        </Button>
     </DialogTrigger>
       <DialogContent className="p-0 w-auto overflow-y-scroll h-screen">
    <DialogHeader>
     <BannerForm stores={stores} categories={categories ?? []} sales={sales} discounts={discounts} collections={collections}/>
    </DialogHeader>
  </DialogContent>
</Dialog>

    )
}