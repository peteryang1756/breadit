// src/app/user/[username]/page.tsx

import Profile from '@/components/Profile'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

export default async function UserProfilePage({ params }: { params: { username: string } }) {
  const user = await db.user.findUnique({
    where: { username: params.username },
    include: { Post: true } // 修改這裡
  })

  if (!user) {
    return <div>User not found</div>
  }

  return (
    <div className="container mx-auto p-4">
      <Profile user={user} postCount={user.Post.length} /> {/* 修改這裡 */}
    </div>
  )
}
