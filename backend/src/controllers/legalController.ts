import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Legal Section Dictionary (Simulated Engine)
const legalSections = [
    {
        keywords: ['theft', 'stolen', 'thief', 'robbery', 'snatching'],
        sections: [
            { id: 'BNS-303', title: 'BNS Section 303', description: 'Punishment for Theft', confidence: 0.95 },
            { id: 'BNS-307', title: 'BNS Section 307', description: 'Snatching', confidence: 0.70 }
        ]
    },
    {
        keywords: ['assault', 'hit', 'beat', 'attack', 'violence', 'hurt'],
        sections: [
            { id: 'BNS-351', title: 'BNS Section 351', description: 'Assault', confidence: 0.90 },
            { id: 'BNS-115', title: 'BNS Section 115', description: 'Voluntarily causing hurt', confidence: 0.85 }
        ]
    },
    {
        keywords: ['drugs', 'marijuana', 'narcotics', 'ganja', 'possession', 'smuggling'],
        sections: [
            { id: 'NDPS-20', title: 'NDPS Act Section 20', description: 'Punishment for contravention in relation to cannabis plant and cannabis', confidence: 0.98 },
            { id: 'NDPS-8', title: 'NDPS Act Section 8', description: 'Prohibition of certain operations', confidence: 0.80 }
        ]
    },
    {
        keywords: ['cyber', 'internet', 'hacking', 'fraud', 'online', 'data'],
        sections: [
            { id: 'IT-66', title: 'IT Act Section 66', description: 'Computer related offences', confidence: 0.88 },
            { id: 'IT-66D', title: 'IT Act Section 66D', description: 'Punishment for cheating by personation by using computer resource', confidence: 0.92 }
        ]
    }
];

export const suggestSections = async (req: Request, res: Response) => {
    try {
        const { case_description, crime_type } = req.body;
        const text = ((case_description || '') + ' ' + (crime_type || '')).toLowerCase();
        
        const suggestions: any[] = [];
        
        legalSections.forEach(category => {
            const match = category.keywords.some(k => text.includes(k));
            if (match) {
                category.sections.forEach(s => {
                    let adjustedConfidence = s.confidence;
                    if (crime_type && s.title.toLowerCase().includes(crime_type.toLowerCase())) {
                        adjustedConfidence = Math.min(0.99, adjustedConfidence + 0.05);
                    }
                    suggestions.push({ ...s, confidence: adjustedConfidence });
                });
            }
        });

        const uniqueSuggestions = suggestions.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
        uniqueSuggestions.sort((a, b) => b.confidence - a.confidence);

        res.json({
            success: true,
            suggested_sections: uniqueSuggestions,
            legal_explanation: "Based on the provided case description and crime type, the above sections are identified as most relevant under the Bharatiya Nyaya Sanhita (BNS) and Special Acts."
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error analyzing legal sections' });
    }
};

export const generateDraft = async (req: Request, res: Response) => {
    try {
        const officerId = (req as any).user.id;
        const { case_id, type, officer_inputs } = req.body;

        const complaint = await prisma.complaint.findUnique({
            where: { id: case_id },
            include: { officer: true }
        });

        if (!complaint) return res.status(404).json({ message: 'Case not found' });

        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const page = pdfDoc.addPage([600, 800]);

        let y = 750;

        page.drawText('LEGAL ASSISTANCE - DRAFT DOCUMENT', { x: 150, y, size: 18, font: boldFont });
        y -= 40;

        page.drawText(`Document Type: ${type.replace(/_/g, ' ')}`, { x: 50, y, size: 12, font: boldFont });
        y -= 25;
        page.drawText(`Case ID: ${complaint.complaintId}`, { x: 50, y, size: 11, font });
        y -= 20;
        page.drawText(`Officer Name: ${complaint.officer?.name || 'N/A'}`, { x: 50, y, size: 11, font });
        y -= 40;

        page.drawText('CASE FACTS:', { x: 50, y, size: 12, font: boldFont });
        y -= 20;
        const facts = `Incident at ${complaint.incidentLocation} on ${complaint.incidentDate?.toLocaleDateString() || 'N/A'}. Description: ${complaint.incidentDescription.substring(0, 200)}...`;
        page.drawText(facts, { x: 50, y, size: 10, font, maxWidth: 500 });
        y -= 60;

        page.drawText('LEGAL ANALYSIS & REPLY:', { x: 50, y, size: 12, font: boldFont });
        y -= 20;
        const inputs = officer_inputs || 'Investigation is in progress. All standard procedures are being followed.';
        page.drawText(inputs, { x: 50, y, size: 10, font, maxWidth: 500 });
        y -= 100;

        page.drawText('This is an auto-generated draft for assistance purposes. Final submission must be verified by the legal cell.', { x: 50, y: 50, size: 8, font });

        const pdfBytes = await pdfDoc.save();
        const fileName = `legal_draft_${Date.now()}.pdf`;
        const publicPath = path.join(__dirname, '../../public/documents');
        const filePath = path.join(publicPath, fileName);

        if (!fs.existsSync(publicPath)) {
            fs.mkdirSync(publicPath, { recursive: true });
        }

        fs.writeFileSync(filePath, pdfBytes);

        const draft = await prisma.legalDraft.create({
            data: {
                type,
                caseId: case_id,
                officerId,
                content: inputs,
                fileUrl: `/documents/${fileName}`
            }
        });

        res.json({
            success: true,
            draft_id: draft.id,
            fileUrl: draft.fileUrl,
            message: 'Draft generated successfully'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error generating legal draft' });
    }
};

export const getSOP = async (req: Request, res: Response) => {
    try {
        const category = (req.params.category as string).toLowerCase();
        
        const sops: Record<string, string[]> = {
            "theft": [
                "Secure the scene and do not touch potentially touched surfaces.",
                "Interview the complainant and collect CCTV footage.",
                "List missing items with descriptions and values.",
                "Check for forced entry signs."
            ],
            "assault": [
                "Ensure medical attention is given to the victim.",
                "Secure physical evidence (weapons, clothing).",
                "Take photos of injuries and the scene.",
                "Interview witnesses and suspects separately."
            ]
        };

        const standardSOP = [
            "Verify identity of the complainant.",
            "Record initial statement clearly.",
            "Issue a receipt of complaint."
        ];

        const checklist = sops[category] || standardSOP;
        res.json({ category: req.params.category, steps: checklist });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching SOPs' });
    }
};
