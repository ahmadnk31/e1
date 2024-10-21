"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, ArrowUpRight, MoreHorizontal } from "lucide-react"
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
import { prisma } from "@/lib/prisma"
import { CategoryCollectionCell, CategoryDiscountCell, SaleCell } from "./actions"


// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

type Status="ACTIVE"|"INACTIVE"|"SCHEDULED"|"EXPIRED"

type Discount={
  id:string;
  name:string;
  status:Status;
}

type Collection={
  id:string;
  name:string;
  status:Status;
}


type Sale={
  id:string;
  name:string;
  status:Status;
}

export type Category={
    id:string;
    storeId:string;
    name:string;
    storeName:string;
    parentName:string;
    sales:Sale[];
    saleName:string;
    saleId:string;
    createdAt:string;
    discountName:string;
    discountId:string;
    discounts:Discount[]
    collectionName:string;
    collectionId:string;
    collections:Collection[]

}

export const columns: ColumnDef<Category>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "parentName",
    header: "Parent category",
  },
  {
    accessorKey: "storeName",
    header: "Store name",
  },
  {
    accessorKey: "saleName",
    header: "Sale name",
    cell: ({ row }) => {
      const category = row.original
      console.log(category)
      return (
        <SaleCell
        initialSaleName={category.saleName||''}
          categoryId={category.id || ''}
          currentSaleId={category.saleId}
          sales={category.sales}
          onSaleChange={(newSaleId) => {
            // You can add additional logic here if needed
            console.log('Sale changed:', newSaleId)
          }}
        />
      )
    }
  },
  {
    accessorKey: "discountName",
    header: "Discount name",
    cell: ({ row }) => {
      const category = row.original
      const router = useRouter()
      return (
        <CategoryDiscountCell
        initialDiscountName={category.discountName||''}
          categoryId={category.id || ''}
          currentDiscountId={category.discountId}
          discounts={category.discounts}
          onDiscountChange={() => {
            // You can add additional logic here if needed
            console.log('Discount changed:')
            router.refresh()
          }}
        />
      )
    }
  },
  {
    accessorKey: "collectionName",
    header: "Collection name",
    cell: ({ row }) => {
      const category = row.original
      const router = useRouter()
      return (
        <CategoryCollectionCell
        initialCollectionName={category.collectionName||''}
          categoryId={category.id || ''}
          currentCollectionId={category.collectionId}
          collections={category.collections}
          onCollectionChange={() => {
            // You can add additional logic here if needed
            console.log('Collection changed:')
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
      const router = useRouter()
      const category = row.original

      async function handleDelete() {
        try {
          await axios.delete(`/api/categories/${category.id}`)
          toast.success("Category deleted successfully")
          router.refresh()
        } catch (e) {
          console.error(e)
          toast.error("Something went wrong")
        }
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
              <Link href={`/admin/categories/${category.id}`}>
                Edit category
              </Link>
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href={`/admin/stores/${category.storeId}`}>
                View store
              </Link>
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