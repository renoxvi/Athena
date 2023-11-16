import { PageProps } from '@/.next/types/app/page'
import { Publication } from '@prisma/client'
import React from 'react'
import { prisma } from "@/lib/prisma"
import EditPublication from './edit-form'
import BackButton from '@/components/back-button'

async function PublicationPage(props: PageProps) {
    const params = props.params
    const publication_id = params?.publication_id

    let publication: Publication | null = null;


    try{
        publication = await prisma.publication.findFirst({
            where: {
                id: publication_id
            }
        })
    }
    catch(e)
    {

    }


  return (
    <>
        <div className="flex flex-row items-center w-full justify-start">
            <BackButton/>
        </div>
        <EditPublication
            publication={publication}
        />
    </>
  )
}

export default PublicationPage