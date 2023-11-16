"use client"

import { buyProductAction, Book, payForBook } from '@/algorand/books'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { getPublicationSaveEvent, removePublicationSaveEvent, savePublication, getPublication, purchaseBook} from '@/server/publication'
import { Publication, User, UserEvent, Purchase } from '@prisma/client'
import clsx from 'clsx'
import { isNull } from 'lodash'
import { BookOpenText, HeartIcon } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { usePrivateKey } from '@/context/private-key-context'
import DecryptPrivateKey from '../decrypt-private-key'
import { DOLLAR_PER_ALGO } from '@/algorand/constants'
import Library from '@/app/dashboard/library/page'


function Interactions(props: { publication: Partial<Publication & { creator: User | null }> | null, className?: string, showRead: boolean, appId?: number }) {
    const { publication, className, showRead, appId } = props
    const [saveEvent, setSaveEvent] = useState<UserEvent | null>(null)
    const [loading, setLoading] = useState(false)
    const [eventLoading, setEventLoading] = useState(false)
    const { toast } = useToast()
    const session = useSession();
    const {decryptKey, privateKey} = usePrivateKey();


    const handleLike = async () => {
        console.log("Publication::", publication)
        if (publication?.id) {
            setLoading(true)
            try {
                const save_event = await savePublication(publication?.id)
                setSaveEvent(save_event)
            }
            catch (e) {
                toast({
                    variant: "destructive",
                    title: "!Oops",
                    description: "Something went wrong"
                })
            }
            finally {
                setLoading(false)
            }
        }
    }

    const removeLike = async () => {
        console.log("like", publication)
        if (saveEvent?.id) {
            setLoading(true)
            try {
                await removePublicationSaveEvent(saveEvent?.id)

                setSaveEvent(null)
            }
            catch (e) {
                toast({
                    variant: "destructive",
                    title: "!Oops",
                    description: "Something went wrong"
                })
            }
            finally {
                setLoading(false)
            }
        }
    }

    const loadSaveEvent = async () => {
        if (publication?.id) {
            setEventLoading(true)
            try {
                const save = await getPublicationSaveEvent(publication?.id)
                console.log("Save::", save)
                setSaveEvent(save)
            }
            catch (e) {
                // ignore
            }
            finally {
                setEventLoading(false)
            }

        }
    }

    function buyBook() {

        if (session == null) {
            toast({
                variant: "destructive",
                title: "!Oops",
                description: "Not Logged In"
            })
        }
        // else if (appId == null) {
        //     toast({
        //         variant: "destructive",
        //         title: "!Oops",
        //         description: "Could Not Buy Book"
        //     })
        // }
         else {
            let price = publication?.price ?? 1;
            price = price * DOLLAR_PER_ALGO;

            price = Math.round(price);

            var owner_address = publication?.creator?.walletAddress;

            // const book = new Book(
            //     publication?.name ?? "", 
            //     publication?.cover ?? "", 
            //     price,
            //     false,
            //     appId,
            //     publication?.creator?.publicKey ?? "",
            //     publication?.id ?? ""
            // )

            // console.log("Book Arguements are:")
            // console.log({
            //     name: publication?.name ?? "", 
            //     conver: publication?.cover ?? "", 
            //     price: price,
            //     sold: false,
            //     appID: appId,
            //     owner_key: publication?.creator?.publicKey ?? "",
            //     book_id: publication?.id ?? ""
            // })
           try {
            const senderAddress = session.data?.user.publicKey;

            if (privateKey == null) throw Error("De encrypt key")

            // buyProductAction(senderAddress, book, privateKey);
            payForBook(senderAddress, owner_address ?? "", price, privateKey)
            // if (publication?.id) {
            //     (publication.id);
            //   }
            // 
            purchaseBook(publication?.id ?? "");
            toast({
                title: "🎉 Success",
                description: "Successfully bought book",
            })
            window.location.href = '/dashboard/library'
           } catch(err) {
            console.log(err);
            toast({
                variant: "destructive",
                title: "!Oops",
                description: "Decrypt key first or check algo balance"
            })
           }
        }
    }

    useEffect(() => {
        (async () => {
            await loadSaveEvent()
        })()
    }, [])




    return (
        <div className={clsx("flex flex-row items-center gap-x-5", className)}>
            
            <Button onClick={() => {
                // saveEvent ? handleLike : removeLike
                if (isNull(saveEvent)) {
                    return handleLike()
                } else {
                    return removeLike()
                }
            }} isLoading={eventLoading || loading} className='gap-x-4' variant={'outline'} >
                <HeartIcon fill={!isNull(saveEvent) ? "red" : undefined} stroke={!isNull(saveEvent) ? "red" : undefined} />
                <span>Like</span>
            </Button>

            {showRead ? <Link legacyBehavior href={`/dashboard/publications/${publication?.id}/read`} >
                <Button className='gap-x-4' variant={'outline'} >
                    <BookOpenText />
                    <span>Read</span>
                </Button>
            </Link> : <Button className='gap-x-4' variant={'outline'} onClick={buyBook}>
                <BookOpenText />
                <span>Buy</span>
            </Button>}

        </div>
    )
}

export default Interactions