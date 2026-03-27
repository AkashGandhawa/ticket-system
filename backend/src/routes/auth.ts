import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

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

    // Query Postgres database for user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true, // Need password to compare
        name: true,
        role: true,
        department: true,
      }
    });

    if (!user) {
       return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
       return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Mock session token (Use JWT for production)
    const mockToken = Buffer.from(`${user.id}:${user.role}`).toString('base64');

    // Remove password before sending to client
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      token: mockToken,
      user: userWithoutPassword
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
    
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
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
 
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await prisma.user.create({
      data: {
        name,
        studentId,
        email,
        password: hashedPassword,
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
