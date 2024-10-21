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
import { StoreForm } from "./store-form";
import { Plus } from "lucide-react";


export const StoreDialog = () => {
    return(
        <Dialog>
             <DialogTrigger>
        <Button>Create a new store
          <Plus className="ml-2 h-4 w-4"/>
        </Button>
             </DialogTrigger>
       <DialogContent className="w-auto p-0">
    <DialogHeader>
      <StoreForm/>
    </DialogHeader>
  </DialogContent>
</Dialog>

    )
}