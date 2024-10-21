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
import { ImageUploader } from "@/components/image-uploader";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters long" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters long" }),
  images: z.array(z.object({
    url: z.string(),
    key: z.string()
  })),
});

export const StoreForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      images: [],
    },
  });

  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router=useRouter()
  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    startTransition(async () => {
      try {
       const res=await axios.post("/api/stores", values);
        console.log(values);
          toast.success("Store created successfully");
          router.refresh()
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-[480px] mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create Store</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Store name" disabled={
                      isPending || isSubmitting
                    } />
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
                     {...field} placeholder="Store description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                   <ImageUploader { ...field } />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button disabled={isPending || isSubmitting} type="submit">
              {
                isSubmitting ? (
                 <span className="flex items-center gap-2">
                  <Loader className="animate-spin mr-2" />
                  Creating...
                 </span>
                ) : "Create"
              }
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};