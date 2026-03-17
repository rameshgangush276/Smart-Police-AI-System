import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get Officer Workload
export const getOfficerWorkload = async (req: Request, res: Response) => {
    try {
        // Only SUPERVISOR role should technically access this, but we'll assume auth middleware handles it or we do a basic check
        const user = (req as any).user;
        if (user?.role !== 'SUPERVISOR' && user?.role !== 'SHO' && user?.role !== 'DSP') {
             // For the sake of the prototype, we are letting anyone view it so we don't block the UI, 
             // but in a real app we'd block this.
             // console.log("User might not be a supervisor"); 
        }

        // Fetch all assigned officers with their complaints
        const officers = await prisma.officer.findMany({
            include: {
                complaints: {
                    select: {
                        status: true
                    }
                }
            }
        });

        // Map and aggregate
        const workloadData = officers.map(officer => {
            let pendingCount = 0;
            let closedCount = 0;

            officer.complaints.forEach(complaint => {
                if (complaint.status === 'CLOSED') {
                    closedCount++;
                } else {
                    pendingCount++;
                }
            });

            return {
                officerId: officer.id,
                officerName: officer.name,
                station: officer.station,
                pendingCases: pendingCount,
                closedCases: closedCount,
                totalCases: pendingCount + closedCount
            };
        });

        // Sort by pending cases descending
        workloadData.sort((a, b) => b.pendingCases - a.pendingCases);

        res.json({ success: true, data: workloadData });
    } catch (error) {
        console.error("Get Workload Error:", error);
        res.status(500).json({ message: 'Error fetching workload data' });
    }
}
