import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";


 export async function POST(req: Request, res: Response) {
  const session =await auth();
  if(!session){
    return NextResponse.redirect("/auth/sign-in")
  }
  if (!session.user?.id) {
    return NextResponse.error();
  }

  console.log(session.user)
  const data = await req.json();
  console.log(data)
  try{
    const store=await prisma.store.create({
        data:{
            name:data.name,
            userId:session?.user?.id ?? '',
            description:data.description,
            Image:data.image&&data.image.length>0?{
              createMany:{
                  data:data.images
              }
            }:undefined
        }
    })
    console.log(store)
    revalidatePath('/admin/stores')
    return new NextResponse('Store created successfully',{status:201})
  }catch(e){
    if (e instanceof Error) {
      console.error(e.message);
    } else {
      console.error('An unknown error occurred');
    }
    return new NextResponse('Something went wrong',{status:500})
  }
}
export async function GET(req: Request, res: Response) {
  const session =await auth();
  if(!session){
    return new NextResponse('Unauthorized', { status: 401 });
  }
  if (!session.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const stores=await prisma.store.findMany({
      where:{
          userId:session.user.id
      },
      include:{
          Image:true
      }
  })
  return NextResponse.json({data:stores})
}