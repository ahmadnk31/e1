'use client'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {SaleForm} from "./sales-form";

type Store={
    id:string,
    name:string
}
type SaleDialogProps={
    stores:Store[]
}
export const SaleDialog = ({stores}:SaleDialogProps) => {
    return(
        <Dialog>
     <DialogTrigger>
        <Button>Create a new sale
          <Plus className="ml-2 h-4 w-4"/>
        </Button>
     </DialogTrigger>
       <DialogContent className="p-0 w-auto h-screen overflow-y-scroll">
    <DialogHeader>
      <SaleForm stores={stores}/>
    </DialogHeader>
  </DialogContent>
</Dialog>

    )
}