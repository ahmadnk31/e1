import { auth } from "@/auth"
import { createUploadthing, type FileRouter } from "uploadthing/next"

const f = createUploadthing()

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB" } })
  .middleware(async()=>{
    const session = await auth()
    if (!session) {
      throw new Error("Unauthorized")
    }
    return { userId: session?.user?.id }
  })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("file url", file.url)
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter