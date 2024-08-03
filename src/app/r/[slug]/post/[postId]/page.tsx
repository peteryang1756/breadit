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

  return (
    <div>
      <div className='h-full flex flex-col sm:flex-row items-center sm:items-start justify-between'>
        <div className='sm:w-0 w-full flex-1 bg-white p-4 rounded-sm'>
          <div className='flex items-center mb-4'>
            <img
              src={post?.author.image ?? '/default-avatar.png'}
              alt={`${post?.author.username ?? cachedPost.authorUsername}'s avatar`}
              className='h-10 w-10 rounded-full mr-3 object-cover border-2 border-gray-200'
            />
            <div>
              <p className='font-semibold text-gray-800'>
                {post?.author.username ?? cachedPost.authorUsername}
              </p>
              <p className='text-xs text-gray-500'>
                {formatTimeToNow(new Date(post?.createdAt ?? cachedPost.createdAt))}
              </p>
            </div>
          </div>

          <EditorOutput content={post?.content ?? cachedPost.content} />
          <Suspense
            fallback={
              <Loader2 className='h-5 w-5 animate-spin text-zinc-500' />
            }>
            {/* @ts-expect-error Server Component */}
            <CommentsSection postId={post?.id ?? cachedPost.id} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default SubRedditPostPage