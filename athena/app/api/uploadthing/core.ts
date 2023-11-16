import { getServerAuthSession } from "@/server/auth";
import { createUploadthing, type FileRouter } from "uploadthing/next";
 
const f = createUploadthing();
 

export const ourFileRouter = {

  imageUploader: f({ image: { maxFileSize: "4MB" }, pdf: {maxFileSize: '4MB'} })

    .middleware(async ({ req }) => {

      const session = await getServerAuthSession()
 

      if (!session) throw new Error("Unauthorized");
 

      return { userId: session?.user?.id };
    })
    //@ts-ignore
    .onUploadComplete(async ({ metadata, file }) => {
      
      console.log("Upload complete for userId:", metadata.userId);
 
      console.log("file url", file.url);
 
      
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;