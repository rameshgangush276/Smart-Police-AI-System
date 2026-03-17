import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const TEMPLATES: Record<string, string> = {
    NOTICE: `
        OFFICIAL NOTICE
        Smart Police Case Management System
        
        Date: {{date}}
        Case ID: {{case_id}}
        
        To,
        {{complainant_name}}
        
        Subject: Notice regarding Complaint {{case_id}}
        
        This is an official notice regarding the case filed on {{incident_date}} at {{incident_location}}. 
        Please be informed that the investigation is currently under status: {{status}}.
        
        Details: {{incident_description}}
        
        Investigating Officer: {{officer_name}}
        Station: {{station}}
    `,
    ARREST_MEMO: `
        ARREST MEMO
        Strictly Confidential - Police Records
        
        Case ID: {{case_id}}
        Date of Arrest: {{date}}
        Place of Arrest: {{incident_location}}
        
        Accused Details:
        Name: {{accused_name}}
        Crime Category: {{crime_category}}
        
        The arrest was made under the supervision of {{officer_name}} (Station: {{station}}).
        The following items were found in the possession of the accused at the time of arrest: {{seized_items}}.
        
        Authorized by: {{officer_name}}
    `,
    SEIZURE_MEMO: `
        SEIZURE MEMO
        Evidence Collection Record
        
        Case ID: {{case_id}}
        Date: {{date}}
        Location: {{incident_location}}
        
        Category: {{crime_category}}
        
        Description of Seized Items:
        -----------------------------
        {{seized_items}}
        -----------------------------
        
        The above items were seized during the course of investigation for case {{case_id}} 
        by Officer {{officer_name}}.
    `,
    WITNESS_STATEMENT: `
        RECORDED WITNESS STATEMENT
        Recorded under Section 161 Cr.P.C.
        
        Case ID: {{case_id}}
        Date: {{date}}
        
        Witness Name: {{witness_name}}
        Mobile: {{witness_mobile}}
        
        Statement:
        "{{statement_content}}"
        
        Recorded by: {{officer_name}}
    `,
    FINAL_REPORT: `
        FINAL INVESTIGATION REPORT
        Police Station: {{station}}
        
        Case ID: {{case_id}}
        Registration Date: {{incident_date}}
        Closing Date: {{date}}
        
        Complainant: {{complainant_name}}
        Accused: {{accused_name}}
        Category: {{crime_category}}
        
        Summary of Investigation:
        {{incident_description}}
        
        Conclusion:
        Based on the evidence collected and witness statements recorded, the investigation 
        concludes that the allegations are substantiated/unsubstantiated.
        
        Submitted by: {{officer_name}}
    `
};

export const generateDocument = async (req: Request, res: Response) => {
    try {
        const { caseId, documentType, additionalData } = req.body;
        const officerId = (req as any).user?.id;

        if (!caseId || !documentType) {
            return res.status(400).json({ message: 'Case ID and Document Type are required' });
        }

        const complaint = await prisma.complaint.findUnique({
            where: { id: caseId },
            include: { officer: true }
        });

        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

        const template = TEMPLATES[documentType];
        if (!template) return res.status(400).json({ message: 'Invalid document type' });

        // Populate Placeholders
        let content = template
            .replace(/{{date}}/g, new Date().toLocaleDateString())
            .replace(/{{case_id}}/g, complaint.complaintId)
            .replace(/{{complainant_name}}/g, complaint.complainantName)
            .replace(/{{incident_date}}/g, complaint.incidentDate?.toLocaleDateString() || 'N/A')
            .replace(/{{incident_location}}/g, complaint.incidentLocation || 'N/A')
            .replace(/{{status}}/g, complaint.status)
            .replace(/{{incident_description}}/g, complaint.incidentDescription)
            .replace(/{{officer_name}}/g, complaint.officer?.name || 'N/A')
            .replace(/{{station}}/g, complaint.officer?.station || 'General Station')
            .replace(/{{crime_category}}/g, complaint.crimeCategory || 'N/A')
            .replace(/{{accused_name}}/g, additionalData?.accusedName || complaint.suspectDetails || 'Unknown')
            .replace(/{{seized_items}}/g, additionalData?.seizedItems || 'None')
            .replace(/{{witness_name}}/g, additionalData?.witnessName || 'N/A')
            .replace(/{{witness_mobile}}/g, additionalData?.witnessMobile || 'N/A')
            .replace(/{{statement_content}}/g, additionalData?.statement || 'No statement recorded.');

        // Clean up content
        content = content.trim().split('\n').map(line => line.trim()).join('\n');

        // Generate PDF
        const doc = new PDFDocument();
        const fileName = `DOC-${documentType}-${Date.now()}.pdf`;
        const filePath = path.join(__dirname, '../../uploads/documents', fileName);
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);
        doc.fontSize(20).text('POLICE DEPARTMENT', { align: 'center' });
        doc.fontSize(14).text('Smart Police Case Management System', { align: 'center' });
        doc.moveDown();
        doc.lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();
        doc.fontSize(12).text(content, { lineGap: 5 });
        doc.moveDown(4);
        doc.text('__________________________', { align: 'right' });
        doc.text('Signature of Officer', { align: 'right' });
        doc.end();

        await new Promise((resolve) => stream.on('finish', resolve));

        // Save to Database
        const savedDoc = await prisma.document.create({
            data: {
                documentId: `DOC-${documentType.slice(0, 3)}-${Date.now().toString().slice(-4)}`,
                type: documentType,
                fileUrl: `/uploads/documents/${fileName}`,
                caseId: complaint.id,
                officerId: officerId
            }
        });

        res.status(201).json({ success: true, document: savedDoc });

    } catch (error) {
        console.error("Generate Document Error:", error);
        res.status(500).json({ message: 'Error generating PDF document' });
    }
};

export const getDocumentsByCase = async (req: Request, res: Response) => {
    try {
        const caseId = req.params.caseId as string;
        const documents = await prisma.document.findMany({
            where: { caseId },
            orderBy: { generatedAt: 'desc' }
        });
        res.json({ success: true, documents });
    } catch (error) {
        console.error("Get Documents Error:", error);
        res.status(500).json({ message: 'Error fetching documents' });
    }
};
