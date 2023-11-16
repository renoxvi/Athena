"use client"
import { getComments } from '@/server/publication'
import { Comment , Publication, User } from '@prisma/client'
import React, { useEffect, useState } from 'react'
import _Comment from './comment'
import CommentBox from './comment-box'

interface Props {
    publication_id: string
}

function CommentsSection(props: Props) {

    const { publication_id } = props 
    console.log("Publication ID ", publication_id)

    const [{ data, loading }, setComments] = useState<{
        loading: boolean, 
        data: Array<Partial<Comment> & { user: Partial<User> | null }>
    }>({
        data: [],
        loading: false
    })

    const loadComments = async () => {

        setComments((prev)=>{
           return {
            loading: true,
            data: prev?.data ?? []
           }
        })
        try {
            const comments = await getComments(publication_id)

            setComments((prev)=>{
                return {
                    ...prev,
                    data: comments
                }
            })
        }
        catch(e)
        {
            // ignore
        }
        finally
        {
            setComments((prev)=>{
                return {
                 loading: true,
                 data: prev?.data ?? []
                }
             })
        }
    }

    const addComment = async (comment: Partial<Comment> & { user: Partial<User> | null }) => {
        console.log("Comment::", comment)
        setComments((prev)=> {
            return {
                ...prev,
                data: [
                    ...prev.data,
                    comment
                ]
            }
        })
    }


    useEffect(()=>{
        (async ()=>{
            await loadComments()
        })()
    }, [])

  return (
    <div className="flex flex-col px-5 py-10 w-full h-full gap-y-5">
        <h3 className='text-1xl font-semibold' >
            Comments
        </h3>
        <div className="flex flex-col w-full h-full gap-y-3">
            {
                data?.map((comment, i) =>{
                    return (
                        <_Comment
                            key={i}
                            comment={comment}
                        />
                    )
                })
            }
        </div>
        <CommentBox
            publication_id={publication_id}
            onPost={addComment}
        />
    </div>
  )
}

export default CommentsSection