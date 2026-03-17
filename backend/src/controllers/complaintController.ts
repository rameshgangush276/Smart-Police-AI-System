import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Create a new complaint
export const createComplaint = async (req: Request, res: Response) => {
    try {
        const {
            complainantName,
            fatherHusbandName,
            mobileNumber,
            address,
            incidentDate,
            incidentTime,
            incidentLocation,
            latitude,
            longitude,
            crimeCategory,
            incidentDescription,
            suspectDetails,
            witnessDetails,
            gender
        } = req.body;

        const officerId = (req as any).user?.id || req.body.officerId;

        const complaintId = `CMP-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 100)}`;

        const newComplaint = await prisma.complaint.create({
            data: {
                complaintId,
                complainantName,
                fatherHusbandName,
                mobileNumber,
                address,
                incidentDate: incidentDate ? new Date(incidentDate) : null,
                incidentTime,
                incidentLocation,
                latitude,
                longitude,
                crimeCategory,
                incidentDescription,
                suspectDetails,
                witnessDetails,
                gender,
                officerId // Links to officer table via ID
            }
        });

        res.status(201).json({ message: 'Complaint registered successfully', complaint: newComplaint });
    } catch (error) {
        console.error("Create Complaint Error:", error);
        res.status(500).json({ message: 'Error registering complaint' });
    }
};

// Get all complaints for the logged in officer
export const getMyComplaints = async (req: any, res: Response) => {
    try {
        // req.user is set by authenticateJWT middleware
        const loggedInOfficerId = req.user?.id;
        
        if (!loggedInOfficerId) return res.status(401).json({ message: "Unauthorized" });

        const { status, crimeType, startDate, endDate } = req.query;
        let whereClause: any = { officerId: loggedInOfficerId };

        if (status) whereClause.status = String(status);
        if (crimeType) whereClause.crimeCategory = String(crimeType);
        
        if (startDate || endDate) {
            whereClause.incidentDate = {};
            if (startDate) whereClause.incidentDate.gte = new Date(String(startDate));
            if (endDate) whereClause.incidentDate.lte = new Date(String(endDate));
        }

        const complaints = await prisma.complaint.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            include: { evidence: true }
        });

        res.json(complaints);
    } catch(err) {
        console.error("Get Complaints Error:", err);
        res.status(500).json({ message: 'Error fetching complaints' });
    }
};

// Get complaint by ID
export const getComplaintById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const complaint = await prisma.complaint.findUnique({
            where: { id },
            include: {
                evidence: true,
                statements: true,
                officer: {
                    select: {
                        name: true,
                        officerId: true,
                        station: true
                    }
                }
            }
        });

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        res.json(complaint);
    } catch (err) {
        console.error("Get Complaint By ID Error:", err);
        res.status(500).json({ message: 'Error fetching complaint details' });
    }
};

// Update an existing complaint
export const updateComplaint = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const updateData = req.body;

        const updatedComplaint = await prisma.complaint.update({
            where: { id },
            data: updateData
        });

        res.json({ message: 'Complaint updated updated', complaint: updatedComplaint });
    } catch(err) {
        console.error("Update Complaint Error:", err);
        res.status(500).json({ message: 'Error updating complaint' });
    }
}

// Upload Evidence
export const uploadEvidence = async (req: Request, res: Response) => {
    try {
        const complaintId = req.params.id as string;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const type = req.body.type || 'DOCUMENT'; // PHOTO, VIDEO, AUDIO, DOCUMENT
        const description = req.body.description || '';
        const url = `/uploads/${file.filename}`;

        const evidence = await prisma.evidence.create({
            data: {
                type,
                url,
                description,
                complaintId,
                uploadedBy: req.body.uploadedBy || (req as any).user?.id || null,
                latitude: req.body.latitude ? parseFloat(req.body.latitude) : null,
                longitude: req.body.longitude ? parseFloat(req.body.longitude) : null
            }
        });

        res.status(201).json({ message: 'Evidence uploaded successfully', evidence });
    } catch(err) {
        console.error("Evidence Upload Error:", err);
        res.status(500).json({ message: 'Error uploading evidence' });
    }
}

