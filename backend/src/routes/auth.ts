import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { sendOTP } from '../utils/email';
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

    // Query Postgres database for user by email or Student ID
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { studentId: email } // 'email' variable holds the input value
        ]
      },
      select: {
        id: true,
        email: true,
        password: true, // Need password to compare
        name: true,
        role: true,
        department: true,
        notifyTickets: true,
        notifySystem: true,
      }
    });

    if (!user) {
       return res.status(401).json({ error: 'Invalid email/Student ID or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
       return res.status(401).json({ error: 'Invalid email/Student ID or password' });
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
        notifyTickets: true,
        notifySystem: true,
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
// Generate random 6 digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Request OTP
router.post('/request-otp', async (req, res) => {
  try {
    const { identifier } = req.body;
    
    if (!identifier) {
      return res.status(400).json({ error: 'Identifier is required' });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { studentId: identifier }
        ]
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const otp = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await prisma.user.update({
      where: { id: user.id },
      data: { resetOtp: otp, resetOtpExpiry: expiry }
    });

    const emailSent = await sendOTP(user.email, otp);
    
    if (!emailSent) {
      return res.status(500).json({ error: 'Failed to send OTP email' });
    }

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Request OTP error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email: identifier, otp } = req.body;

    if (!identifier || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { studentId: identifier }]
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.resetOtp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    if (!user.resetOtpExpiry || user.resetOtpExpiry < new Date()) {
      return res.status(400).json({ error: 'OTP has expired' });
    }

    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Verify OTP error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { email: identifier } = req.body;
    
    if (!identifier) {
      return res.status(400).json({ error: 'Identifier is required' });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { studentId: identifier }]
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const otp = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { resetOtp: otp, resetOtpExpiry: expiry }
    });

    await sendOTP(user.email, otp);

    res.json({ message: 'OTP resent successfully' });
  } catch (error) {
    console.error('Resend OTP error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { email: identifier, newPassword } = req.body;

    if (!identifier || !newPassword) {
      return res.status(400).json({ error: 'Email and new password are required' });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { studentId: identifier }]
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!user.resetOtpExpiry || user.resetOtpExpiry < new Date()) {
       return res.status(400).json({ error: 'Session expired. Please request a new OTP.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { 
        password: hashedPassword,
        resetOtp: null,
        resetOtpExpiry: null 
      }
    });

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
