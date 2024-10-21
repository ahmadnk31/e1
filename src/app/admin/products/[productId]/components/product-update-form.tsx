'use client'

import React, { useTransition } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUploader } from "@/components/image-uploader";
import { Textarea } from "@/components/ui/textarea";
import { Loader, X } from "lucide-react";
import {useRouter} from 'next/navigation'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { deleteImage } from "../actions";
const formSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters long" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters long" }),
  sku: z.string().min(3, { message: "SKU must be at least 3 characters long" }),
  manufacturer: z.string().optional(),
  basePrice: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0.01, {
    message: "Base price must be a number and at least 0.01"
  }),
  image: z.array(z.object({
    url: z.string().min(1, { message: "Image is required" }),
    key: z.string().min(1, { message: "Image is required" }),
  })),
  categoryId: z.string().min(1, { message: "Category is required" }),
  collectionId: z.string().optional(),
  discountId: z.string().optional(),
  saleId: z.string().optional(),
  brandId: z.string().optional(),
  variants: z.array(
    z.object({
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
      attributes: z.array(z.object({
        name: z.string().min(1, { message: "Attribute name is required" }),
        value: z.string().min(1, { message: "Attribute value is required" })
      }))
    })
  ).optional()
});

type Category = {
  id: string;
  name: string;
  parentName: string;
};

type Sale = {
  id: string;
  name: string;
};

type Collection = {
  id: string;
  name: string;
};

type Discount = {
  id: string;
  name: string;
};

type Brand = {
  id: string;
  name: string;
};

type Image = {
  url:string
  key:string,
  id?:string
}


type ProductUpdateFormProps = {
  id: string;
  categories: Category[];
  sales?: Sale[];
  collections?: Collection[];
  discounts?: Discount[];
  brands?: Brand[];
  images?:Image[],
  variantImages?:Image[]
  defaultValues: z.infer<typeof formSchema>;
};