// Levenshtein Distance Algorithm
const levenshtein = (a: string, b: string): number => {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    
    const matrix = [];
    
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }
    
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) == a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                );
            }
        }
    }
    return matrix[b.length][a.length];
};

// Smart Search
export const searchComplaints = async (req: Request, res: Response) => {
    try {
        const {
            q, // Generic general search term
            complaintId,
            name,
            mobileNumber,
            crimeType,
            startDate,
            endDate,
            location
        } = req.query;

        // Base where clause for database query
        let whereClause: any = {};

        if (complaintId) whereClause.complaintId = { contains: String(complaintId) };
        if (mobileNumber) whereClause.mobileNumber = { contains: String(mobileNumber) };
        if (crimeType) whereClause.crimeCategory = { equals: String(crimeType) };
        if (location) whereClause.incidentLocation = { contains: String(location) };

        if (startDate || endDate) {
            whereClause.incidentDate = {};
            if (startDate) whereClause.incidentDate.gte = new Date(String(startDate));
            if (endDate) whereClause.incidentDate.lte = new Date(String(endDate));
        }

        // Pull filtered records from DB based on exact/partial matches
        const dbComplaints = await prisma.complaint.findMany({
            where: whereClause,
            include: { evidence: true }
        });
        
        // If we also have a 'name' or 'q' to search for, apply fuzzy matching
        let searchName = name ? String(name).toLowerCase() : null;
        if (!searchName && q) searchName = String(q).toLowerCase(); // Fallback to general 'q' for names

        let finalResults = dbComplaints;

        if (searchName) {
            finalResults = dbComplaints.filter((c: any) => {
                const cName = c.complainantName ? c.complainantName.toLowerCase() : "";
                if (cName.includes(searchName)) return true;
                // Allow up to 2 typoes for fuzzy matching via Levenshtein
                return levenshtein(cName, searchName) <= 2;
            });
        }

        res.json(finalResults);
    } catch(err) {
        console.error("Search Error:", err);
        res.status(500).json({ message: 'Error during smart search' });
    }
}

// Get Investigation Timeline
export const getInvestigationTimeline = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const complaint = await prisma.complaint.findUnique({
            where: { id },
            include: {
                evidence: true,
                statements: true
            }
        });

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        const timeline = {
            complaintRegistered: true,
            firRegistered: complaint.isFIR,
            evidenceCollected: (complaint as any).evidence?.length > 0,
            witnessStatements: (complaint as any).statements?.length > 0,
            arrestMade: complaint.status === 'CLOSED', // Simple proxy for prototype
            chargesheetFiled: complaint.status === 'CLOSED',
            currentStatus: complaint.status
        };

        res.json(timeline);
    } catch (err) {
        console.error("Timeline Error:", err);
        res.status(500).json({ message: 'Error fetching timeline' });
    }
}

// Add Witness Statement
export const addWitnessStatement = async (req: Request, res: Response) => {
    try {
        const complaintId = req.params.id as string;
        const { witnessName, mobileNumber, statement } = req.body;

        if (!witnessName || !statement) {
            return res.status(400).json({ message: 'Witness name and statement are required' });
        }

        const newStatement = await prisma.witnessStatement.create({
            data: {
                witnessName,
                mobileNumber,
                statement,
                complaintId
            }
        });

        res.status(201).json({ message: 'Witness statement saved', statement: newStatement });
    } catch (err) {
        console.error("Statement Error:", err);
        res.status(500).json({ message: 'Error saving witness statement' });
    }
}

const PDFDocument = require('pdfkit');

