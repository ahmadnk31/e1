import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";



export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return redirect('/auth/sign-in')
  }
  const data = await req.json();
  const { name, description, basePrice, categoryId, variants, image,sku,brandId,manufacturer } = data;
  console.log(data);
  if (!sku) {
    console.log('SKU is required and must be unique');
    return new NextResponse('SKU is required and must be unique', { status: 400 });
}

  try {
    const existingProduct = await prisma.product.findUnique({
      where: { sku: sku },
  });
  if (existingProduct) {
    console.log('SKU already exists');
    return new NextResponse('SKU already exists', { status: 400 });
}
    const product = await prisma.product.create({
      data: {
        name,
        description,
        manufacturer,
        basePrice,
        sku:sku,
        brandId,
        categoryId,
        Image: image.length > 0 ? {
          createMany: {
            data: image.map((img: { key: string, url: string }) => ({ ...img}))
          }
        } : undefined,
        ProductVariant: {
          create: variants.map((variant: { name: string, price: number,stock:number,description:string,attributes:[{name:string,value:string}] }) => ({
            name: variant.name,
            price: variant.price,
            stock:variant.stock,
            sku:sku,
            description:variant.description,
            attributes: {
              createMany: {
                data: variant.attributes.map((attr: { name: string, value: string }) => ({ ...attr }))
              }
            },
            Image: image.length > 0 ? {
              createMany: {
                data: image.map((img: { key: string, url: string }) => ({ ...img}))
              }
            } : undefined
          }))
        }
      },
      include: {
        Image: true,
        ProductVariant: {
          include: {
            Image: true,
            VariantAttribute: true
          }
        }
      }
    });
    revalidatePath(`/products`);
    return NextResponse.json(product);
  } catch (e) {
    console.error(e);
    return new NextResponse('Something went wrong', { status: 500 });
  }
}


export async function GET() {
  const session = await auth();
  if (!session) {
    return redirect('/auth/sign-in')
  }
  const products = await prisma.product.findMany({
    include: {
      Image: true,
      ProductVariant: {
        include: {
          Image: {
            select: {
              url: true,
              id:true
            }
          }
        }
      }
    }
  });
  return NextResponse.json(products);
}