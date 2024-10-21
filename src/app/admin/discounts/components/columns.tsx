"use client"
import { z } from "zod"

  
import { Button } from "@/components/ui/button"


import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, ArrowUpRight, Clock, MoreHorizontal, Router } from "lucide-react"
 import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import Link from "next/link"
import axios from "axios"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { StatusCell } from "./client"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

type status="ACTIVE"|"INACTIVE"|"SCHEDULED"|"EXPIRED"



export type Discount={
    id:string;
    name:string;
    value:string;
    storeName:string;
    status:status;
    code:string;
}

export const columns: ColumnDef<Discount>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "value",
    header: "Value",
  },
  {
    accessorKey: "code",
    header: "Code",
  },
    {
        accessorKey: "storeName",
        header: "Store",
    },
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
        const status = row.original.status
        const router=useRouter()
        console.log(status)
        return(
            <StatusCell
            initialStatus={status}
            discountId={row.original.id}
            onStatusChange={(newStatus) => {
                // Assuming you have a state management solution to update the row data
                // For example, you might use a function passed down as a prop to update the data
                // updateRowStatus(row.original.id, newStatus)
                // Or you can directly update the data source if it's managed in a parent component
                // Here is a placeholder function call
                router.refresh()
            }}
            />
        )
    }
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
          const router=useRouter()
          async function handleDelete() {
            try {
              await axios.delete(`/api/collections/${row.original.id}`)
              toast.success("Collection deleted successfully")
              router.refresh()
            } catch (e) {
              console.error(e)
              toast.error("Something went wrong")
            }
            // await deleteCategory(row.original.id)
          }
          const collection=row.original
     
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
                <DropdownMenuItem
                >
                    <Link className='flex w-full items-center' href={`/admin/collections/${collection.id}`}>
                    Edit collection
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                >
                    <Link className='flex w-full items-center' href={`/admin/stores/`}>
                    View store
                    <ArrowUpRight className="ml-2 h-4 w-4" />
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
