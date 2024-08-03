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
    <div className="max-w-4xl mx-auto mt-8">
      <div className='bg-white shadow-md rounded-lg overflow-hidden'>
        <div className='p-6'>
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
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>
            {post?.title ?? cachedPost.title}
          </h1>

          <div className='prose max-w-none'>
            <EditorOutput content={post?.content ?? cachedPost.content} />
          </div>

          <div className='mt-6'>
            <Suspense fallback={<Loader2 className='h-5 w-5 animate-spin text-gray-500' />}>
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
