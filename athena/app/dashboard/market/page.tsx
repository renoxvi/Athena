"use client"
import BookDetails from '@/components/book-details'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getMarketPublications } from '@/server/publication'
import { Publication, User } from '@prisma/client'
import { Search } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { getBooksAction, Book } from '@/algorand/books'
import DecryptPrivateKey from '@/components/decrypt-private-key'
import Library from '../library/page'

function MarketPage() {
    const [search, setSearch] = useState<string>()
  const [searchLoading, setSearchLoading] = useState(false)
  //const [algoBooks, setAlgoBooks] = useState<Book[]>([])

  const [{ data, loading }, setPublications] = useState<{ data: Array<Publication & { creator: User | null }>, loading: boolean }>({
    data: [],
    loading: false
  })

  // async function getBooksFromBlockChain() {
  //   let books = await getBooksAction();
  //   console.log("Books Are: ")
  //   console.log(books);
  //   setAlgoBooks(books);
  // }


  const loadStoreData = async (status?: any) => {
    setPublications((prev)=>{
      return {
        ...prev,
        loading: true
      }
    })
    try {
      const publications = await getMarketPublications(search)

      setPublications((prev)=>{
        return {
          ...prev,
          data: publications
        }
      })
    }
    catch(e)
    {
      // ignore
    }
    finally
    {
      setPublications((prev)=>{
        return {
          ...prev,
          loading: false
        }
      })
    }
  }


  const handleChangeStatus = async (value: string) => {
    await loadStoreData(value)
  }

  const handleSearch = async () => {
    setSearchLoading(true)
    await loadStoreData()
    setSearchLoading(false)
  }

  useEffect(()=>{
    (async ()=>{
      loadStoreData()
      // await getBooksFromBlockChain()
    })()
  }, [])
  return (
    <div className="flex flex-col items-center w-screen h-full px-5 py-10">
        <div className="h-full w-4/5 flex flex-col items-center gap-y-4 ">

             {/* Search bar */}
            <div className="flex flex-row items-center justify-between w-full gap-x-3">
                <Input onChange={(e)=> setSearch(e.target.value)} placeholder='Search by book title or @the-author-username' /> 
                <Button onClick={handleSearch} >
                    <Search/>
                </Button>
            </div>

            <DecryptPrivateKey visible={true}/>

            {!loading && <div className="flex flex-col w-full items-center gap-y-5">
            {
                data?.map((publication, i)=> {
                  // let book = algoBooks.find((e) => e.book_id = publication.id);
                  return  (
                    <BookDetails
                        key={i}
                        publication={publication}
                        showRead={false}
                    />
                  )
                })
                }
            </div>}
            {
                loading && <div className="flex flex-col w-full items-center gap-y-5">
                <div className="w-full rounded-md bg-slate-100 animate-pulse h-[300px] shadow-sm"></div>
                <div className="w-full rounded-md bg-slate-100 animate-pulse h-[300px] shadow-sm"></div>
                <div className="w-full rounded-md bg-slate-100 animate-pulse h-[300px] shadow-sm"></div>
                <div className="w-full rounded-md bg-slate-100 animate-pulse h-[300px] shadow-sm"></div>
                </div>
            }
        </div>
    </div>
  )
}

export default MarketPage