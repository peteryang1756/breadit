'use client'
import CommentsSection from '@/components/CommentsSection'
import EditorOutput from '@/components/EditorOutput'
import { db } from '@/lib/db'
import { redis } from '@/lib/redis'
import { formatTimeToNow } from '@/lib/utils'
import { CachedPost } from '@/types/redis'
import { Post, User } from '@prisma/client'
import { Loader2 } from 'lucide-react'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { useState, useCallback } from 'react'

interface SubRedditPostPageProps {
  params: {
    postId: string
  }
}

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

const SubRedditPostPage = async ({ params }: SubRedditPostPageProps) => {
  const cachedPost = (await redis.hgetall(
    `post:${params.postId}`
  )) as CachedPost

  let post: (Post & { author: User }) | null = null

  if (!cachedPost) {
    post = await db.post.findFirst({
      where: {
        id: params.postId,
      },
      include: {
        author: true,
      },
    })
  }

  if (!post && !cachedPost) return notFound()

  return <PostContent post={post} cachedPost={cachedPost} />
}

const PostContent = ({ post, cachedPost }) => {
  const [showVerifiedInfo, setShowVerifiedInfo] = useState(false)

  const toggleVerifiedInfo = useCallback(() => {
    setShowVerifiedInfo(prev => !prev)
  }, [])

  return (
    <div className="max-w-4xl mx-auto mt-4 px-4 sm:px-6 lg:px-8">
      <div className='bg-white shadow-lg rounded-xl overflow-hidden'>
        <div className='p-6'>
          <div className='flex items-center mb-4'>
            <img
              src={post?.author.image ?? '/default-avatar.png'}
              alt={`${post?.author.username ?? cachedPost.authorUsername}'s avatar`}
              className='h-12 w-12 rounded-full mr-4 object-cover border-2 border-gray-200'
            />
            <div className='flex-grow'>
              <div className='flex items-center'>
                <p className='font-semibold text-gray-800 text-lg'>
                  {post?.author.username ?? cachedPost.authorUsername}
                </p>
                <button 
                  onClick={toggleVerifiedInfo}
                  className="ml-2 focus:outline-none"
                  aria-label="顯示認證信息"
                >
                  <svg
                    viewBox="0 0 22 22"
                    xmlns="http://www.w3.org/2000/svg"
                    className="inline-block w-5 h-5 flex-shrink-0"
                  >
                    <path
                      d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"
                      fill="#1d9bf0"
                    ></path>
                  </svg>
                </button>
              </div>
              <p className='text-sm text-gray-500'>
                {formatTimeToNow(new Date(post?.createdAt ?? cachedPost.createdAt))}
              </p>
            </div>
          </div>
          
          {showVerifiedInfo && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    此用戶是認證成員。認證成員經過驗證，並在社區中擁有特殊地位。
                  </p>
                </div>
              </div>
            </div>
          )}

          <h1 className='text-2xl font-bold text-gray-900 mb-4'>
            {post?.title ?? cachedPost.title}
          </h1>

          <div className='prose max-w-none'>
            <EditorOutput content={post?.content ?? cachedPost.content} />
          </div>

          <div className='mt-8'>
            <Suspense fallback={<Loader2 className='h-6 w-6 animate-spin text-gray-500' />}>
              {/* @ts-expect-error Server Component */}
              <CommentsSection postId={post?.id ?? cachedPost.id} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubRedditPostPage