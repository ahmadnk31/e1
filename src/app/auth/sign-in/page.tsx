import { providerMap } from "@/auth.config"
import { auth, signIn } from "@/auth"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Github } from "lucide-react"
import {FaGoogle} from "react-icons/fa"
import { SignInForm } from "@/components/sign-in-form"
import { redirect } from "next/navigation"


export default async function SignInPage({ searchParams }: {
  searchParams: { callbackUrl: string | undefined }
}) {
  const session=await auth();
  if(session){
    return redirect('/')
  }
  return (
   <div className="h-screen flex items-center justify-center">
     <Card className="w-[350px] mx-auto">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <SignInForm />
        
        <Separator className="my-4" />
        
        <div className="space-y-2">
          {Object.values(providerMap).map((provider) => (
            <form
              key={provider.id}
              action={async () => {
                "use server"
                await signIn(provider.id, {
                  redirectTo: searchParams?.callbackUrl ?? "/",
                })
              }}
            >
              <Button type="submit" variant="outline" className="w-full">
                {provider.id === 'github' && <Github className="mr-2 h-4 w-4" />}
                {provider.id === 'google' && <FaGoogle className="mr-2 h-4 w-4" />}
                <span>Sign in with {provider.name}</span>
              </Button>
            </form>
          ))}
        </div>
      </CardContent>
    </Card>
   </div>
  )
}