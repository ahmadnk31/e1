"use client"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import { ImageUploader } from "@/components/image-uploader"
import { useTransition } from "react"
import React from "react"
import { Loader, X } from "lucide-react"
import axios from "axios"
import { useRouter } from "next/navigation"

const formSchema = z.object({
  sku: z.string().min(3, { message: "SKU must be at least 3 characters long" }),
  name: z.string().min(3, { message: "Name must be at least 3 characters long" }),
  description: z.string().optional(),
  price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0.01, {
    message: "Price must be a number and at least 0.01"
  }),
  stock: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0, {
    message: "Stock must be a whole number and at least 0"
  }),
  image: z.array(z.object({
    url: z.string().min(1, { message: "Image is required" }),
    key: z.string().min(1, { message: "Image is required" })
  })).optional(),
  productId: z.string().min(1, { message: "Product is required" }),
  attributes: z.array(z.object({
    name: z.string().min(1, { message: "Attribute name is required" }),
    value: z.string().min(1, { message: "Attribute value is required" })
  }))
})

type Product = {
  id: string
  name: string
}

type VariationFormProps = {
  products?: Product[],
}

export const VariationForm = ({ products }: VariationFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sku: "",
      name: "",
      description: "",
      price: "",
      stock: "",
      image: [],
      productId: "",
      attributes: []
    },
  })

  const { fields: attributeFields, append: appendAttribute, remove: removeAttribute } = useFieldArray({
    control: form.control,
    name: "attributes"
  })

  const router = useRouter()
  const [submitting, setSubmitting] = React.useState(false)
  const [pending, startTransition] = useTransition()

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setSubmitting(true)
    startTransition(async () => {
      try {
        const formattedValues = {
          ...values,
          price: parseFloat(values.price),
          stock: parseInt(values.stock)
        }
        
        const res = await axios.post('/api/variants', formattedValues)
        toast.success('Variant created successfully')
        router.push(`/admin/products`)
      } catch (e) {
        console.error(e)
        toast.error('Something went wrong')
      } finally {
        setSubmitting(false)
      }
    })
  }

  const isLoading = submitting || pending

  return (
    <Card className="max-w-[600px] mx-auto">
      <CardHeader>
        <CardTitle>Create Product Variant</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input 
                        disabled={isLoading}
                        placeholder="VAR-001" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Variant Name</FormLabel>
                    <FormControl>
                      <Input 
                        disabled={isLoading}
                        placeholder="e.g. iPhone 15 Pro - 256GB - Red" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      disabled={isLoading}
                      placeholder="Variant description" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input 
                        disabled={isLoading}
                        placeholder="0.00" 
                        type="number" 
                        step="0.01"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock</FormLabel>
                    <FormControl>
                      <Input 
                        disabled={isLoading}
                        placeholder="0" 
                        type="number" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product</FormLabel>
                  <Select 
                    disabled={isLoading}
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products?.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>Variant Attributes</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  onClick={() => appendAttribute({ name: '', value: '' })}
                >
                  Add Attribute
                </Button>
              </div>

              {attributeFields.map((field, index) => (
                <div key={field.id} className="flex gap-4 items-start">
                  <div className="grid grid-cols-2 gap-4 flex-1">
                    <FormField
                      control={form.control}
                      name={`attributes.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              disabled={isLoading}
                              placeholder="Attribute name (e.g. Color)" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`attributes.${index}.value`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              disabled={isLoading}
                              placeholder="Value (e.g. Red)" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={isLoading}
                    onClick={() => removeAttribute(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Images</FormLabel>
                  <FormControl>
                    <ImageUploader {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              disabled={isLoading}
              type="submit"
              className="w-full"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Creating Variant...</span>
                </div>
              ) : 'Create Variant'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}