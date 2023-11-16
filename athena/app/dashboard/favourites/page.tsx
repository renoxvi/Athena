import BookDetails from '@/components/book-details'
import Redirect from '@/components/redirect'
import { getServerAuthSession } from '@/server/auth'
import { isNull } from 'lodash'
import { Heart } from 'lucide-react'
import React from 'react'
import { Publication, User } from '@prisma/client'
import { getFavouritePublications } from '@/server/publication'

async function FavouritesPublications() {
    const session = await getServerAuthSession()
    const user = session?.user
    let publications: Array<Publication & { creator: User | null } | null> = []
    if(isNull(user?.walletAddress)) {
        return <Redirect 
            link='/setup-wallet'
        />
    }

    try {
        publications = await getFavouritePublications()
    }
    catch(e)
    {

    }

return (
    <div className="flex flex-col items-center justify-centet w-full space-y-10 px-2 pb-[100px]">
     {/* Favourites */}
     <div className="flex flex-col gap-y-4 w-full px-5 py-5">
     <div className="flex flex-row items-center gap-x-4">
         <Heart fill="red" stroke='red' />
         <h2 className="text-lg font-semibold">
             Your favourite reads.
         </h2>
     </div>
     <div className="flex flex-col w-full gap-y-5">
         {
             publications?.map((publication, i)=> {
                 return  (
                 <BookDetails
                     key={i}
                     // @ts-ignore
                     publication={publication}
                 />
                 )
             })
         }
     </div>
    </div>
    </div>
)
}

export default FavouritesPublications;