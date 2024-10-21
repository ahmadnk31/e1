'use client'
import { useState } from "react"
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
  collectionId: string
  onStatusChange?: (newStatus: Status) => void
}

export const StatusCell = ({ initialStatus, collectionId, onStatusChange }: StatusCellProps) => {
  const [status, setStatus] = useState<Status>(initialStatus)
  const [isLoading, setIsLoading] = useState(false)

  const handleStatusChange = async (newStatus: Status) => {
    setIsLoading(true)
    try {
      // Replace with your actual API endpoint
      await axios.patch(`/api/collections/${collectionId}`, {
        status: newStatus
      })
      
      setStatus(newStatus)
      onStatusChange?.(newStatus)
      toast.success("Collection updated successfully")
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