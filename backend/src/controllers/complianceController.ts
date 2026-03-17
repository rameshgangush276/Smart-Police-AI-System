import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get procedural compliance monitoring alerts
export const getComplianceAlerts = async (req: Request, res: Response) => {
    try {
        const officerId = (req as any).user?.id;
        
        // Find recent complaints logic
        const latestCases = await prisma.complaint.findMany({
            where: { officerId },
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { complaintId: true, createdAt: true }
        });

        // Generate dynamic mock alerts based on the real cases
        const alerts = latestCases.map((c: any) => {
            const caseDate = c.createdAt;
            const daysSinceOpen = Math.floor((Date.now() - caseDate.getTime()) / (1000 * 3600 * 24));
            
            if (daysSinceOpen > 60) {
                 return { case: c.complaintId, alert: "URGENT: Charge sheet pending. Exceeding 60-day limit." };
            } else if (daysSinceOpen > 30) {
                 return { case: c.complaintId, alert: "WARNING: Investigation over 30 days old. Please submit interim report." };
            } else {
                 return { case: c.complaintId, alert: "OK: Within statutory time limits." };
            }
        });

        res.json({ officerId, alerts });
    } catch (error) {
        console.error("Compliance Alert Error:", error);
        res.status(500).json({ message: 'Error fetching compliance alerts' });
    }
};

// Simulate AI Challan (Charge Sheet) Scrutiny
export const scrutinizeChallan = async (req: Request, res: Response) => {
    try {
        const { complaintId, challanText } = req.body;

        if (!challanText) {
            return res.status(400).json({ message: 'Challan text is required for scrutiny' });
        }

        const lowercaseText = challanText.toLowerCase();
        const gapsFound = [];

        if (!lowercaseText.includes('medical report') && lowercaseText.includes('injury')) {
             gapsFound.push("Missing Medical Evaluation Report attachment reference.");
        }
        
        if (!lowercaseText.includes('witness statement') && !lowercaseText.includes('statement')) {
             gapsFound.push("No witness statements cited in the charge sheet.");
        }
        
        if (!lowercaseText.includes('confession') && lowercaseText.includes('admitted')) {
             gapsFound.push("Check admissibility of confession under section 25 Evidence Act.");
        }

        if (gapsFound.length === 0) {
            gapsFound.push("No procedural gaps detected. Ready for court submission.");
        }

        res.json({
            complaintId,
            status: gapsFound.includes("No procedural gaps detected. Ready for court submission.") ? "PASSED" : "NEEDS_REVIEW",
            proceduralGaps: gapsFound
        });

    } catch (error) {
         console.error("Challan Scrutiny Error:", error);
         res.status(500).json({ message: 'Error processing AI scrutiny' });
    }
};
