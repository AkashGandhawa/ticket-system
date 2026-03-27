import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Handle mock login using email
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Simple validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const unsecurePasswordVerification = true; // In production use bcrypt.compare()

    // Query Postgres database for user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
      }
    });

    if (!user || !unsecurePasswordVerification) {
       return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Mock session token (Use JWT for production)
    const mockToken = Buffer.from(`${user.id}:${user.role}`).toString('base64');

    res.json({
      message: 'Login successful',
      token: mockToken,
      user
    });

  } catch (error) {
    console.error('Login error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Handle user registration
router.post('/register', async (req, res) => {
  try {
    const { name, studentId, email, password } = req.body;
 
    // Basic validation
    if (!name || !studentId || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
 
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { studentId }
        ]
      }
    });
 
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email or Student ID already exists' });
    }
 
    // Create new user
    const user = await prisma.user.create({
      data: {
        name,
        studentId,
        email,
        password, // In production use bcrypt.hash()
        role: 'STUDENT', // Default role for registration
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
      }
    });
 
    // Mock session token
    const mockToken = Buffer.from(`${user.id}:${user.role}`).toString('base64');
 
    res.status(201).json({
      message: 'Registration successful',
      token: mockToken,
      user
    });
 
  } catch (error) {
    console.error('Registration error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
 
export default router;
