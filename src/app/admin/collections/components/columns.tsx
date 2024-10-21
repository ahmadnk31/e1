"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, ArrowUpRight, Clock, MoreHorizontal } from "lucide-react"
 import { toast } from "sonner"
import { Button } from "@/components/ui/button"
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
import { StatusCell } from "./actions"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

type Status="ACTIVE"|"INACTIVE"|"SCHEDULED"|"EXPIRED"

export type Collection={
    id:string;
    name:string;
    storeId?:string;
    storeName?:string;
    status:Status;
    createdAt:string;
}

export const columns: ColumnDef<Collection>[] = [
  {
    accessorKey: "name",
    header: "Name",
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
        return (
         <StatusCell
         collectionId={row.original.id}
            initialStatus={status}
            onStatusChange={(status) => {
              console.log(status)
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
                    <Link className='flex w-full items-center' href={`/admin/stores/${collection.storeId}`}>
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
