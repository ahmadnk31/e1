import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { NextRequest, NextResponse } from 'next/server'


export async function POST(req: NextRequest) {
    const session = await auth()
    if (!session) {
      return redirect('/auth/sign-in')
    }
    try {
      const body = await req.json()
      const {
        name,
        description,
        buttonText,
        buttonLink,
        storeId,
        collectionId,
        discountId,
        saleId,
        categoryId,
        image
      } = body

      const banner = await prisma.banner.create({
        data: {
          name,
          description,
          buttonText,
          buttonLink:buttonLink||null,
          storeId,
          collectionId:collectionId||null,
          discountId:discountId||null,
          saleId:saleId||null,
          categoryId:categoryId||null,
          Image:image.length>0?{
            createMany:{
                data:image
            }
        }:undefined
        },
      })
      revalidatePath('/admin/banners')
      return NextResponse.json(banner, { status: 201 })
    } catch (error) {
      console.error('Error creating banner:', error)
      return NextResponse.json({ error: 'Error creating banner' }, { status: 500 })
    }
  } 
