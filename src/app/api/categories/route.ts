// app/api/categories/route.ts

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import {prisma} from '@/lib/prisma';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const categorySchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters long" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters long" }),
  images: z.array(z.object({
    url: z.string(),
    key: z.string()
  })),
  storeId: z.string().min(1, { message: "Store is required" }),
  isSubcategory: z.boolean(),
  parentCategoryId: z.string().nullable(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = categorySchema.parse(body);

    // Check if the user has permission to create a category in this store
    const store = await prisma.store.findUnique({
      where: { id: validatedData.storeId },
      select: { userId: true },
    });

    if (!store || store.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized to create category in this store' }, { status: 403 });
    }

    // If it's a subcategory, verify the parent category exists and belongs to the same store
    // if (validatedData.isSubcategory && validatedData.parentCategoryId) {
    //   const parentCategory = await prisma.category.findUnique({
    //     where: { id: validatedData.parentCategoryId },
    //     select: { storeId: true },
    //   });

    //   if (!parentCategory || parentCategory.storeId !== validatedData.storeId) {
    //     return NextResponse.json({ error: 'Invalid parent category' }, { status: 400 });
    //   }
    // }

    // Create the category
    const category = await prisma.category.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        storeId: validatedData.storeId,
        parentCategoryId: validatedData.isSubcategory ? validatedData.parentCategoryId : null,
        Image: validatedData.images.length > 0 ? {
          create: validatedData.images.map(image => ({
            url: image.url,
            key: image.key,
          })),
        } : undefined,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error creating category:', error.errors);
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const categories = await prisma.category.findMany({
      include: {
        Image: true,
        products: true,
        childCategories: {
          include:{
            Image:true,
            products:true
          }
        }
      },
    });
    
    revalidatePath('/admin/categories');
    console.log(categories);
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}