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
import { ProductCollectionCell, ProductDiscountCell, ProductSaleCell } from "./actions"


// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

type Status="ACTIVE"|"INACTIVE"|"SCHEDULED"|"EXPIRED"

type Sale={
  id:string;
  name:string;
  status:Status;
}

type Discount={
  id:string;
  name:string;
  status:Status;
}

type Collection={
  id:string
  name:string
  status:Status
}

export type Product={
    id:string;
    name:string;
    manufacturer:string,
    storeName?:string;
    categoryName:string;
    saleName:string
    sales:Sale[];
    saleId:string;
    discountName:string;
    discountId:string;
    discounts:Discount[]
    collectionName:string;
    collectionId:string;
    collections:Collection[]
    createdAt:string;
}

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey:"manufacturer",
    header:"Manufacturer"
  },
    {
        accessorKey: "storeName",
        header: "Store Name"
    },
  {
    accessorKey: "categoryName",
    header: "Category",
  },{
    accessorKey: "saleName",
    header: "Sale",
    cell: ({ row }) => {
      const product = row.original
      const router=useRouter();
      return (
        <ProductSaleCell
          productId={product.id}
          currentSaleId={product.saleId}
          initialSaleName={product.saleName}
          sales={product.sales}
          onSaleChange={() => {
            router.refresh()
          }}
        />
      )
    }
  },
  {
    accessorKey: "discountName",
    header: "Discount",
    cell: ({ row }) => {
      const product = row.original
      const router=useRouter();
      return (
        <ProductDiscountCell
          productId={product.id}
          currentDiscountId={product.discountId}
          initialDiscountName={product.discountName}
          discounts={product.discounts}
          onDiscountChange={() => {
            router.refresh()
          }}
        />
      )
    }
  },
  {
    accessorKey: "collectionName",
    header: "Collection",
    cell: ({ row }) => {
      const product = row.original
      const router=useRouter();
      return (
        <ProductCollectionCell
          productId={product.id}
          currentCollectionId={product.collectionId}
          initialCollectionName={product.collectionName}
          collections={product.collections}
          onCollectionChange={() => {
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
