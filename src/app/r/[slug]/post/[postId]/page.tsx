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
    <div>
      <div className='h-full flex flex-col sm:flex-row items-center sm:items-start justify-between'>
        <div className='sm:w-0 w-full flex-1 bg-white p-4 rounded-sm'>
          <div className='flex items-center mb-4'>
            <img
              src={post?.author.image ?? '/default-avatar.png'}
              alt={`${authorUsername}'s avatar`}
              className='h-10 w-10 rounded-full mr-3 object-cover border-2 border-gray-200'
            />
            <div>
              <p className='font-semibold text-gray-800 flex items-center'>
                {authorUsername}
                {(authorUsername === 'ssangyongsports' || post?.check) && (
                 
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg
   viewBox="0 0 22 22"
   aria-hidden="true"
   class="r-4qtqp9 r-yyyyoo r-1yjpyg1 r-1xvli5t r-dnmrzs r-bnwqim r-1plcrui r-lrvibr"
   data-testid="verificationBadge"
   version="1.1"
   id="svg30"
   xmlns="http://www.w3.org/2000/svg"
   xmlns:svg="http://www.w3.org/2000/svg">
  <defs
     id="defs34" />
  <g
     id="g28">
    <path
       clip-rule="evenodd"
       d="M13.596 3.011L11 .5 8.404 3.011l-3.576-.506-.624 3.558-3.19 1.692L2.6 11l-1.586 3.245 3.19 1.692.624 3.558 3.576-.506L11 21.5l2.596-2.511 3.576.506.624-3.558 3.19-1.692L19.4 11l1.586-3.245-3.19-1.692-.624-3.558-3.576.506zM6 11.39l3.74 3.74 6.2-6.77L14.47 7l-4.8 5.23-2.26-2.26L6 11.39z"
       fill="url(#paint0_linear_8728_433881)"
       fill-rule="evenodd"
       id="path2" />
    <path
       clip-rule="evenodd"
       d="M13.348 3.772L11 1.5 8.651 3.772l-3.235-.458-.565 3.219-2.886 1.531L3.4 11l-1.435 2.936 2.886 1.531.565 3.219 3.235-.458L11 20.5l2.348-2.272 3.236.458.564-3.219 2.887-1.531L18.6 11l1.435-2.936-2.887-1.531-.564-3.219-3.236.458zM6 11.39l3.74 3.74 6.2-6.77L14.47 7l-4.8 5.23-2.26-2.26L6 11.39z"
       fill="url(#paint1_linear_8728_433881)"
       fill-rule="evenodd"
       id="path4" />
    <path
       clip-rule="evenodd"
       d="M6 11.39l3.74 3.74 6.197-6.767h.003V9.76l-6.2 6.77L6 12.79v-1.4zm0 0z"
       fill="#D18800"
       fill-rule="evenodd"
       id="path6" />
    <defs
       id="defs26">
      <linearGradient
         gradientUnits="userSpaceOnUse"
         id="paint0_linear_8728_433881"
         x1="4"
         x2="19.5"
         y1="1.5"
         y2="22">
        <stop
           stop-color="#F4E72A"
           id="stop8" />
        <stop
           offset=".539"
           stop-color="#CD8105"
           id="stop10" />
        <stop
           offset=".68"
           stop-color="#CB7B00"
           id="stop12" />
        <stop
           offset="1"
           stop-color="#F4EC26"
           id="stop14" />
        <stop
           offset="1"
           stop-color="#F4E72A"
           id="stop16" />
      </linearGradient>
      <linearGradient
         gradientUnits="userSpaceOnUse"
         id="paint1_linear_8728_433881"
         x1="5"
         x2="17.5"
         y1="2.5"
         y2="19.5">
        <stop
           stop-color="#F9E87F"
           id="stop19" />
        <stop
           offset=".406"
           stop-color="#E2B719"
           id="stop21" />
        <stop
           offset=".989"
           stop-color="#E2B719"
           id="stop23" />
      </linearGradient>
    </defs>
  </g>
</svg>

                )}
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