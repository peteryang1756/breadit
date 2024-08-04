import { GetServerSideProps } from 'next';
import { PrismaClient, User } from '@prisma/client';
import { useRouter } from 'next/router';

const prisma = new PrismaClient();

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;
  const User = await prisma.User.findUnique({
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

  if (!User) {
    return {
      notFound: true,
    };
  }

  return {
    props: { User },
  };
};

const ProfilePage = ({ User }: { User: User }) => {
  return (
    <div>
      <h1>{User.name} Profile</h1>
      <p>Email: {User.email}</p>
      <p>Username: {User.username}</p>

      <p>Posts: {User.Post.length}</p>
      <p>Comments: {User.Comment.length}</p>
      {/* 根據需要顯示其他用戶數據 */}
    </div>
  );
};

export default ProfilePage;
