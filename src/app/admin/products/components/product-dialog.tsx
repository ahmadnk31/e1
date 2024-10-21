'use client'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Category, ProductForm,Brand,Collection,Discount,Sale } from "./product-form"
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";




type ProductDialogProps={
    categories:Category[],
    sales:Sale[],
    collections:Collection[],
    discounts:Discount[],
    brands:Brand[]
}
export const ProductDialog = ({categories,brands,sales,discounts,collections}:ProductDialogProps) => {
    return(
        <Dialog>
     <DialogTrigger asChild>
        <Button>Create a new product
          <Plus className="ml-2 h-4 w-4"/>
        </Button>
     </DialogTrigger>
       <DialogContent className="p-0 w-auto h-screen overflow-y-scroll">
    <DialogHeader>
      <ProductForm 
      brands={brands}
      sales={sales}
      collections={collections}
      discounts={discounts}
      categories={categories}/>
    </DialogHeader>
  </DialogContent>
</Dialog>

    )
}