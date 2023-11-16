"use client";
import BookDetails from '@/components/book-details'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'
import { getPurchasedBooks } from '@/server/publication';
import { Publication, User } from '@prisma/client';
import { Search } from 'lucide-react';
import React, { useEffect, useState } from 'react'

function Library() {
  const [{ data, loading }, setPublications] = useState<{ data: Array<Publication & { creator: User | null }>, loading: boolean }>({
    data: [],
    loading: false
  })
  const [searchLoading, setSearchLoading] = useState(false)
  const [search, setSearch] = useState<string>()

  const handleSearch = async () => {
    setSearchLoading(true)
    await loadStoreData(search)
    setSearchLoading(false)
  }



  const loadStoreData = async (search?: any) => {
    setPublications((prev)=>{
      return {
        ...prev,
        loading: true
      }
    })
    try {
      const publications = await getPurchasedBooks(search)

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


  useEffect(()=>{
    (async ()=>{
      loadStoreData()
    })()
  }, [])

  return (
    <div className="w-full h-full flex flex-col items-center justify-start gap-y-4">
        <div className="flex flex-row items-center justify-between w-full gap-x-3">
          <Input onChange={(e)=> setSearch(e.target.value)} placeholder='Search by book title or @the-author-username' /> 
          <Button onClick={handleSearch} >
            <Search/>
          </Button>
        </div>
        <p className='w-full text-left' >
          You have a good eye for quality books :)
        </p>
        <div className="flex flex-col w-full items-center gap-y-5">
        {
          data?.map((publication, i)=> {
            return  (
              <BookDetails
                key={i}
                publication={publication}
                showRead={true}
              />
            )
          })
        }
      </div>
    </div>
  )
}

export default Library