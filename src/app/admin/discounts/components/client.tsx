'use client'
import { useState } from "react"
import { z } from "zod"
import axios from "axios"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Status = "ACTIVE" | "INACTIVE" | "SCHEDULED" | "EXPIRED"

interface StatusCellProps {
  initialStatus: Status
  discountId: string
  onStatusChange?: (newStatus: Status) => void
}

export const StatusCell = ({ initialStatus, discountId, onStatusChange }: StatusCellProps) => {
  const [status, setStatus] = useState<Status>(initialStatus)
  const [isLoading, setIsLoading] = useState(false)

  const handleStatusChange = async (newStatus: Status) => {
    setIsLoading(true)
    try {
      // Replace with your actual API endpoint
      await axios.patch(`/api/discounts/${discountId}`, {
        status: newStatus
      })
      
      setStatus(newStatus)
      onStatusChange?.(newStatus)
      toast.success("Status updated successfully")
    } catch (error) {
      toast.error("Failed to update status")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Select
      disabled={isLoading}
      value={status}
      onValueChange={(value: Status) => handleStatusChange(value)}
      defaultValue={initialStatus}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select status" />
      </SelectTrigger>
      <SelectContent>
        {["ACTIVE", "INACTIVE", "SCHEDULED", "EXPIRED"].map((status) => (
            <SelectItem key={status} value={status}>
                {status.toLocaleLowerCase()}
            </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}