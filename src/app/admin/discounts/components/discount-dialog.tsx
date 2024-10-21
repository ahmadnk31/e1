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
import { DiscountForm } from "./discount-form"


type store={
    id:string;
    name:string;
  }
  
  type DiscountDialogProps={
    stores:store[];
    discounts?:Discount[];
  }
  type Discount = {
    id: string;
    name: string;
    storeId:string;
    discount:number;
  };


export const DiscountDialog = ({stores}:DiscountDialogProps) => {
    return(
        <Dialog>
     <DialogTrigger>
        <Button>Create a new discount
          <Plus className="ml-2 h-4 w-4"/>
        </Button>
     </DialogTrigger>
       <DialogContent className="p-0 w-auto overflow-y-scroll h-screen">
    <DialogHeader>
     <DiscountForm stores={stores}/>
    </DialogHeader>
  </DialogContent>
</Dialog>

    )
}