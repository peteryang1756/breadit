// src/app/user/[username]/page.tsx

import Profile from '@/components/Profile'
import prisma from '@/lib/prisma'  // 假设你有一个Prisma客户端实例

export default async function UserProfilePage({ params }: { params: { username: string } }) {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    include: { posts: true }
  })

  if (!user) {
    return <div>User not found</div>
  }

  return (
    <div className="container mx-auto p-4">
      <Profile user={user} postCount={user.posts.length} />
    </div>
  )
}
