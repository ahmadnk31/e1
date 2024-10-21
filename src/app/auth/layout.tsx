
import React from 'react'
import '../globals.css'
export const metadata = {
  title: 'SIGN IN PAGE',
  description: 'Enter your credentials to sign in',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
