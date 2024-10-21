import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProductDialog } from "../components/product-dialog";
import { ProductUpdateForm } from "./components/product-update-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


export default async function ProductsPage({ params }:{
    params:{
        productId:string
    }
}) {
    const session = await auth();
    if (!session) {
        return redirect("/auth/sign-in");
    }
    const store = await prisma.store.findFirst({
        where: {
            userId: session?.user?.id || ""
        },
        select: {
            id: true,
            name: true
        }
    });
    const categories = await prisma.category.findMany({
        select: {
            id: true,
            name: true,
            parentCategory:{
                select:{
                    name:true
                }
            },
            storeId: true
        }
    });
    const product=await prisma.product.findUnique({
        where:{
            id:params.productId
        },
        include:{
            category:true,
            ProductVariant:{
                include:{
                    Image:true,
                    VariantAttribute:{
                        select:{
                            name:true,
                            id:true,
                            value:true
                        }
                    }
                }
            },
            Image:true
        }
    })
    const formattedCategories=categories.map(category=>({
        id:category.id||'',
        name:category.name||'',
        parentName:category.parentCategory?.name||'',
        storeId:category.storeId||''
    }))
    const collections=await prisma.collection.findMany({
        where:{
            storeId:store?.id
        },
        select:{
            id:true,
            name:true
        }
    })
    const formattedCollections=collections.map(collection=>({
        id:collection.id||'',
        name:collection.name||''
    }))
    const brands=await prisma.brand.findMany({
        where:{
            storeId:store?.id
        },
        select:{
            id:true,
            name:true
        }
    })
    const discounts=await prisma.discount.findMany({
        where:{
            storeId:store?.id
        },
        select:{
            id:true,
            name:true,
            code:true,
            status:true
        }
    })
    const sales=await prisma.sale.findMany({
        where:{
            storeId:store?.id
        },
        select:{
            id:true,
            name:true,
            status:true
        }
    })
    const formattedProductVariants=product?.ProductVariant.map(variant=>({
        id:variant.id||'',
        name:variant.name||'',
        price:variant.price||0,
        stock:variant.stock||0,
        description:variant.description||'',
        image:variant.Image.map(image=>({
            key:image.key||'',
            url:image.url||''
        })),
        attributes:variant.VariantAttribute.map(attr=>({
            id:attr.id||'',
            name:attr.name||'',
            value:attr.value||''
        }))
    }))
    const images=product?.Image.map(image=>({
        url:image?.url||'',
        key:image?.key||'',
        id:image?.id||''
    }))
    const variantImages=product?.ProductVariant.map(variant=>variant.Image.map(image=>({
        url:image.url||'',
        key:image.key||'',
        id:image.id||''
    })))
    console.log(`variantImages`, variantImages)
    console.log(`images`, images)
    return (
        <div className="p-4">
            <div className="flex items-center justify-between">
            <span>
                <h1 className="text-2xl font-semibold">{product?.name}</h1>
                <p className="text-gray-500">Manage your product</p>
                </span>
                <ProductDialog  
                sales={sales}
                discounts={discounts}
                collections={formattedCollections}
                brands={brands}
                categories={formattedCategories}/>
            </div>
            <Tabs defaultValue="products">
  <TabsList>
    <TabsTrigger value="products">Products</TabsTrigger>
    <TabsTrigger value="variaitions">Varaitions</TabsTrigger>
  </TabsList>
  <TabsContent value="products">
  {
                product&&(
                    <ProductUpdateForm
                    images={images}
                    brands={brands}
                    categories={formattedCategories}
                    collections={formattedCollections}
                    discounts={discounts}
                    sales={sales}
                    id={params.productId}
                    variantImages={(variantImages ?? []).flat().filter((image): image is NonNullable<typeof image> => image !== undefined)}
                    defaultValues={{
                        manufacturer:product.manufacturer||'',
                        collectionId:product.collectionId||'',
                        discountId:product.discountId||'',
                        saleId:product.saleId||'',
                        name:product.name||'',
                        description:product.description||'',
                        basePrice:product?.basePrice?.toString() ?? '',
                        categoryId:product.categoryId,
                        brandId:product?.brandId||'',
                        sku:product.sku||'',
                        variants:product.ProductVariant.length > 0 ? product.ProductVariant.map(variant=>({
                            name:variant.name || '',
                            sku:variant.sku || '',
                            price:variant.price?.toString() || '',
                            stock:variant.stock?.toString() || '',
                            attributes:variant.VariantAttribute.map(attr=>({
                                name:attr.name || '',
                                value:attr.value || ''
                            })),
                            description:variant.description || '',
                            image:variant.Image.map(image=>({
                                url:image.url || '',
                                key:image.key || ''
                            }))
                        })) : [{
                            name: '',
                            sku: '',
                            price: '',
                            stock: '',
                            attributes: [{
                                name: '',
                                value: ''
                            }],
                            description: '',
                            image: [{
                                url: '',
                                key: ''
                            }]
                        }],
                        image:product.Image.map(image=>({
                            key:image.key||'',
                            url:image.url||''
                        }))
                    }}
                    />
                )
            }
  </TabsContent>
  <TabsContent value="password">Change your password here.</TabsContent>
</Tabs>

            
           
        </div>
    )
}