// Generate Document (e.g., FIR Draft as PDF)
export const generateDocument = async (req: Request, res: Response) => {
    console.log(`[PDF] Request received for complaint ID: ${req.params.id}`);
    try {
        const id = req.params.id as string;
        const complaint = await prisma.complaint.findUnique({
            where: { id },
            include: { officer: true }
        });

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        const officerName = complaint.officer?.name || "Investigating Officer";
        const dateStr = complaint.incidentDate ? complaint.incidentDate.toISOString().split('T')[0] : 'Unknown Date';

        // Create PDF
        const doc = new PDFDocument({ margin: 50, autoFirstPage: true });
        
        // Use a buffer to capture the PDF
        const chunks: any[] = [];
        doc.on('data', (chunk: any) => chunks.push(chunk));
        
        doc.on('end', () => {
            try {
                const pdfBuffer = Buffer.concat(chunks);
                console.log(`[PDF] Document generated: ${pdfBuffer.length} bytes`);
                res.writeHead(200, {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `attachment; filename=FIR_${complaint.complaintId}.pdf`,
                    'Content-Length': pdfBuffer.length
                });
                res.end(pdfBuffer);
            } catch (err) {
                console.error('[PDF] Error sending response:', err);
                if (!res.headersSent) {
                    res.status(500).json({ success: false, message: 'Finalizing PDF failed' });
                }
            }
        });

        doc.on('error', (err: any) => {
            console.error('[PDF] PDFKit Error:', err);
            if (!res.headersSent) {
                res.status(500).json({ success: false, message: 'PDF Engine error' });
            }
        });

        console.log("[PDF] Rendering components...");
        
        // Header
        doc.fontSize(20).font('Helvetica-Bold').text('FIRST INFORMATION REPORT (FIR)', { align: 'center' });
        doc.fontSize(12).font('Helvetica').text('Under Section 154 Cr.P.C.', { align: 'center' }).moveDown(1.5);

        const drawField = (label: string, value: string) => {
            doc.font('Helvetica-Bold').fontSize(11).text(label + ': ', { continued: true })
               .font('Helvetica').text(value || 'N/A')
               .moveDown(0.5);
        };

        drawField('1. District/Station', complaint.incidentLocation || 'N/A');
        drawField('2. FIR Number', complaint.complaintId);
        drawField('3. Acts & Sections', complaint.crimeCategory || 'IPC/BNS Sections Pending');
        drawField('4. Date & Time of Occurrence', `${dateStr} - ${complaint.incidentTime || 'N/A'}`);
        drawField('5. Date & Time of Reporting', complaint.createdAt.toISOString());
        
        doc.moveDown();
        doc.font('Helvetica-Bold').fontSize(13).text('COMPLAINANT / INFORMANT DETAILS').moveDown(0.5);
        drawField('Name', complaint.complainantName);
        drawField('Father/Husband Name', complaint.fatherHusbandName || 'N/A');
        drawField('Address', complaint.address || 'N/A');
        drawField('Mobile Number', complaint.mobileNumber);

        doc.moveDown();
        doc.font('Helvetica-Bold').fontSize(13).text('INCIDENT DESCRIPTION').moveDown(0.5);
        doc.font('Helvetica').fontSize(11).text(complaint.incidentDescription || '', { align: 'justify' });

        doc.moveDown(2);
        drawField('Accused/Suspect Details', complaint.suspectDetails || 'Unknown/Under Investigation');
        
        // Footer / Signatures
        const bottom = 700; // Fixed bottom for safety
        doc.font('Helvetica-Bold').fontSize(11)
           .text('__________________________', 50, bottom)
           .text('Complainant Signature', 50, bottom + 15)
           .text('__________________________', 350, bottom)
           .text('Investigating Officer', 350, bottom + 15)
           .text(`(${officerName})`, 350, bottom + 30);

        console.log("[PDF] Calling end()");
        doc.end();

    } catch (err: any) {
        console.error("Generate Document Error:", err);
        const logMsg = `[${new Date().toISOString()}] PDF Error for ${req.params.id}: ${err.message}\n${err.stack}\n`;
        fs.appendFileSync(path.join(__dirname, '../../pdf_errors.log'), logMsg);
        res.status(500).json({ success: false, message: `Server error: ${err.message}` });
    }
}
