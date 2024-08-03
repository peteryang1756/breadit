// src/lib/userData.ts

import { User, Post } from '@prisma/client'

export async function getUserData(username: string): Promise<User & { posts: Post[] }> {
  // 这里应该是你实际从数据库或API获取用户数据的逻辑
  // 这只是一个示例实现
  const user = await prisma.user.findUnique({
    where: { username },
    include: { posts: true }
  })

  if (!user) {
    throw new Error('User not found')
  }

  return user
}
