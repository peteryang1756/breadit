import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { Comment, CommentVote, User } from '@prisma/client'
import CreateComment from './CreateComment'
import PostComment from './comments/PostComment'

type ExtendedComment = Comment & {
  votes: CommentVote[]
  author: User
  replies: ReplyComment[]
}

type ReplyComment = Comment & {
  votes: CommentVote[]
  author: User
}

interface CommentsSectionProps {
  postId: string
  comments: ExtendedComment[]
}

const CommentsSection = async ({ postId }: CommentsSectionProps) => {
  const session = await getAuthSession()

  const comments = await db.comment.findMany({
    where: {
      postId: postId,
      replyToId: null, // only fetch top-level comments
    },
    include: {
      author: true,
      votes: true,
      replies: {
        // first level replies
        include: {
          author: true,
          votes: true,
        },
      },
    },
  })

  return (
    <div className='max-w-3xl mx-auto mt-8'>
      <h2 className='text-2xl font-bold mb-4'>評論</h2>

      <div className='space-y-4'>
        {comments
          .filter((comment) => !comment.replyToId)
          .map((topLevelComment) => {
            const topLevelCommentVotesAmt = topLevelComment.votes.reduce(
              (acc, vote) => {
                if (vote.type === 'UP') return acc + 1
                if (vote.type === 'DOWN') return acc - 1
                return acc
              },
              0
            )

            const topLevelCommentVote = topLevelComment.votes.find(
              (vote) => vote.userId === session?.user.id
            )

            return (
              <div key={topLevelComment.id} className='bg-white rounded-lg shadow-sm p-6'>
                <PostComment
                  comment={topLevelComment}
                  currentVote={topLevelCommentVote}
                  votesAmt={topLevelCommentVotesAmt}
                  postId={postId}
                />

                {/* Render replies */}
                {topLevelComment.replies.length > 0 && (
                  <div className='mt-4 ml-8 space-y-4'>
                    {topLevelComment.replies
                      .sort((a, b) => b.votes.length - a.votes.length) // Sort replies by most liked
                      .map((reply) => {
                        const replyVotesAmt = reply.votes.reduce((acc, vote) => {
                          if (vote.type === 'UP') return acc + 1
                          if (vote.type === 'DOWN') return acc - 1
                          return acc
                        }, 0)

                        const replyVote = reply.votes.find(
                          (vote) => vote.userId === session?.user.id
                        )

                        return (
                          <div key={reply.id} className='bg-white rounded-lg shadow-sm p-4'>
                            <PostComment
                              comment={reply}
                              currentVote={replyVote}
                              votesAmt={replyVotesAmt}
                              postId={postId}
                            />
                          </div>
                        )
                      })}
                  </div>
                )}
              </div>
            )
          })}
      </div>

      {/* Create Comment section at the bottom */}
      <div className='mt-8 bg-white rounded-lg shadow-sm p-6'>
        <CreateComment postId={postId} />
      </div>
    </div>
  )
}

export default CommentsSection