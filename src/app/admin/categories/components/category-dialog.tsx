'use client'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { CategoryForm } from "./category-form"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

type Store={
    id:string;
    name:string;
  }

  type CategoryDialogProps={
    stores:Store[];
    categories?:Category[];
  }
  type Category = {
    id: string;
    name: string;
    parentCategoryId: string | null;
    storeId:string;
  };

export const CategoryDialog = ({stores,categories}:CategoryDialogProps) => {
    return(
        <Dialog>
     <DialogTrigger>
        <Button>Create a new category
          <Plus className="ml-2 h-4 w-4"/>
        </Button>
     </DialogTrigger>
       <DialogContent className="p-0 w-auto overflow-y-scroll h-screen">
    <DialogHeader>
      <CategoryForm stores={stores} categories={categories ?? []}/>
    </DialogHeader>
  </DialogContent>
</Dialog>

    )
}