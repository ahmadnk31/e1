import { Button } from "@/components/ui/button"
import { BrandForm } from "./brand-form"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Plus } from "lucide-react"

  type Store={
    id:string
    name:string
  }

  type BrandDialogProps={
    stores:Store[]
  }
  export const BrandDialog=({stores}:BrandDialogProps)=>{
        return(
            <Dialog>
                <DialogTrigger>
                    <Button>
                        Add Brand
                        <Plus className="w-4 h-4 ml-2"/>
                    </Button>
                </DialogTrigger>
                <DialogContent className='p-0 w-auto'>
                    <BrandForm stores={stores}/>
                </DialogContent>
            </Dialog>
        )
    }
