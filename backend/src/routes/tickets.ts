import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all tickets
router.get('/', async (req, res) => {
  try {
    const tickets = await prisma.ticket.findMany({
      include: {
        category: true,
        author: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true } },
        attachments: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// Get tickets assigned to a specific technician
router.get('/assigned/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tickets = await prisma.ticket.findMany({
      where: { assignedToId: id },
      include: { 
        category: true, 
        author: { select: { id: true, name: true, email: true } } 
      }
    });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assigned tickets' });
  }
});

// Create a new ticket
router.post('/', async (req, res) => {
  try {
    const { title, description, categoryId, priority, location, device, authorId, attachments } = req.body;
    
    const newTicket = await prisma.ticket.create({
      data: {
        title,
        description,
        categoryId,
        priority: priority || 'LOW',
        location,
        device,
        authorId,
        attachments: {
          create: attachments?.map((a: any) => ({
            name: a.name,
            size: a.size,
            type: a.type,
            url: a.url
          })) || []
        }
      },
      include: {
        attachments: true
      }
    });

    // Notify Admins
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN', notifyTickets: true } });
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map(admin => ({
          userId: admin.id,
          message: `New ticket created: ${title}`,
          ticketId: newTicket.id
        }))
      });
    }

    res.status(201).json(newTicket);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create ticket', details: String(error) });
  }
});

// Update a ticket (Status, Assignment)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedToId, priority } = req.body;

    const existingTicket = await prisma.ticket.findUnique({ where: { id }, include: { author: true } });

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: { status, assignedToId, priority },
    });

    if (existingTicket) {
      // Notify Tech on new assignment
      if (assignedToId && existingTicket.assignedToId !== assignedToId) {
        const tech = await prisma.user.findUnique({ where: { id: assignedToId } });
        if (tech?.notifyTickets) {
          await prisma.notification.create({
            data: {
              userId: tech.id,
              message: `You were assigned to ticket: ${existingTicket.title}`,
              ticketId: id
            }
          });
        }
      }
      // Notify Student on status change
      if (status && existingTicket.status !== status && existingTicket.author.notifyTickets) {
        await prisma.notification.create({
          data: {
            userId: existingTicket.authorId,
            message: `Your ticket status changed to ${status}`,
            ticketId: id
          }
        });
      }
    }

    res.json(updatedTicket);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

export default router;
