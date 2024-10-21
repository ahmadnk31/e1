"use client";


import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";

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

const formSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters long" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters long" }),
  images: z.array(z.object({
    url: z.string(),
    key: z.string()
  })),
});


type DefaultValues={
    name:string;
    description:string;
    id:string;
    images:{
        url:string;
        key:string;
    }[];
}

export const CategoryUpdateForm = ({name,description,id}:DefaultValues) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name:name|| "",
      description:description|| "",
    },
  });

  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    startTransition(async () => {
      try {
        const res = await axios.patch(`/api/categories/${id}`, {
          ...values
        });
        console.log(values);
        toast.success("Category updated successfully");
        console.log(res.data);
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-[300px] mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Update Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Category name" />
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
                    <Input {...field} placeholder="Category description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
           
          </CardContent>
          <CardFooter>
            <Button disabled={isPending || isSubmitting} type="submit">
              Update
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};