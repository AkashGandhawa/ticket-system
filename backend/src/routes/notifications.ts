import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all notifications for a given user
// Typically in a JWT app, we would use a middleware to extract the `req.user.id`.
// Since this app passes the userId via a query param `?userId=` for simplicity from the client side:
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: String(userId) },
      orderBy: { createdAt: 'desc' },
      take: 50 // limit to 50
    });

    res.json(notifications);
  } catch (error) {
    console.error('Failed to fetch notifications', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark a single notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    res.json(notification);
  } catch (error) {
    console.error('Failed to mark notification as read', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark ALL notifications as read for a given user
router.put('/read-all', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    await prisma.notification.updateMany({
      where: { userId: String(userId), isRead: false },
      data: { isRead: true }
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Failed to mark all notifications as read', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
