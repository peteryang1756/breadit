import { db } from '@/lib/db'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { email, username, check } = req.body

      // 使用 Prisma 客戶端添加新用戶
      const newUser = await db.user.create({
        data: {
          email,
          username,
          check,
        },
      })

      res.status(200).json({ message: '用戶已成功添加', user: newUser })
    } catch (error) {
      res.status(500).json({ message: '添加用戶時出錯', error: error.message })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}