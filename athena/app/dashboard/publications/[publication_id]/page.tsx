import { PageProps } from '@/.next/types/app/page'
import { Button } from '@/components/ui/button'
import { getServerAuthSession } from '@/server/auth'
import { Publication, User } from '@prisma/client'
import { BookOpenText, HeartIcon } from 'lucide-react'
import Image from 'next/image'
import React from 'react'
import Interactions from '../../../../components/book-details/interactions'
import CommentsSection from '@/components/comments'

async function PublicationPage(props: PageProps) {
    const { params, searchParams } = props 
    const publication_id = params.publication_id

    console.log("Publication::", publication_id)

    let publication: any = null;
    const session = await getServerAuthSession()

    try {
        publication = await prisma?.publication.findFirst({
            where: {
                id: publication_id
            },
            include: {
                creator: true
            }
        })

        publication = publication ?? null
    }
    catch (e)
    {
        // ignore
    }

  return (
    <div className="w-full items-center h-full gap-y-5">
        <div className="grid grid-cols-5 w-full px-5 py-4 rounded-sm ring-1 ring-amber-100 shadow-md gap-x-4 gap-y-4">

            {/* Book Cover */}
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

            {/* Book Details */}
            <div className="flex flex-col col-span-4 gap-y-2 w-full">
                <h3 className='w-full text-xl font-semibold' >
                    {publication?.name}
                </h3>
                <span className="text-sm text-slate-300">
                    by <strong className='text-black cursor-pointer hover:underline' > {publication?.creator?.username} </strong>
                </span>
                <span>
                    { publication?.description }
                </span>
                <div className="flex flex-row items-center">
                    <span>
                        {publication?.price} USD
                    </span>
                </div>
            </div>

  
            <div className="col-span-1"></div>
            
            {publication && <Interactions
                publication={publication}
                showRead={true}
            />}

        </div>


        {/* Comments */}
        <div className="flex flex-col w-full h-full">
            <CommentsSection
                publication_id={publication_id}
            />
        </div>
    </div>
  )
}

export default PublicationPage