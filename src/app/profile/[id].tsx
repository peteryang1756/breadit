import { GetServerSideProps } from 'next';
import { PrismaClient, User } from '@prisma/client';
import { useRouter } from 'next/router';

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
    props: { user },
  };
};

const ProfilePage = ({ user }: { user: User }) => {
  return (
    <div>
      <h1>{user.name} Profile</h1>
      <p>Email: {user.email}</p>
      <p>Username: {user.username}</p>

      <p>Posts: {user.Post.length}</p>
      <p>Comments: {user.Comment.length}</p>
      {/* 根據需要顯示其他用戶數據 */}
    </div>
  );
};

export default ProfilePage;
