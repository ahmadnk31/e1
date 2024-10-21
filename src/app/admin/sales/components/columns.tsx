"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, ArrowUpRight, MoreHorizontal, Plus } from "lucide-react"
 
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { redirect, useRouter } from "next/navigation"
import Link from "next/link"
import axios from "axios"
import { toast } from "sonner"
import { StatusCell } from "./actions"


// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

type status="ACTIVE"|"INACTIVE"|"SCHEDULED"|"EXPIRED"

export type Sale={
    id:string;
    name?:string;
    storeName?:string;
    status:status;
    createdAt:string;
}

export const columns: ColumnDef<Sale>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
    {
        accessorKey: "storeName",
        header: "Store",
    }
,
{
accessorKey: "status",
header:( { column }) => {
    return(
        <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
    )
},
cell: ({ row }) => {
    const sale=row.original
    const router=useRouter()
    return(
        <StatusCell
        initialStatus={sale.status}
        onStatusChange={(status) => {
            console.log(status)
            router.refresh()
        }}
        saleId={sale.id}
        />

    )
},
},
    {
        accessorKey: "createdAt",
        header: ({ column }) => {
            return (
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              >
                Date
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            )
          },
    },
    {
        id: "actions",
        cell: ({ row }) => {
          const product=row.original
          const router=useRouter()
          async function handleDelete() {
            try {
              await axios.delete(`/api/products/${product.id}`)
              toast.success("Product deleted successfully")
              router.refresh()
            } catch (e) {
              console.error(e)
              toast.error("Something went wrong")
            }
            // await deleteCategory(row.original.id)
          }
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem>
                  <Link className="flex w-full items-center" href={`/admin/products/${product.id}`}>
                    Open
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                <Link className="flex w-full items-center" href={`/admin/products/${product.id}/variations/new`}>
                  Create variation
                  <Plus className="ml-2 h-4 w-4" />
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
]
