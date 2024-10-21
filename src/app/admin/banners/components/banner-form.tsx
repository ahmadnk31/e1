"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import axios from 'axios'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Loader } from 'lucide-react'
import { ImageUploader } from '@/components/image-uploader'

const formSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  buttonText: z.string().optional(),
  buttonLink: z.string().optional(),
  storeId: z.string().min(1, "Store is required"),
  collectionId: z.string().optional(),
  discountId: z.string().optional(),
  saleId: z.string().optional(),
  categoryId: z.string().optional(),
  image: z.array(z.object({
    url: z.string().min(1, "Image is required"),
    key: z.string().min(1, "Image is required"),
  }))
})

type Status = "ACTIVE" | "INACTIVE" | "SCHEDULED" | "EXPIRED"

type Store = {
    id: string
    name: string
    }

    type Collection = {
    id: string
    name: string
    status: Status  
    }

    type Discount = {
    id: string
    name: string
    status:Status
    }

    type Sale = {
    id: string
    name: string
    status:Status
    }

    type Category = {
    id: string
    name: string

    }

    type BannerFormProps = {
    stores: Store[]
    collections: Collection[]
    discounts: Discount[]
    sales: Sale[]
    categories: Category[]
    }

export function BannerForm({ stores, collections, discounts, sales, categories }: BannerFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      buttonText: "",
      buttonLink: "",
      storeId: "",
      collectionId: "",
      discountId: "",
      saleId: "",
      categoryId: "",
        image: [],
    },
  })

  const router=useRouter()

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const response = await axios.post('/api/banners', values)
      toast.success('Banner created successfully')
        form.reset()
        router.refresh()
      // Handle success (e.g., show a success message, reset form, etc.)
    } catch (error) {
      // Handle error (e.g., show error message)
      console.error('Error creating banner:', error)
        toast.error('Failed to create banner')
    } finally {
      setIsLoading(false)
    }
  }

  return (
   <Card className="min-w-[380px] mx-auto">
    <CardHeader>
        <h2 className="text-xl font-semibold">Create a new banner</h2>
    </CardHeader>
    <CardContent>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Banner name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Banner description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="buttonText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Button Text</FormLabel>
              <FormControl>
                <Input placeholder="Button text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="buttonLink"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Button Link</FormLabel>
              <FormControl>
                <Input placeholder="Button link" {...field} type='link' />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <ImageUploader {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="storeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Store</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a store" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {/* Add store options here */}
                  {
                    stores.map(store=>(
                      <SelectItem key={store.id} value={store.id}>{store.name}</SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
        <FormField
          control={form.control}
          name="collectionId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Collection</FormLabel>
              <Select 
              disabled={isLoading}
              onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a collection" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {/* Add store options here */}
                  {
                    collections.map(collection=>(
                      <SelectItem 
                      disabled={collection.status === "INACTIVE"||collection.status === "EXPIRED"}
                      key={collection.id} value={collection.id}>{collection.name}</SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select 
              disabled={isLoading}
              onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {/* Add store options here */}
                    {
                        categories.map(category=>(
                        <SelectItem 
                        key={category.id} value={category.id}>{category.name}</SelectItem>
                        ))
                    }
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
        <FormField
          control={form.control}
          name="discountId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Discount</FormLabel>
              <Select 
              disabled={isLoading}
              onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a discount" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {/* Add store options here */}
                  {
                    discounts.map(discount=>(
                      <SelectItem 
                      disabled={discount.status === "INACTIVE"||discount.status === "EXPIRED"}
                      key={discount.id} value={discount.id}>{discount.name}</SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="saleId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sale</FormLabel>
              <Select 
              disabled={isLoading}
              onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a sale" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {/* Add store options here */}
                  {
                    sales.map(sale=>(
                      <SelectItem 
                        disabled={sale.status === "INACTIVE"||sale.status === "EXPIRED"}
                      key={sale.id} value={sale.id}>{sale.name}</SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>

              <FormMessage />
            </FormItem>
          )}
        />
        </div>
        {/* Add similar FormField components for collectionId, discountId, saleId, and categoryId */}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center">
              <Loader className="animate-spin mr-2"/>
              Creating Banner
            </span>
          ) : "Create Banner"}
        </Button>
      </form>
    </Form>
    </CardContent>
    </Card>
  )
}