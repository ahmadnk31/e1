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
import { ProductVariationCollectionCell, ProductVariationDiscountCell, ProductVariationSaleCell } from "./actions"

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

export type ProductVariation={
    id:string;
    productId:string;
    name:string;
    productName:string;
    price?:number;
    stock?:number;
    createdAt:string;
    sales:Sale[];
    saleId:string;
    saleName:string;
    collectionName:string;
    collectionId:string;
    collections:Collection[]
    discounts:Discount[]
    discountName:string;
    discountId:string;
}

export const columns: ColumnDef<ProductVariation>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "productName",
    header: "Product",
  },
  {
    accessorKey: "price",
    header: "Price",
  },
  {
    accessorKey: "stock",
    header: "Stock",
  },
  {
    accessorKey: "saleName",
    header: "Sale",
    cell: ({ row }) => {
      const productvariation = row.original
      const router=useRouter();
      return (
        <ProductVariationSaleCell
          productId={productvariation.productId}
          currentSaleId={productvariation.saleId}
          initialSaleName={productvariation.saleName}
          variantId={productvariation.id}
          sales={productvariation.sales}
          onSaleChange={() => {
            // You can add additional logic here if needed
            console.log('Sale changed:')
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
      const productvariation = row.original
      const router=useRouter();
      return (
        <ProductVariationDiscountCell
          productId={productvariation.productId}
          currentDiscountId={productvariation.discountId}
          initialDiscountName={productvariation.discountName}
          variantId={productvariation.id}
          discounts={productvariation.discounts}
          onDiscountChange={() => {
            // You can add additional logic here if needed
            console.log('Sale changed:')
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
      const productvariation = row.original
      const router=useRouter();
      return (
        <ProductVariationCollectionCell
          productId={productvariation.productId}
          currentCollectionId={productvariation.collectionId}
          initialCollectionName={productvariation.collectionName}
          variantId={productvariation.id}
          collections={productvariation.collections}
          onCollectionChange={() => {
            // You can add additional logic here if needed
            console.log('Sale changed:')
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
          const productvariation=row.original
          const router=useRouter()
          async function handleDelete() {
            try {
              await axios.delete(`/api/variants/${productvariation.id}`)
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
                  <Link className="flex w-full items-center" href={`/admin/products/${productvariation.id}`}>
                    Edit variation
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Link>
                  
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link className="flex w-full items-center" href={`/admin/products/${productvariation.productId}`}>
                    Open product
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
