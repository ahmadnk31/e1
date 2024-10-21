'use client'

import React, { useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, addDays, sub } from 'date-fns';
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
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import axios from 'axios';

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    description: z.string().optional(),
    value: z.number().positive({
        message: "Value must be a positive number.",
    }).refine((val) => {
        return val <= 100 || val <= 1000000;
    }, {
        message: "Percentage must be ≤ 100%, Fixed amount must be ≤ 1,000,000"
    }),
    type: z.enum(["PERCENTAGE", "FIXED"]),
    code: z.string().optional().refine((val) => {
        if (!val) return true;
        return /^[A-Z0-9_-]{4,16}$/.test(val);
    }, {
        message: "Code must be 4-16 characters long and contain only uppercase letters, numbers, underscores, and hyphens"
    }),
    minPurchase: z.number().nonnegative().optional(),
    maxUses: z.number().int().positive().optional(),
    storeId: z.string().min(1, { message: "Store is required" }),
    startDate: z.date(),
    endDate: z.date(),
    status: z.enum(["ACTIVE", "INACTIVE", "SCHEDULED", "EXPIRED"]),
}).refine((data) => {
    // Ensure end date is after start date
    return data.endDate >= data.startDate;
}, {
    message: "End date must be after start date",
    path: ["endDate"]
}).refine((data) => {
    // Additional validation for percentage type
    if (data.type === "PERCENTAGE") {
        return data.value <= 100;
    }
    return true;
}, {
    message: "Percentage discount cannot exceed 100%",
    path: ["value"]
});

type store={
    id:string
    name:string
}

type DiscountFormProps = {
    stores: store[]
}

export function DiscountForm({stores}:DiscountFormProps) {
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [pending, startTransition] = useTransition();
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            value: 0,
            type: "PERCENTAGE",
            code: "",
            minPurchase: 0,
            maxUses: undefined,
            startDate: new Date(),
            endDate: addDays(new Date(), 30),
            status: "ACTIVE",
            storeId:""
        },
    });

    // Watch relevant fields for reactive updates
    const status = form.watch("status");
    const startDate = form.watch("startDate");
    const type = form.watch("type");
    const value = form.watch("value");

    // Handle status changes
    useEffect(() => {
        const currentDate = new Date();

        switch (status) {
            case "EXPIRED":
                form.setValue("endDate", currentDate);
                if (form.getValues("startDate") > currentDate) {
                    form.setValue("startDate", currentDate);
                }
                break;
            case "SCHEDULED":
                if (form.getValues("startDate") <= currentDate) {
                    form.setValue("startDate", addDays(currentDate, 1));
                    form.setValue("endDate", addDays(currentDate, 30));
                }
                break;
            case "ACTIVE":
                if (form.getValues("startDate") > currentDate) {
                    form.setValue("startDate", currentDate);
                }
                break;
        }
    }, [status, form]);

    // Handle discount type changes
    useEffect(() => {
        if (type === "PERCENTAGE" && value > 100) {
            form.setValue("value", 100);
        }
    }, [type, value, form]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        startTransition(() => {
            setIsSubmitting(true);
        });
        try {
            const response = axios.post('/api/discounts', values);
            toast.success("Discount created successfully");
            router.push("/admin/discounts");
        } catch (error) {
            console.error('Error creating discount:', error);
            toast.error("Failed to create discount");
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
        <Card className='max-w-[600px] mx-auto'>
            <CardHeader>
                <h2 className="text-xl font-semibold">Create Discount</h2>
                {status === "EXPIRED" && (
                    <p className="text-sm text-muted-foreground">
                        Expired discounts cannot have future dates
                    </p>
                )}
                {status === "SCHEDULED" && (
                    <p className="text-sm text-muted-foreground">
                        Scheduled discounts must start in the future
                    </p>
                )}
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Discount name"
                                                {...field}
                                                disabled={isSubmitting || pending}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Code (Optional)</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="SUMMER2024"
                                                {...field}
                                                disabled={isSubmitting || pending}
                                                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Uppercase letters, numbers, and hyphens only
                                        </FormDescription>
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
                                        <Input
                                            placeholder="Discount description"
                                            {...field}
                                            disabled={isSubmitting || pending}
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a store" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                    {stores.map((store) => (
                        <SelectItem key={store.id} value={store.id}>
                        {store.name}
                        </SelectItem>
                    ))}
                  </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            disabled={isSubmitting || pending}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select discount type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                                                <SelectItem value="FIXED">Fixed Amount</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="value"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Value</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                disabled={isSubmitting || pending}
                                                onChange={e => field.onChange(parseFloat(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            {type === "PERCENTAGE" ? "Enter percentage (0-100)" : "Enter amount"}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="minPurchase"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Minimum Purchase (Optional)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                disabled={isSubmitting || pending}
                                                onChange={e => field.onChange(parseFloat(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="maxUses"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Max Uses (Optional)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                disabled={isSubmitting || pending}
                                                onChange={e => field.onChange(parseFloat(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                        disabled={isSubmitting || pending || status === "EXPIRED"}
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
                                                    disabled={(date) =>
                                                        getDateConstraints()(date) ||
                                                        isSubmitting ||
                                                        pending
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
                                    <FormItem>
                                        <FormLabel>End Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                        disabled={isSubmitting || pending || status === "EXPIRED"}
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
                                                    disabled={(date) =>
                                                        getDateConstraints(true)(date) ||
                                                        isSubmitting ||
                                                        pending
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

                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        disabled={isSubmitting || pending}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select discount status" />
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
                        <Button
                            disabled={isSubmitting || pending}
                            type="submit">
                            {
                                isSubmitting || pending ? (
                                    <div className="flex items-center space-x-2">
                                        <Loader className="h-4 w-4 animate-spin" />
                                        Saving
                                    </div>
                                ) : 'Save'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
