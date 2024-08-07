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

  const authorUsername = post?.author.username ?? cachedPost.authorUsername

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto space-y-4 py-4">
        <div className="bg-white shadow-md overflow-hidden rounded-lg">
          <div className="p-4 sm:p-6">
            <div className="flex items-center mb-4">
              <img
                src={post?.author.image ?? '/default-avatar.png'}
                alt={`${authorUsername}'s avatar`}
                className="h-12 w-12 rounded-full mr-4 object-cover border-2 border-gray-300"
              />
              <div>
                <p className="font-semibold text-lg text-gray-800 flex items-center">
                  {authorUsername}
                  {(authorUsername === 'ssangyongsports' || post?.check) && (
                    <svg
                      viewBox="0 0 22 22"
                      xmlns="http://www.w3.org/2000/svg"
                      className="inline-block w-5 h-5 ml-2 flex-shrink-0"
                    >
                      <path
                        d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"
                        fill="#1d9bf0"
                      ></path>
                    </svg>
                  )}
                </p>
                <p className="text-xs text-gray-500">
                  {formatTimeToNow(new Date(post?.createdAt ?? cachedPost.createdAt))}
                </p>
              </div>
            </div>
            <div className="prose max-w-none">
              <EditorOutput content={post?.content ?? cachedPost.content} />
            </div>
          </div>
        </div>

        <div className="bg-white shadow-md overflow-hidden rounded-lg">
          <div className="p-4 sm:p-6">
            <Suspense
              fallback={
                <div className="flex justify-center items-center h-20">
                  <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
                </div>
              }>
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