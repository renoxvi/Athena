import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AuthProvider from '@/components/hoc/auth-provider'
import { Toaster } from '@/components/ui/toaster'
import PrivateKeyProvider from '@/context/private-key-context'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'athena',
  description: `Athena by the poseidon's navy`,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      
      <body className={inter.className}>
        <AuthProvider>
          <PrivateKeyProvider>
            {children}
          </PrivateKeyProvider>
          <Toaster/>
        </AuthProvider>
      </body>
    </html>
  )
}
