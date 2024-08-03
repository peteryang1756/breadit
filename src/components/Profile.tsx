'use client'

import { formatTimeToNow } from '@/lib/utils'
import { User, Post } from '@prisma/client'
import { MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { FC, useRef } from 'react'

interface ProfileProps {
  user: User & {
    Post: Post[]
  }
  postCount: number
}

const Profile: FC<ProfileProps> = ({
  user,
  postCount,
}) => {
  const bioRef = useRef<HTMLParagraphElement>(null)

  return (
    <div className='rounded-md bg-white shadow'>
      <div className='px-6 py-4'>
        <div className='w-full'>
          <div className='flex items-center justify-between'>
            <h1 className='text-2xl font-semibold text-gray-900'>
              {user.username}
            </h1>
            <span className='text-sm text-gray-500'>
              Joined {formatTimeToNow(new Date(user.createdAt))}
            </span>
          </div>

          {user.email && (
            <div className='mt-4 flex items-center text-sm text-gray-500'>
              <span>{user.email}</span>
            </div>
          )}

          {user.image && (
            <div className='mt-4'>
              <img src={user.image} alt={`${user.username}'s profile picture`} className="w-20 h-20 rounded-full" />
            </div>
          )}
        </div>
      </div>

      <div className='bg-gray-50 px-6 py-4'>
        <h2 className='text-lg font-semibold text-gray-900'>Recent Posts</h2>
        {user.Post.slice(0, 3).map((post) => (
          <div key={post.id} className='mt-4'>
            <Link href={`/post/${post.id}`}>
              <h3 className='text-md font-semibold text-gray-900'>{post.title}</h3>
            </Link>
            <p className='text-sm text-gray-500 mt-1'>
              Posted {formatTimeToNow(new Date(post.createdAt))}
            </p>
          </div>
        ))}
      </div>

      <div className='bg-gray-100 px-6 py-4'>
        <Link
          href={`/user/${user.username}/posts`}
          className='w-fit flex items-center gap-2 text-sm text-gray-600'>
          <MessageSquare className='h-4 w-4' /> {postCount} posts
        </Link>
      </div>
    </div>
  )
}

export default Profile
