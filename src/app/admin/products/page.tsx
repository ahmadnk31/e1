import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProductDialog } from "./components/product-dialog";
import { DataTable as ProductDataTable } from "./components/data-table";
import { columns as productColumns } from "./components/columns";
import {columns as variantColumns} from "./[productId]/variations/columns";
import { DataTable as ProductVariationDataTable } from "./[productId]/variations/data-table";
import { ProductForm } from "./components/product-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VariationDialog } from "./[productId]/variations/variation-dialog";


export default async function ProductsPage() {
    const session = await auth();
    if (!session) {
        return redirect('/auth/sign-in')
    }
    const stores = await prisma.store.findMany({
        where: {
            userId: session?.user?.id || ""
        },
        select: {
            id: true,
            name: true
        }
    })
    const category=await prisma.category.findMany({
        where:{
            storeId:{
                in:stores.map(store=>store.id)
            }
        },
        select:{
            id:true,
            name:true,
            parentCategory:true,
            storeId:true,
            products:true
        }
    })
    const products = await prisma.product.findMany({
        where: {
            
                categoryId:{
                    in:category.map(cat=>cat.id)
                }

        },

        include: {
            category: {
                include:{
                    products:true,
                    store:{
                        select:{
                            id:true,
                            name:true
                        }
                    }
                }
            },
            ProductVariant:{
                select:{
                    id:true,
                    VariantAttribute:{
                        select:{
                            name:true,
                            id:true
                        }
                    },
                    sale:{
                        select:{
                            name:true,
                            id:true,
                            status:true
                        }
                    }
                }
            },
            Collection:{
                select:{
                    id:true,
                    name:true,
                    status:true
                }
            },
            Discount:{
                select:{
                    id:true,
                    name:true,
                    status:true
                }
            },
            sale: {
                select:{
                    id:true,
                    name:true,
                    status:true
                }
            }
        }
    })
    const sales=await prisma.sale.findMany({
        select:{
            name:true,
            id:true,
            status:true,
        }
    })
    const discounts=await prisma.discount.findMany({
        select:{
            name:true,
            id:true,
            status:true,
            code:true,
            value:true
        }
    })
    const collections=await prisma.collection.findMany({
        select:{
            name:true,
            id:true,
            status:true,
        }
    })
    const formattedProducts = products.map(product => ({
        id: product.id || '',
        name: product.name || '',
        storeName: product.category?.store?.name || '',
        categoryName: product?.category?.name || '',
        price: product.basePrice || 0,
        sales:sales,
        saleName:product.sale?.name||'',
        manufacturer:product.manufacturer||'',
        saleId:product.saleId||'',
        createdAt: new Date(product.createdAt).toLocaleDateString(),
        discountName:product.Discount?.name||'',
        discountId:product.discountId||'',
        discounts:discounts,
        collectionName:product.Collection?.name||'',
        collectionId:product.collectionId||'',
        collections: collections.map(collection => ({
            id: collection.id,
            name: collection.name || '',
            status: collection.status
        }))
    }))
    const categories = await prisma.category.findMany({
        select: {
            id: true,
            name: true,
            parentCategory:true,
            storeId: true
        }
    })
    const productVariants=await prisma.productVariant.findMany({
        where:{
            productId:{
                in:products.map(product=>product.id)
            },
        },
        select:{
            id:true,
            VariantAttribute:{
                select:{
                    name:true,
                    id:true,
                    value:true
                }
            },
            price:true,
            stock:true,
            name:true,
            description:true,
            productId:true,
            createdAt:true,
            collection:{
                select:{
                    name:true,
                    id:true,
                    status:true
                }
            },
            sale:{
                select:{
                    name:true,
                    id:true,
                    status:true
                }
            },
            discount:{
                select:{
                    name:true,
                    id:true,
                    status:true
                }
            }
        }
    })
    
    const formattedProductVariants=productVariants.map(variant=>({
        id:variant.id||'',
        name:variant.name||'',
        price:variant.price||0,
        stock:variant.stock||0,
        description:variant.description||'',
        productId:variant.productId||'',
        productName:products.find(product=>product.id===variant.productId)?.name||'',
        createdAt:new Date(variant.createdAt).toLocaleDateString(),
        collectionName:variant.collection?.name||'',
        collectionId:variant.collection?.id||'',
        collectionStatus:variant.collection?.status||'',
        collections:collections.map(collection=>({
            id:collection.id,
            name:collection.name||'',
            status:collection.status
        })),
        saleName:variant.sale?.name||'',
        saleId:variant.sale?.id||'',
        saleStatus:variant.sale?.status||'',
        sales:sales,
        discountName:variant.discount?.name||'',
        discountId:variant.discount?.id||'',
        discountStatus:variant.discount?.status||'',
        discounts:discounts

    }))
    const formattedCategories = categories.map(category => ({
        id: category.id || '',
        name: category.name || '',
        parentName: category.parentCategory?.name || '',
        storeId: category.storeId || ''
    }))
    
    const brands=await prisma.brand.findMany({
        where:{
            storeId:{
                in:stores.map(store=>store.id)
            }
        },
        include:{
            Image:true,
            store:{
                select:{
                    id:true,
                    name:true
                }
            }
        }
    })

    const formattedBrands=brands.map(brand=>({
        id:brand.id||'',
        name:brand?.name||'',
        description:brand?.description||'',
        storeId:brand?.storeId||'',
        storeName:brand?.store.name||'',
        createdAt:new Date(brand.createdAt).toLocaleDateString()
    }))
    const formattedSales=sales.map(sale=>({
        id:sale.id||'',
        name:sale.name||'',
        status:sale.status||''
    }))

    const formattedCollections=collections.map(collection=>({
        id:collection.id||'',
        name:collection.name||'',
        status:collection.status||''
    }))

    return (
        <div className="p-4">
            <div className="flex items-center justify-between">
                <span>
                    <h1 className="text-2xl font-semibold">Products</h1>
                    <p className="text-gray-500">Manage your products</p>
                </span>
                <ProductDialog 
                sales={formattedSales}
                discounts={discounts}
                collections={formattedCollections}
                brands={formattedBrands}
                categories={formattedCategories} />
            </div>
            <Tabs defaultValue="products" className="w-full mt-4">
                <TabsList>
                    <TabsTrigger value="products">Products</TabsTrigger>
                    <TabsTrigger value="variations">Variations</TabsTrigger>
                </TabsList>
                <TabsContent value="products">
                    {
                        products.length === 0 && (
                            <ProductForm  categories={formattedCategories} brands={formattedBrands}/>
                        )
                    }
                    {
                        products.length > 0 && (
                            <ProductDataTable data={formattedProducts} columns={productColumns} />
                        )
                    }
                </TabsContent>
                <TabsContent value="variations">
                    {
                        productVariants.length > 0 && (
                            <ProductVariationDataTable data={formattedProductVariants} columns={variantColumns} />
                        )
                    }
                    {
                        productVariants.length === 0 && (
                           <div className="flex items-center justify-center flex-col h-[50vh]">
                             <p className="text-gray-500 mb-4">No variations available for this product.</p>
                            <VariationDialog products={formattedProducts} />
                            </div>
                        )
                    }
                </TabsContent>
            </Tabs>


        </div>
    )
}