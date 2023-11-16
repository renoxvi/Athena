import React, { useState } from 'react'
import { Textarea } from '../ui/input'
import { Button } from '../ui/button'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Comment, User } from '@prisma/client'
import { useToast } from '../ui/use-toast'
import { postComment } from '@/server/publication'

const formSchema = z.object({
    comment: z.string()
})


type Schema = z.infer<typeof formSchema>

interface Props {
    onPost?: (data: Partial<Comment> & { user: Partial<User> | null }) => void,
    publication_id?: string
}

function CommentBox( props: Props ) { 
  const { onPost, publication_id } = props 
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const form = useForm<Schema>({
    resolver: zodResolver(formSchema)
  })

  const handleSubmit = async (values: Schema) => {
    console.log("Values", values)
    console.log("publication", publication_id)
    if(!publication_id){
        return
    }
    setLoading(true)
    try {

        const comment = await postComment(publication_id, values.comment)
        console.log("COmment::",comment)
        onPost?.(comment)

    }
    catch(e)
    {
        toast({
            variant: "destructive",
            title: "!Uh-oh",
            description: "Something went wrong"
        })
    }
    finally
    {
        setLoading(false)
    }

  }

  return (
    <div className="flex flex-col w-full gap-y-3">
            <h3 className="text-lg font-medium">
                Enter your comment
            </h3>
            <Form {...form} >
                <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-5' >
                    <FormField
                        control={form.control}
                        name='comment'
                        render={({field})=>{
                            return (
                                <FormItem>
                                    <FormLabel>
                                        Enter your comment 
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea {...field} placeholder='Enter your comment here..' className='w-full h-[100px]' /> 
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem> 
                            )
                        }}
                    />
                    <FormControl>
                        <Button isLoading={loading} type="submit" >
                            Comment
                        </Button>
                    </FormControl>
                </form>
            </Form>
        </div> 
  )
}

export default CommentBox