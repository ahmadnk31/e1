"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, ArrowUpRight, MoreHorizontal } from "lucide-react"
 
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

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.


export type Brand={
    id:string;
    name:string;
    storeName:string;
    storeId:string;
    description:string;
    createdAt:string;
}

export const columns: ColumnDef<Brand>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey:"storeName",
    header:"Store"
  },
 
  {
    accessorKey: "description",
    header: "Description",
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
          const brand=row.original
          const router=useRouter()
          async function handleDelete() {
            try {
              await axios.delete(`/api/brands/${brand.id}`)
              toast.success("Brand deleted successfully")
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
                  <Link href={`/admin/brands/${brand.id}`}>Edit brand</Link>
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href={`/admin/stores/${brand.storeId}/products`}>View store</Link>
                  <ArrowUpRight className="ml-2 h-4 w-4" />
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
