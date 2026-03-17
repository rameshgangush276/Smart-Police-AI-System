import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-police-key';

export const login = async (req: Request, res: Response) => {
  try {
    const { officerId, password } = req.body;

    const officer = await prisma.officer.findUnique({
      where: { officerId },
    });

    if (!officer) {
      return res.status(401).json({ message: 'Invalid officer ID or password' });
    }

    const isMatch = await bcrypt.compare(password, officer.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid officer ID or password' });
    }

    const token = jwt.sign(
      { id: officer.id, officerId: officer.officerId, role: officer.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      officer: {
        id: officer.id,
        officerId: officer.officerId,
        name: officer.name,
        role: officer.role,
        station: officer.station,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const officerId = (req as any).user.id;
    const officer = await prisma.officer.findUnique({
      where: { id: officerId },
      select: {
        id: true,
        officerId: true,
        name: true,
        role: true,
        station: true,
        designation: true,
        signatureImage: true,
        aadhaarNumber: true
      }
    });

    if (!officer) return res.status(404).json({ message: 'Officer not found' });
    res.json({ success: true, officer });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const officerId = (req as any).user.id;
    const { designation, aadhaarNumber, signatureImage } = req.body;
    
    console.log(`[Updating Profile] Officer ID: ${officerId}`);
    console.log(`[Updating Profile] Data:`, req.body);

    const officer = await prisma.officer.update({
      where: { id: officerId },
      data: {
        designation,
        aadhaarNumber,
        signatureImage
      }
    });

    console.log(`[Updating Profile] Success:`, officer.officerId);
    res.json({ success: true, officer });
  } catch (error) {
    console.error(`[Updating Profile] Error:`, error);
    res.status(500).json({ message: 'Update error' });
  }
};

// Seeder function for testing
export const seedOfficer = async (req: Request, res: Response) => {
    try {
        const { officerId, password, name, role, station } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const officer = await prisma.officer.create({
            data: {
                officerId,
                password: hashedPassword,
                name,
                role: role || 'OFFICER',
                station
            }
        });
        
        res.status(201).json({ message: 'Officer seeded', officer });
    } catch(err) {
        console.error(err);
        res.status(500).json({ message: 'Seed error' });
    }
}
