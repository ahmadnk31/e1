import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
 
  
import {Plus} from "lucide-react";
import { VariationForm } from "./variation-form";
type Product={
    id:string
    name:string
}

type VariationDialogProps = {
    products?: Product[]
}

  
export const VariationDialog = ({products}:VariationDialogProps) => {
    return(
        <Dialog>
     <DialogTrigger asChild>
        <Button>Create a new variation
          <Plus className="ml-2 h-4 w-4"/>
        </Button>
     </DialogTrigger>
       <DialogContent className="w-auto p-0 h-screen overflow-y-scroll">
    <DialogHeader>
      <VariationForm products={products}/>
    </DialogHeader>
  </DialogContent>
</Dialog>

    )
}
