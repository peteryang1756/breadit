import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    res.status(400).json({ error: 'Invalid ID' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
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
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}