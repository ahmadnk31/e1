'use client'
import { UploadDropzone } from "@/lib/uploadthing";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";


type FileProps={
    url:string;
    key:string;
    id?:string;
}


type ImageUploaderProps = {
    onChange:(files:FileProps[]) => void;
}

export const ImageUploader = ({onChange}:ImageUploaderProps) => {
    const router=useRouter()
    return(
        <UploadDropzone
        endpoint="imageUploader"
        onUploadBegin={()=>{
            toast.info('Uploading image...')
        }}
        
        onUploadError={(error)=>{
            toast.error('Error uploading image')
        }}
        onUploadProgress={
            (progress)=>{
               toast.info(`Uploading ${progress}%`)
            }
        }
        onClientUploadComplete={
            
            (files)=>{
                toast.success('Image uploaded successfully')
                router.refresh()
                onChange(files.map((file)=>({ url: file.url, key: file.key,id:file.customId||'' })))}  }     
        />
    )
}