import { Toaster } from "@/components/ui/sonner"
import { Sidebar } from "./components/sidebar"
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import '../globals.css'
export default function Layout({ children }:{
    children: React.ReactNode
}) {
    return(
        <html>
            <body>
            <div className="flex">
            <NextSSRPlugin
          /**
           * The `extractRouterConfig` will extract **only** the route configs
           * from the router to prevent additional information from being
           * leaked to the client. The data passed to the client is the same
           * as if you were to fetch `/api/uploadthing` directly.
           */
          routerConfig={extractRouterConfig(ourFileRouter)}
        />
            <Sidebar/>
            <div className='flex-grow w-full'>
            {children}
            </div>
            <Toaster/>
        </div>
            </body>
        </html>

    )
}