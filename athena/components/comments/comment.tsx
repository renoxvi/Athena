import { Comment, User } from '@prisma/client'
import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

interface Props {
  comment: Partial<Comment & {
    user: Partial<User> | null
  }>
}

function Comment(props: Props) {
  const { comment } = props
  return (
    <div className="flex flex-col w-full rounded-sm bg-slate-100 px-3 py-3 gap-y-2">
       <p>
        {comment.content}
       </p>
       <div className="flex flex-row items-center justify-end w-full">
          <div className="flex flex-row items-center gap-x-3">
            <Avatar>
              <AvatarImage src={comment?.user?.image ?? ""} alt={comment?.user?.name ?? ""} />
              <AvatarFallback>
                { comment?.user?.username }
              </AvatarFallback>
            </Avatar>
            <span>
              {
                comment?.user?.username
              }
            </span>
          </div>
       </div>
    </div>
  )
}

export default Comment