export const ProductUpdateForm = ({ 
  id, 
  categories, 
  sales, 
  collections, 
  discounts, 
  brands, 
  images,
  variantImages,
  defaultValues 
}: ProductUpdateFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router=useRouter()
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    startTransition(async () => {
      try {
        const formattedValues = {
          ...values,
          basePrice: parseFloat(values.basePrice),
          variants: values.variants?.map(variant => ({
            ...variant,
            price: parseFloat(variant.price),
            stock: parseInt(variant.stock)
          }))
        };

        const res = await axios.patch(`/api/products/${id}`, formattedValues);
        toast.success("Product updated successfully");
        router.refresh()
      } catch (e) {
        console.error(e);
        toast.error("Something went wrong");
      } finally {
        setIsSubmitting(false);
      }
    });
  }
  async function handleDeleteImage(key:string,id:string){
    const deleted=await deleteImage(key,id)
    if(deleted?.status===200){
      toast.success(deleted?.message)
      router.refresh()
    }else{
      toast.error(deleted?.message)
    }
    console.log(`delete image ${key}`)
  }



  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Update Product Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Product name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Product SKU" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="brandId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a brand" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {brands?.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="manufacturer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manufacturer</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Manufacturer name" />
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
                    <Textarea {...field} placeholder="Product description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="basePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base Price</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="0.00" type="text" />
                  </FormControl>
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name} <span className="text-ms text-muted-foreground">{category.parentName}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="collectionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Collection</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a collection" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {collections?.map((collection) => (
                        <SelectItem key={collection.id} value={collection.id}>
                          {collection.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="discountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discount</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a discount" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {discounts?.map((discount) => (
                        <SelectItem key={discount.id} value={discount.id}>
                          {discount.name}
                        </SelectItem>
                      ))}
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
                  <FormLabel>Sale (optional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a sale" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sales?.map((sale) => (
                        <SelectItem key={sale.id} value={sale.id}>
                          {sale.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <Carousel>
                      <CarouselContent>
                        {images?.map((image) => (
                          <CarouselItem className="relative" key={image.key}>
                           <Button
                              type="button"
                             variant='ghost'
                             size='icon'
                              onClick={async() => {
                                await handleDeleteImage(image.key,image?.id||'')
                                const updatedImages = images.filter((img) => img.key !== image.key);
                                form.setValue('image', updatedImages);
                              }}
                           className="absolute top-2 right-2"
                           >
                            <X className="w-4 h-4" />
                           </Button>
                            <img src={image.url} alt="Product image" className="w-full h-full object-cover" />
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious type='button' />
                      <CarouselNext type='button' />
                    </Carousel>
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Images</FormLabel>
                 
                  <FormControl>
                    <ImageUploader {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Variants Section */}
        <Card>
          <CardHeader>
            <CardTitle>Product Variants</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {variantFields.map((field, index) => (
              <Card key={field.id} className="p-4 border">
                <CardHeader>
                  <CardTitle className="text-lg">Variant #{index + 1}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name={`variants.${index}.sku`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Variant SKU</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="VAR-001" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`variants.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Variant Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g. iPhone 15 Pro - 256GB - Red" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`variants.${index}.price`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="0.00" type="text" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`variants.${index}.stock`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stock</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="0" type="number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`variants.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Variant description" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  

                  {/* Variant Attributes */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <FormLabel>Attributes</FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const variants = form.getValues('variants');
                          const updatedVariants = variants ?? [];
                          updatedVariants[index].attributes = [...(updatedVariants[index].attributes || []), { name: '', value: '' }];
                          form.setValue('variants', updatedVariants);
                        }}
                      >
                        Add Attribute
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {form.watch(`variants.${index}.attributes`)?.map((_, attrIndex) => (
                        <div key={attrIndex} className="w-full">
                          <div className='flex items-center gap-2 w-full'>
                            <FormField
                              control={form.control}
                              name={`variants.${index}.attributes.${attrIndex}.name`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input {...field} placeholder="Attribute name" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`variants.${index}.attributes.${attrIndex}.value`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input {...field} placeholder="Attribute value" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button
                              type="button"
                              variant='ghost'
                              size="icon"
                              onClick={() => {
                                const variants = form.getValues('variants');
                                const updatedVariants = variants ?? [];
                                updatedVariants[index].attributes.splice(attrIndex, 1);
                                form.setValue('variants', updatedVariants);
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Carousel>
                          <CarouselContent>
                            {variantImages?.map((image:Image) => (
                              <CarouselItem key={image.key}>
                                <Button
                                  type="button"
                                  variant='ghost'
                                  size='icon'
                                  onClick={async() => {
                                    await handleDeleteImage(image.key,image?.id||'')
                                    const updatedImages = variantImages.filter((img) => img.key !== image.key);
                                    form.setValue(`variants.${index}.image`, updatedImages);
                                  }}
                                  className="absolute top-2 right-2"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                                <img src={image.url} alt="Product image" className="w-full h-full object-cover" />
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          <CarouselPrevious  type='button' />
                          <CarouselNext type="button"/>
                        </Carousel>
                  <FormField
                    control={form.control}
                    name={`variants.${index}.image`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Variant Images</FormLabel>
                       
                        <FormControl>
                          <ImageUploader {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => removeVariant(index)}
                  >
                    Remove Variant
                  </Button>
                </CardContent>
              </Card>
            ))}

            <Button
              type="button"
              onClick={() => appendVariant({
                sku: '',
                name: '',
                description: '',
                price: '',
                stock: '',
                attributes: [],
                image: []
              })}
            >
              Add Variant
            </Button>
          </CardContent>
        </Card>
        <CardFooter>
          <Button disabled={isPending || isSubmitting} type="submit" className="w-full">
            {isPending || isSubmitting ? (
              <span className="flex items-center gap-2">
                Updating Product
                <Loader className="w-4 h-4 animate-spin" />
              </span>
            ) : 'Update Product'}
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
};