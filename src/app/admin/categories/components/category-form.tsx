"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useTransition } from "react";
import React from "react";
import { ImageUploader } from "@/components/image-uploader";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters long" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters long" }),
  images: z.array(z.object({
    url: z.string(),
    key: z.string()
  })),
  storeId: z.string().min(1, { message: "Store is required" }),
  isSubcategory: z.boolean().default(false),
  parentCategoryId: z.string().optional(),
});

type Store = {
  id: string;
  name: string;
};

type Category = {
  id: string;
  name: string;
  parentCategoryId: string | null;
  storeId:string;
};

type CategoryFormProps = {
  stores: Store[];
  categories: Category[];
};

export const CategoryForm = ({ stores, categories }: CategoryFormProps) => {

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      images: [],
      storeId: "",
      isSubcategory: false,
      parentCategoryId: undefined,
    },
  });

  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();

  const watchIsSubcategory = form.watch("isSubcategory");
  const watchStoreId = form.watch("storeId");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    startTransition(async () => {
      try {
        const res = await axios.post(`/api/categories`, {
          ...values,
          parentCategoryId: values.isSubcategory ? values.parentCategoryId : null,
        });
        toast.success("Category created successfully");
        router.refresh();
        form.reset();
      } catch (e) {
        console.error(e);
        toast.error("Something went wrong");
      } finally {
        setIsSubmitting(false);
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-[480px] mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="isSubcategory"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Create as subcategory
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input 
                      disabled={isPending || isSubmitting}
                      {...field}
                      placeholder={watchIsSubcategory ? "Subcategory name" : "Category name"}
                    />
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
                    <Input
                      disabled={isPending || isSubmitting}
                      {...field}
                      placeholder={watchIsSubcategory ? "Subcategory description" : "Category description"}
                    />
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
                  <FormControl>
                    <Select onValueChange={(value) => field.onChange(value)} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a store" />
                      </SelectTrigger>
                      <SelectContent>
                        {stores.map((store) => (
                          <SelectItem key={store.id} value={store.id}>
                            {store.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {watchIsSubcategory && (
              <FormField
                control={form.control}
                name="parentCategoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Category</FormLabel>
                    <FormControl>
                      <Select onValueChange={(value) => field.onChange(value)} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a parent category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories
                            ?.filter(category =>  category.storeId === watchStoreId)
                            ?.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="images"
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
          </CardContent>
          <CardFooter>
            <Button disabled={isPending || isSubmitting} type="submit">
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  Creating...
                  <Loader className="animate-spin" />
                </span>
              ) : (
                watchIsSubcategory ? "Create Subcategory" : "Create Category"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};