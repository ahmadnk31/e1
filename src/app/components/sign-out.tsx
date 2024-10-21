'use client'
import { signOut } from "next-auth/react"

export const SignOut = () => {
    return (
       <button onClick={() => signOut({redirectTo:'/auth/sign-in'})}>Sign Out</button>
    )
    }