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
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6">
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
                      aria-hidden="true"
                      className="ml-2 h-5 w-5 text-blue-500"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        clipRule="evenodd"
                        d="M13.596 3.011L11 .5 8.404 3.011l-3.576-.506-.624 3.558-3.19 1.692L2.6 11l-1.586 3.245 3.19 1.692.624 3.558 3.576-.506L11 21.5l2.596-2.511 3.576.506.624-3.558 3.19-1.692L19.4 11l1.586-3.245-3.19-1.692-.624-3.558-3.576.506zM6 11.39l3.74 3.74 6.2-6.77L14.47 7l-4.8 5.23-2.26-2.26L6 11.39z"
                        fill="currentColor"
                      />
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
            <Suspense
              fallback={
                <div className="flex justify-center items-center h-20">
                  <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
                </div>
              }>
              {/* @ts-expect-error Server Component */}

            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubRedditPostPage
