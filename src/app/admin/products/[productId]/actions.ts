'use server'

import { prisma } from "@/lib/prisma"
import { utapi } from "@/server/uploadthing"

export async function deleteImage(key:string,id:string){
    console.log('deleteImage', key)
    try{
        const image = await prisma.image.findUnique({
            where: {
                id
            }
        })
        console.log('images', image)
        if(!image) return
        const key = image.key
        if (key) {
            await utapi.deleteFiles(key)
        }
        const deletedImage = await prisma.image.delete({
            where: {
                id: id
            }
        })
        console.log('deletedImage', deletedImage)
        return{
            status:200,
            message:'Image deleted successfully'
        }
    }catch(e){
        console.log('error', e)
        return{
            status:500,
            message:'Something went wrong'
        }
    }
    
    

}