"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import axios from "axios"
import { useRouter } from "next/navigation"

type Status = "ACTIVE" | "INACTIVE" | "SCHEDULED" | "EXPIRED"

// Types
type Sale = {
  id: string
  name: string
  status: Status
}

interface SaleCellProps {
  productId: string
  currentSaleId: string | null
  initialSaleName: string
  sales: Sale[]
  onSaleChange?: (newSaleId: string | null) => void
}

export const ProductSaleCell = ({ 
  productId, 
  currentSaleId, 
  sales, 
  onSaleChange,
  initialSaleName 
}: SaleCellProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSaleChange = async (newSaleId: string) => {
    setIsLoading(true)
    try {
      // Create the request body
      const updateData = {
        saleId: newSaleId === "none" ? null : newSaleId
      }

      console.log('Sending update request:', {
        productId,
        updateData
      })

      const response = await axios.patch(`/api/products/${productId}`, updateData)

      if (response.status === 200) {
        onSaleChange?.(newSaleId === "none" ? null : newSaleId)
        toast.success("Product Sale updated successfully")
        router.refresh()
      } else {
        throw new Error(`Unexpected response status: ${response.status}`)
      }
    } catch (error) {
      toast.error("Failed to update product sale")
      if (axios.isAxiosError(error)) {
        console.error('Axios error:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        })
      } else {
        console.error('Unexpected error:', error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      {sales.length > 0 && (
        <Select
          disabled={isLoading}
          value={currentSaleId || "none"}
          onValueChange={handleSaleChange}
          defaultValue={currentSaleId || "none"}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a sale">
              {currentSaleId 
                ? sales.find(s => s.id === currentSaleId)?.name 
                : "No sale selected"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No sale</SelectItem>
            {sales.map((sale) => (
              <SelectItem
              disabled={sale.status === "EXPIRED"||sale.status === "INACTIVE"}
               key={sale.id} value={sale.id}>
                {sale.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}


// Types
type Discount = {
  id: string
  name: string
    status: Status
}

interface DiscountCellProps {
  productId: string
  currentDiscountId: string | null
  initialDiscountName: string
  discounts: Discount[]
  onDiscountChange?: (newDiscountId: string | null) => void
}

export const ProductDiscountCell = ({ 
  productId, 
  currentDiscountId, 
  discounts, 
  onDiscountChange,
  initialDiscountName 
}: DiscountCellProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleDiscountChange = async (newDiscountId: string) => {
    setIsLoading(true)
    try {
      // Create the request body
      const updateData = {
        discountId: newDiscountId === "none" ? null : newDiscountId
      }

      console.log('Sending update request:', {
        productId,
        updateData
      })

      const response = await axios.patch(`/api/products/${productId}`, updateData)

      if (response.status === 200) {
        onDiscountChange?.(newDiscountId === "none" ? null : newDiscountId)
        toast.success("Product Discount updated successfully")
        router.refresh()
      } else {
        throw new Error(`Unexpected response status: ${response.status}`)
      }
    } catch (error) {
      toast.error("Failed to update product discount")
      if (axios.isAxiosError(error)) {
        console.error('Axios error:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        })
      } else {
        console.error('Unexpected error:', error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      {discounts.length > 0 && (
        <Select
          disabled={isLoading}
          value={currentDiscountId || "none"}
          onValueChange={handleDiscountChange}
          defaultValue={currentDiscountId || "none"}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a discount">
              {currentDiscountId 
                ? discounts.find(s => s.id === currentDiscountId)?.name 
                : "No discount selected"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No discount</SelectItem>
            {discounts.map((discount) => (
              <SelectItem 
                disabled={discount.status === "INACTIVE"||discount.status === "EXPIRED"}
              key={discount.id} value={discount.id}>
                {discount.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}

// Types
type Collection = {
    id: string
    name: string
    status: Status
  }
  
  interface ProductCollectionCellProps {
    productId: string
    currentCollectionId: string | null
    initialCollectionName: string
    collections: Collection[]
    onCollectionChange?: (newCollectionId: string | null) => void
  }
  
  export const ProductCollectionCell = ({ 
    productId, 
    currentCollectionId, 
    collections, 
    onCollectionChange,
    initialCollectionName 
  }: ProductCollectionCellProps) => {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
  
    const handleCollectionChange = async (newCollectionId: string) => {
      setIsLoading(true)
      try {
        // Create the request body
        const updateData = {
          collectionId: newCollectionId === "none" ? null : newCollectionId
        }
  
        console.log('Sending update request:', {
          productId,
          updateData
        })
  
        const response = await axios.patch(`/api/products/${productId}`, updateData)
  
        if (response.status === 200) {
          onCollectionChange?.(newCollectionId === "none" ? null : newCollectionId)
          toast.success("Product Collection updated successfully")
          router.refresh()
        } else {
          throw new Error(`Unexpected response status: ${response.status}`)
        }
      } catch (error) {
        toast.error("Failed to update product discount")
        if (axios.isAxiosError(error)) {
          console.error('Axios error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
          })
        } else {
          console.error('Unexpected error:', error)
        }
      } finally {
        setIsLoading(false)
      }
    }
  
    return (
      <div>
        {collections.length > 0 && (
          <Select
            disabled={isLoading}
            value={currentCollectionId || "none"}
            onValueChange={handleCollectionChange}
            defaultValue={currentCollectionId || "none"}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a collection">
                {currentCollectionId 
                  ? collections.find(s => s.id === currentCollectionId)?.name 
                  : "No collection selected"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No collection</SelectItem>
              {collections.map((collection) => (
                <SelectItem 
                disabled={collection.status === "INACTIVE"||collection.status === "EXPIRED"}
                key={collection.id} value={collection.id}>
                  {collection.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    )
  }