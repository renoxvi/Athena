"use client";
import BookDetails from '@/components/book-details'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getCurrentUserPublications } from '@/server/publication';
import { Publication, User } from '@prisma/client';
import { PlusIcon, Search } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

function StorePage() {
  const [search, setSearch] = useState<string>()
  const [searchLoading, setSearchLoading] = useState(false)

  const [{ data, loading }, setPublications] = useState<{ data: Array<Publication & { creator: User | null }>, loading: boolean }>({
    data: [],
    loading: false
  })


  const loadStoreData = async (status?: any) => {
    setPublications((prev)=>{
      return {
        ...prev,
        loading: true
      }
    })
    try {
      const publications = await getCurrentUserPublications(search, status == "all" ? undefined : status)

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
    })()
  }, [])

  return (
    <div className="flex flex-col w-full items-center pt-5 gap-y-4">
      <h3 className="font-semibold text-xl w-full">
        Books you have published
      </h3>
 
      <Link href="/dashboard/store/new" legacyBehavior >
        <div className="flex cursor-pointer shadow-sm hover:bg-slate-100 flex-col items-center justify-center w-full rounded-md h-[100px] ring-1 ring-amber-50 ">

            <PlusIcon />
            <span>
              Create a new publication
            </span>
        </div>
      </Link>

      <div className="flex flex-row w-full items-center justify-between gap-x-4">
        <div className="flex flex-row items-center justify-center gap-x-3 w-4/5 ">
          <Input onChange={(e)=> setSearch(e.target.value)} placeholder='Search for your publicaions by title' />
          <Button onClick={handleSearch} variant={'outline'} isLoading={searchLoading} >
            <Search/>
          </Button>
        </div>
        <div className="flex flex-row items-center justify-center gap-x-3">
          <Select onValueChange={(value)=>{
            console.log("Value", value)
             handleChangeStatus(value)
          }} >
            <SelectTrigger>
              <SelectValue placeholder="Choose a status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='draft' >
                Draft
              </SelectItem>
              <SelectItem value='published' >
                Published
              </SelectItem>
              <SelectItem value='archived' >
                Archived
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {!loading && <div className="flex flex-col w-full items-center gap-y-5">
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
  )
}

export default StorePage