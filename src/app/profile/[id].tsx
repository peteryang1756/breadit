import { GetServerSideProps } from 'next';
import { PrismaClient, User, Post, Comment } from '@prisma/client';

const prisma = new PrismaClient();

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;
  const user = await prisma.user.findUnique({
    where: { id: String(id) },
    include: {
      createdSubreddits: true,
      subscriptions: {
        include: {
          subreddit: true,
        },
      },
      votes: {
        include: {
          post: true,
        },
      },
      Post: true,
      Comment: true,
    },
  });

  if (!user) {
    return {
      notFound: true,
    };
  }

  return {
    props: { user: JSON.parse(JSON.stringify(user)) },
  };
};

type UserWithRelations = User & {
  Post: Post[];
  Comment: Comment[];
  createdSubreddits: any[];
  subscriptions: any[];
  votes: any[];
};

const ProfilePage = ({ user }: { user: UserWithRelations }) => {
  return (
    <div>
      <h1>{user.name} Profile</h1>
      <p>Email: {user.email}</p>
      <p>Username: {user.username}</p>

      <p>Posts: {user.Post.length}</p>
      <p>Comments: {user.Comment.length}</p>
      <p>Created Subreddits: {user.createdSubreddits.length}</p>
      <p>Subscriptions: {user.subscriptions.length}</p>
      <p>Votes: {user.votes.length}</p>
      {/* 根據需要顯示其他用戶數據 */}
    </div>
  );
};

export default ProfilePage;
