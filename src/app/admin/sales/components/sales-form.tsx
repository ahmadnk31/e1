"use client"
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

  
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarIcon, Loader2, AlertCircle } from 'lucide-react';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import axios from 'axios';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// Constants
const MAX_DISCOUNT_PERCENTAGE = 100;
const MAX_FIXED_DISCOUNT = 10000; // $10,000
const MIN_SALE_DURATION_DAYS = 1;
const MAX_SALE_DURATION_DAYS = 365;

// Form Schema with improved validation
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }).max(50, {
    message: "Name cannot exceed 50 characters."
  }),
  description: z.string().max(500, {
    message: "Description cannot exceed 500 characters."
  }).optional(),
  storeId: z.string().min(1, { message: "Store is required" }),
  discountValue: z.number()
    .min(0, "Discount must be positive")
    .refine((val) => !isNaN(val), {
      message: "Please enter a valid number"
    }),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  startDate: z.date({
    required_error: "A start date is required.",
  }).min(new Date(), {
    message: "Start date must be in the future.",
  }),
  endDate: z.date({
    required_error: "An end date is required.",
  }),
  status: z.enum(["ACTIVE", "INACTIVE", "SCHEDULED", "EXPIRED"]),
}).refine((data) => {
  // Validate discount value based on type
  if (data.discountType === "PERCENTAGE" && data.discountValue > MAX_DISCOUNT_PERCENTAGE) {
    return false;
  }
  if (data.discountType === "FIXED" && data.discountValue > MAX_FIXED_DISCOUNT) {
    return false;
  }
  return true;
}, {
  message: "Invalid discount value for selected type",
  path: ["discountValue"],
}).refine((data) => {
  const daysDiff = Math.ceil((data.endDate.getTime() - data.startDate.getTime()) / (1000 * 60 * 60 * 24));
  return daysDiff >= MIN_SALE_DURATION_DAYS && daysDiff <= MAX_SALE_DURATION_DAYS;
}, {
  message: `Sale duration must be between ${MIN_SALE_DURATION_DAYS} and ${MAX_SALE_DURATION_DAYS} days`,
  path: ["endDate"],
});
type Store={
    id:string
    name:string
}

type SaleFormProps = {
    stores: Store[]
}
export function SaleForm({stores}:SaleFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const router=useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      discountValue: 0,
      discountType: "PERCENTAGE",
      status: "ACTIVE",
      storeId:"",
      startDate: addDays(new Date(), 1), // Default to tomorrow
      endDate: addDays(new Date(), 8), // Default to a week from tomorrow
    },
  });

  // Watch for discount type changes to validate discount value
  const discountType = form.watch("discountType");
  const maxDiscount = discountType === "PERCENTAGE" ? MAX_DISCOUNT_PERCENTAGE : MAX_FIXED_DISCOUNT;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await axios.post("/api/sales", values);
      toast.success("Sale created successfully!");
      router.refresh()
      form.reset(); // Reset form after successful submission
    } catch (e) {
      const errorMessage = axios.isAxiosError(e) && e.response?.data?.message ? e.response.data.message : "Failed to create sale";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <Card className='max-w-2xl mx-auto'>
      <CardHeader>
        <CardTitle className='text-2xl font-semibold'>Create Sale</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Summer Sale 2024" {...field} />
                  </FormControl>
                  <FormDescription>
                    A unique name for your sale campaign
                  </FormDescription>
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
                    <Textarea 
                      placeholder="Describe the sale..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional description of the sale (max 500 characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="discountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                        <SelectItem value="FIXED">Fixed Amount ($)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discountValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Value</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step={discountType === "PERCENTAGE" ? "1" : "0.01"}
                        min="0"
                        max={maxDiscount}
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Maximum: {discountType === "PERCENTAGE" ? "100%" : formatCurrency(MAX_FIXED_DISCOUNT)}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" className={!field.value ? "text-muted-foreground" : ""}>
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            isBefore(date, new Date()) || isAfter(date, new Date("2100-01-01"))
                          }
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
                          <Button variant="outline" className={!field.value ? "text-muted-foreground" : ""}>
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            isBefore(date, form.getValues("startDate")) || 
                            isAfter(date, new Date("2100-01-01"))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className='grid gap-4 md:grid-cols-2'>
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
                        {
                            stores?.map((store)=>(
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
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
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-end space-x-4">
        <Button
          variant="outline"
          onClick={() => form.reset()}
          disabled={isSubmitting}
        >
          Reset
        </Button>
        <Button 
          onClick={form.handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Sale'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}