"use client"
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { ArrowUp, GithubIcon, XIcon } from "lucide-react"
import { signIn } from 'next-auth/react'
import Link from 'next/link'

export default function Home() {

  const handleSignIn = async () => {
    signIn('github', {
      callbackUrl: "/dashboard"
    })
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 space-y-10">

      <div className="flex flex-col w-full items-center justify-center gap-y-3">
        <h2 className="font-semibold text-2xl">
          Welcome to Athena. 
        </h2>
        <p>
        Read, Share and Earn from your online publications.
        </p>
        <p className='text-xs text-center' >
          Athena is the greek godess of knowledge, just in case you missed that
        </p>
      </div>
      <div className="flex flex-row items-center justify-center space-x-5">
        <div className="flex flex-row items-center justify-center rounded-lg ring-1 ring-amber overflow-hidden transform rotate-12 ">
          <Image
            src="/athena.png"
            width={200}
            height={200}
            alt="over-network"
          />
        </div>
        <div className="flex flex-row items-end h-full">  
          <XIcon/>
        </div>
        <div className="flex flex-row items-center justify-center rounded-lg ring-1 ring-amber overflow-hidden transform -rotate-6">
          <Image
            src="/poseidon.png"
            width={200}
            height={200}
            alt="denv"
          />
        </div>
      </div>
      <div className="flex flex-row items-center justify-center">
        <p className='text-center' >
          a masterpiece built for the internet by <Link href={"https://github.com/poseidons-navy"} legacyBehavior > 
          <strong className='cursor-pointer hover:underline' >poseidon&apos;s navy</strong>
          </Link> 
        </p>
      </div>

      <div className="flex flex-col w-full items-center justify-center gap-y-2">
        <Button
          className='gap-x-5'
          variant={"outline"}
          onClick={handleSignIn}
        >
          <span
            className='font-semibold'
          >
            Login with
          </span>
          <GithubIcon
          />
        </Button>

        <ArrowUp className='animate-bounce' />
        <p className='text-xs' >What are you waiting for?</p>

      </div>
    </main>
  )
}
