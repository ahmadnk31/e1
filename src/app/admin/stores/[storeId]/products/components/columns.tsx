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
import { redirect } from "next/navigation"
import Link from "next/link"
import { formatPrice } from "@/lib/format-price"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.


export type Product={
    id?:string;
    storeId:string;
    name?:string;
    storeName:string;
    price:number;
    stock:number;
    categoryName:string;
    createdAt:string;
}

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "storeName",
    header: "Store",
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
        return formatPrice(row.original.price)
        },
  },
  {
    accessorKey: "stock",
    header: "Stock",
  },
  {
    accessorKey: "categoryName",
    header: "Category",
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
                  <Link href={`/admin/stores/${product.storeId}`}>View store</Link>
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href={`/admin/products/${product.id}`}>View product</Link>
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>View customer</DropdownMenuItem>
                <DropdownMenuItem>View payment details</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
]
