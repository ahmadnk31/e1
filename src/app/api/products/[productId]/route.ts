import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { utapi } from "@/server/uploadthing";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: {
    params: {
        productId: string
    }
}) {
    try {
        const session = await auth();
        if (!session) {
            return redirect("/auth/sign-in");
        }

        const { productId } = params;

        // Validate productId
        if (!productId || !ObjectId.isValid(productId)) {
            return new NextResponse('Invalid product ID', { status: 400 });
        }

        // Parse request body
        const data = await req.json();
        console.log('Received request body:', data);
        const product=await prisma.product.findUnique({
            where:{
                id:productId
            }
        })
        if(!product){
            return new NextResponse('Product not found',{status:404})
        }
        
        
        // Convert empty string IDs to null
        const {
            name,
            description,
            basePrice,
            categoryId,
            discountId,
            collectionId,
            saleId,
            image,
            variants,
            manufacturer,
            brandId
        } = data;

        // Verify product exists
        const existingProduct = await prisma.product.findUnique({
            where: {
                id: productId
            }
        });

        if (!existingProduct) {
            return new NextResponse('Product not found', { status: 404 });
        }

        // Prepare update data with null handling
        const updateData = {
            name,
            description,
            basePrice,
            categoryId: categoryId || null,
            manufacturer,
            brandId: brandId || null,
            // Convert empty strings to null for optional ID fields
            discountId: discountId || null,
            collectionId: collectionId || null,
            saleId: saleId || null,
            // Handle arrays
            Image: image && Array.isArray(image) && image.length > 0 ? {
                createMany: {
                    data: image.map((img: { key: string, url: string }) => ({ ...img }))
                }
            } : undefined,
            ProductVariant: variants && Array.isArray(variants) && variants.length > 0 ? {
                create: variants.map((variant: {
                    name: string,
                    price: number,
                    stock: number,
                    description: string,
                    attributes: { name: string, value: string }[]
                }) => ({
                    name: variant.name,
                    price: variant.price,
                    stock: variant.stock,
                    sku: existingProduct.sku,
                    description: variant.description,
                    VariantAttribute: {
                        createMany: {
                            data: variant.attributes.map((attr) => ({ ...attr }))
                        }
                    },
                    Image: image && Array.isArray(image) && image.length > 0 ? {
                        createMany: {
                            data: image.map((img: { key: string, url: string }) => ({ ...img }))
                        }
                    } : undefined
                }))
            } : undefined
        };

        console.log('Prepared update data:', updateData);

        
        // Perform update
        const updatedProduct = await prisma.product.update({
            where: {
                id: productId,
            },
            data: updateData
        });

        console.log('Successfully updated product:', updatedProduct);

        revalidatePath(`/admin/products/${productId}`);
        return new NextResponse('Product updated successfully');

    } catch (error) {
        console.error('Update error:', error);
        return new NextResponse(
            error instanceof Error ? error.message : 'Something went wrong',
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest, { params }: {
    params: {
        productId: string
    }
}) {
    try {
        const session = await auth();
        if (!session) {
            return redirect("/auth/sign-in");
        }

        const { productId } = params;

        // Validate productId
        if (!productId || !ObjectId.isValid(productId)) {
            return new NextResponse('Invalid product ID', { status: 400 });
        }

        const product = await prisma.product.findUnique({
            where: {
                id: productId
            }
        });

        if (!product) {
            return new NextResponse('Product not found', { status: 404 });
        }

        const images = await prisma.image.findMany({
            where: {
                productId: productId
            }
        });

        const keys = images.map((img) => img.key).filter((key): key is string => key !== null);
        if (keys.length > 0) {
            await utapi.deleteFiles(keys);
        }

        await prisma.product.delete({
            where: {
                id: productId,
            }
        });

        revalidatePath(`/admin/products`);
        return new NextResponse('Product deleted successfully');

    } catch (error) {
        console.error('Delete error:', error);
        return new NextResponse(
            error instanceof Error ? error.message : 'Something went wrong',
            { status: 500 }
        );
    }
}