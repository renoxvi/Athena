"use client"
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input, Textarea } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { UploadDropzone } from '@/lib/uploadthing'
import { createPublication, updatePublication } from '@/server/publication'
import { zodResolver } from '@hookform/resolvers/zod'
import { Publication } from '@prisma/client'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const formSchema = z.object({
    name: z.string(),
    description: z.string(),
    price: z.number(),
    genre: z.string(),
    status: z.enum(['archived', 'draft', 'published']),
    cover: z.string(),
    file_url: z.string(),
    pages: z.number(),
    // tags: z.string()
}) 

type Schema = z.infer<typeof formSchema>

interface Props {
    publication: Publication | null
}

function EditPublication(props: Props) {
    const { publication } = props
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()
    const form = useForm<Schema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            cover: publication?.cover ?? undefined,
            description: publication?.description ?? undefined,
            file_url: publication?.file_url ?? undefined,
            genre: publication?.genre ?? undefined,
            name: publication?.name ?? undefined,
            pages: publication?.pages,
            price: publication?.price,
            status: publication?.status
        }
    })
    

    const onSubmit = async (values: Schema) => {
        console.log("Values", values)
        setLoading(true)
        try {
            if(!publication?.id) {
                return 
            }
            const p = await  updatePublication(publication?.id,{
                ...values
            })

            window.location.href = `/dashboard/store`

            toast({
                title: "🎉 Success",
                description: "Publication successfully updated",
            })
        }
        catch(e)
        {
            toast({
                variant: "destructive",
                title: "!Uh-oh",
                description: "Something went wrong"
            })
        }
        finally{
            setLoading(false)
        }
    }

  return (
    <div className="flex flex-col w-full h-full items-center  justify-center ">
        <div className="flex flex-col w-4/5  h-full items-center justify-center px-5 ">
            <h3 className='text-xl font-semibold' >
                Edit your publication
            </h3>
            <Form {...form} > 
                <form onSubmit={form.handleSubmit(onSubmit)} className='w-full h-full space-y-4' >
                    {/* name */}
                    <FormField
                        control={form.control}
                        name='name'
                        render={({field})=>{
                            return (
                                <FormItem>
                                    <FormLabel>
                                        Name
                                    </FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder='Name' type="text" />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )
                        }}
                    />

                    {/* description */}
                    <FormField
                        control={form.control}
                        name='description'
                        render={({field})=>{
                            return (
                                <FormItem>
                                    <FormLabel>
                                        Description
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea {...field} placeholder='Description' className='h-[100px]' />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )
                        }}
                    />

                    {/* upload */}
                    <FormField
                        control={form.control}
                        name='file_url'
                        render={({field})=>{
                            return (
                                <FormItem>
                                    <FormLabel>
                                        The Publication PDF
                                    </FormLabel>
                                    <FormControl>
                                        {/* <Textarea {...field} placeholder='Description' className='h-[100px]' /> */} 
                                        <UploadDropzone
                                            endpoint='imageUploader'
                                            onClientUploadComplete={(uploads)=>{
                                                const upload = uploads?.at(-1)

                                                if(upload){
                                                    field.onChange(upload.url)
                                                }
                                            }}
                                            onUploadError={(e)=>{
                                                toast({
                                                    variant: "destructive",
                                                    title: "!Oops",
                                                    description: "Something went wrong with the upload"
                                                })
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )
                        }}
                    />

                    {/* cover */}
                    <FormField
                        control={form.control}
                        name='cover'
                        render={({field})=>{
                            return (
                                <FormItem>
                                    <FormLabel>
                                        The Publication Cover page
                                    </FormLabel>
                                    <FormControl>
                                        {/* <Textarea {...field} placeholder='Description' className='h-[100px]' /> */} 
                                        <UploadDropzone
                                            onUploadError={(e)=>{
                                                toast({
                                                    variant: "destructive",
                                                    title: "!Oops",
                                                    description: "Something went wrong with the upload"
                                                })
                                            }}
                                            endpoint='imageUploader'
                                            onClientUploadComplete={(uploads)=>{
                                                const upload = uploads?.at(-1)

                                                if(upload){
                                                    field.onChange(upload.url)
                                                }
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )
                        }}
                    />

                    {/* genre */}
                    <FormField
                        control={form.control}
                        name='genre'
                        render={({field})=>{
                            return (
                                <FormItem>
                                    <FormLabel>
                                        Genre
                                    </FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder='Genre' type="text" />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )
                        }}
                    />

                    {/* status */}
                    <FormField
                        control={form.control}
                        name='status'
                        render={({field})=>{
                            return (
                                <FormItem>
                                    <FormLabel>
                                        Status
                                    </FormLabel>
                                    <FormControl>
                                        <Select  onValueChange={(value)=>{
                                            field.onChange(value)
                                        }} >
                                            <SelectTrigger>
                                                <SelectValue placeholder='Status' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="draft" > Draft </SelectItem>
                                                <SelectItem value="published" > Published </SelectItem>
                                                <SelectItem value="archived" > Archived </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )
                        }}
                    />

                    {/* page */}
                    <FormField
                        control={form.control}
                        name='pages'
                        render={({field})=>{
                            return (
                                <FormItem>
                                    <FormLabel>
                                        Number of pages
                                    </FormLabel>
                                    <FormControl>
                                        <Input {...field} type='number' placeholder='Number of pages' onChange={(e)=>{
                                            const v = e.target.value 
                                            if(v !== "") {
                                                const value  = parseInt(v)

                                                field.onChange(value) 
                                            }
                                        }} />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )
                        }}
                    />

                    {/* price */}
                    <FormField
                        control={form.control}
                        name='price'
                        render={({field})=>{
                            return (
                                <FormItem>
                                    <FormLabel>
                                        Price
                                    </FormLabel>
                                    <FormControl>
                                        <Input {...field} type='number' placeholder='Price' onChange={(e)=>{
                                            const v = e.target.value 
                                            if(v !== "") {
                                                const value  = parseInt(v)

                                                field.onChange(value) 
                                            }
                                        }} />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )
                        }}
                    />

                        
                    <FormControl    >
                        <Button isLoading={loading} type="submit" >
                            Submit
                        </Button>
                    </FormControl>
                
                </form>
            </Form>
        </div>
    </div>
  )
}

export default EditPublication