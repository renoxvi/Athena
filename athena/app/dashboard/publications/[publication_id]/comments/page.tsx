import { PageProps } from '@/.next/types/app/page'
import { Comment, Publication, User } from '@prisma/client'
import React from 'react'
import { prisma } from "@/lib/prisma"
import Image from 'next/image'
import CommentsSection from '@/components/comments'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import BackButton from '@/components/back-button'

async function page(props: PageProps) {
  const publication_id = props.params.publication_id

  let publication: Publication & {  creator: User | null } | null = null

  try {
   

    publication = await prisma.publication.findFirst({
        where: {
            id: publication_id
        },
        include: {
            creator: true
        }
    })

    
  }
  catch (e)
  {
    // ignore
  }
  return (
    <div className="flex flex-col w-full h-full gap-y-10">
        <div className="flex flex-row items-center justify-start w-full">
            <BackButton/>
        </div>
        <div className="grid grid-cols-5 w-full px-5 py-4 rounded-sm ring-1 ring-amber-100 shadow-md gap-x-4 gap-y-4">
            
            <div className="w-[120px] h-[180px] overflow-hidden relative ring-1">
                <Image
                    src={publication?.cover ?? ""}
                    fill
                    style={{
                        objectFit: "cover"
                    }}
                    alt={publication?.name ?? ""}
                />
            </div>

            <div className="flex flex-col col-span-4 gap-y-2 w-full">
                <h3 className='w-full text-xl font-semibold' >
                    {publication?.name}
                </h3>
                <span className="text-sm text-slate-300">
                    by <strong className='text-black cursor-pointer hover:underline' > {publication?.name} </strong>
                </span>
                <span>
                    { publication?.description }
                </span>
            </div>

        </div>

        <div className="flex flex-col w-full items-center justify-start">
            <CommentsSection
                publication_id={publication_id}
            />
        </div>
    </div>
  )
}

export default page