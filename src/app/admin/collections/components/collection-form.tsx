
'use client'
import React, { useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, sub, addDays } from 'date-fns';
import { Calendar as CalendarIcon, Loader } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ImageUploader } from '@/components/image-uploader';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SCHEDULED", "EXPIRED"]),
  startDate: z.date(),
  endDate: z.date(),
  storeId: z.string().min(1, { message: "Store is required" }),
  image: z.array(z.object({
    url: z.string().min(1, { message: "Image is required" }),
    key: z.string().min(1, { message: "Image is required" })
  })).optional(),
}).refine((data) => {
  // Ensure end date is after start date
  return data.endDate >= data.startDate;
}, {
  message: "End date must be after start date",
  path: ["endDate"]
});

type store={
    id:string
    name:string
}
type CollectionFormProps = {
    stores: store[]
}


export function CollectionForm({stores}:CollectionFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "ACTIVE",
      startDate: new Date(),
      endDate: new Date(),
      storeId: "",
      image: [],
    },
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  
  // Watch the status field to react to changes
  const status = form.watch("status");
  const startDate = form.watch("startDate");

  // Handle status changes
  useEffect(() => {
    const currentDate = new Date();
    
    switch (status) {
      case "EXPIRED":
        // For expired status, set end date to current date
        form.setValue("endDate", currentDate);
        // If start date is after current date, adjust it
        if (form.getValues("startDate") > currentDate) {
          form.setValue("startDate", currentDate);
        }
        break;
      case "SCHEDULED":
        // For scheduled status, ensure start date is in the future
        if (form.getValues("startDate") <= currentDate) {
          form.setValue("startDate", addDays(currentDate, 1));
          form.setValue("endDate", addDays(currentDate, 7)); // Default 7 days duration
        }
        break;
      case "ACTIVE":
        // For active status, ensure start date is not in the future
        if (form.getValues("startDate") > currentDate) {
          form.setValue("startDate", currentDate);
        }
        break;
    }
  }, [status, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(() => {
      setIsSubmitting(true);
    });
    try {
      await axios.post("/api/collections", values);
      toast.success("Collection created successfully");
      router.push("/admin/collections");
    } catch (error) {
      toast.error("Failed to create collection");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Function to determine date constraints based on status
  const getDateConstraints = (isEndDate: boolean = false) => {
    const currentDate = new Date();
    switch (status) {
      case "EXPIRED":
        return (date: Date) => date > currentDate || date < sub(currentDate, { years: 10 });
      case "SCHEDULED":
        if (isEndDate) {
          return (date: Date) => date <= startDate || date < currentDate;
        }
        return (date: Date) => date <= currentDate;
      case "ACTIVE":
        if (isEndDate) {
          return (date: Date) => date < startDate;
        }
        return (date: Date) => date > currentDate;
      default:
        return (date: Date) => date > new Date("2100-01-01");
    }
  };

  return (
    <Card className='max-w-[480px] mx-auto'>
      <CardHeader>
        <h2 className="text-xl font-semibold">Create Collection</h2>
        {status === "EXPIRED" && (
          <p className="text-sm text-muted-foreground">
            Expired collections cannot have future dates
          </p>
        )}
        {status === "SCHEDULED" && (
          <p className="text-sm text-muted-foreground">
            Scheduled collections must start in the future
          </p>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            {/* Name and Description fields remain the same
            {/* ... */}
            <FormField
         control={form.control}
        name="name"
           render={({ field }) => (
             <FormItem>
               <FormLabel>Name</FormLabel>
              <FormControl>
                <Input 
              disabled={isSubmitting||pending}
            placeholder="Collection name" {...field} />
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
               disabled={isSubmitting||pending}
               placeholder="Collection description" {...field} />
             </FormControl>
             <FormMessage />
           </FormItem>
         )}
         />
            {/* Status field remains the same */}
            <FormField
                control={form.control}
                name="storeId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Store</FormLabel>
                    <Select
                        disabled={isSubmitting || pending}
                        onValueChange={(value) => {
                        field.onChange(value);
                        }}
                        defaultValue={field.value}
                    >
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a store" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    disabled={isSubmitting || pending}
                    onValueChange={(value) => {
                      field.onChange(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                      <SelectItem value="EXPIRED">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          disabled={isSubmitting || pending || status === "EXPIRED"}
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => getDateConstraints()(date) || isSubmitting || pending}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          disabled={isSubmitting || pending || status === "EXPIRED"}
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => getDateConstraints(true)(date) || isSubmitting || pending}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image field remains the same */}
            {/* ... */}
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <ImageUploader {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button disabled={isSubmitting || pending} type="submit">
              {isSubmitting || pending ? (
                <div className="flex items-center space-x-2">
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Submitting...</span>
                </div>
              ) : (
                "Submit"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}