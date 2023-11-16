"use client"
import Image from 'next/image'
import React from 'react'
import { Button } from '../ui/button'
import { BookOpenText, FileEdit, Heart, MessageCircle } from 'lucide-react'
import { Publication, User } from '@prisma/client'
import Interactions from './interactions'
import Link from 'next/link'
import { useSession } from 'next-auth/react'


interface Props {
    publication: Publication & { creator: User | null }
}

function BookDetails( props: Props) {
    const p = props
    const { publication: { cover, name, description, price, creator, id, creator_id }, showRead, appId } = p
    const { data } = useSession()

  return (
    <div className="grid grid-cols-5 w-full px-5 py-4 rounded-sm ring-1 ring-amber-100 shadow-md gap-x-4 gap-y-4">

        {/* Book Cover */}
        <div className="w-[120px] h-[180px] overflow-hidden relative ring-1">
            <Image
                src={cover ?? ""}
                fill
                style={{
                    objectFit: "cover"
                }}
                alt={name ?? ""}
            />
        </div>

        {/* Book Details */}
        <div className="flex flex-col col-span-4 gap-y-2 w-full">
            <h3 className='w-full text-xl font-semibold' >
                {name}
            </h3>
            <span className="text-sm text-slate-300">
                by <strong className='text-black cursor-pointer hover:underline' > {creator?.name} </strong>
            </span>
            <span>
                { description }
            </span>
            <div className="flex flex-row items-center">
                <span>
                    {price} USD
                </span>
            </div>
        </div>

        {/* Action Buttons */}
        <div className=""></div>
        <div className="flex flex-row items-center col-span-3 gap-x-2 ">

            <Interactions
                publication={p.publication}
                showRead={showRead}
                appId={appId}
            />
            
            <Link href={`/dashboard/publications/${id}/comments`} legacyBehavior >
                <Button variant={'outline'} >
                    <MessageCircle/>
                </Button>
            </Link>
        </div>
        {data?.user?.id === creator_id && <Link href={`/dashboard/publications/${id}/update`} legacyBehavior >
            <Button variant={'outline'} >
                <FileEdit/>
            </Button>
        </Link>}
    </div>
  )
}

export default BookDetails