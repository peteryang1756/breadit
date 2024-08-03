// src/app/user/[username]/page.tsx

import Profile from '@/components/Profile'
import { Primsa } from '@prisma/client'

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
