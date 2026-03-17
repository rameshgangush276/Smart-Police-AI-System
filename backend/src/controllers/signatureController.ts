import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Internal Signature Logic
export const internalSign = async (req: Request, res: Response) => {
    try {
        const { documentId, password } = req.body;
        const officerId = (req as any).user?.id;

        const officer = await prisma.officer.findUnique({ where: { id: officerId } });
        if (!officer) return res.status(404).json({ message: 'Officer not found' });
        
        const isMatch = await bcrypt.compare(password, officer.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        if (!officer.signatureImage) {
            return res.status(400).json({ message: 'No signature image found in profile. Please upload one first.' });
        }

        const document = await prisma.document.findUnique({ where: { id: documentId } });
        if (!document) return res.status(404).json({ message: 'Document not found' });

        // Load existing PDF
        const pdfPath = path.join(__dirname, '../../', document.fileUrl);
        const existingPdfBytes = fs.readFileSync(pdfPath);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const pages = pdfDoc.getPages();
        const lastPage = pages[pages.length - 1];
        const { width, height } = lastPage.getSize();

        // Load Signature Image
        const signaturePath = path.join(__dirname, '../../', officer.signatureImage);
        const signatureBytes = fs.readFileSync(signaturePath);
        let signatureImage;
        if (officer.signatureImage.toLowerCase().endsWith('.png')) {
            signatureImage = await pdfDoc.embedPng(signatureBytes);
        } else {
            signatureImage = await pdfDoc.embedJpg(signatureBytes);
        }

        // Draw Signature
        const signatureDims = signatureImage.scale(0.3);
        lastPage.drawImage(signatureImage, {
            x: width - signatureDims.width - 50,
            y: 50,
            width: signatureDims.width,
            height: signatureDims.height,
        });

        // Add Designation and Date
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        lastPage.drawText(`Digitally Signed by: ${officer.name}`, {
            x: width - 250,
            y: 40,
            size: 10,
            font,
            color: rgb(0, 0, 0),
        });
        lastPage.drawText(`Designation: ${officer.designation || 'Police Officer'}`, {
            x: width - 250,
            y: 30,
            size: 9,
            font,
        });

        const signedPdfBytes = await pdfDoc.save();
        fs.writeFileSync(pdfPath, signedPdfBytes);

        // Record Signature
        const record = await prisma.signatureRecord.create({
            data: {
                method: 'INTERNAL_SIGN',
                documentId: document.id,
                officerId: officer.id
            }
        });

        res.json({ success: true, message: 'Document signed successfully', record });

    } catch (error) {
        console.error("Internal Sign Error:", error);
        res.status(500).json({ message: 'Error signing document' });
    }
};

// Aadhaar OTP Sign Simulation
export const initiateAadhaarSign = async (req: Request, res: Response) => {
    try {
        const { documentId, aadhaarNumber } = req.body;
        // In a real app, send OTP here via Aadhaar API
        res.json({ success: true, message: 'OTP sent to registered mobile number', transactionId: 'TXN-' + Date.now() });
    } catch (error) {
        res.status(500).json({ message: 'Error initiating Aadhaar sign' });
    }
};

export const verifyAadhaarOTP = async (req: Request, res: Response) => {
    try {
        const { documentId, otp, transactionId } = req.body;
        const officerId = (req as any).user?.id;

        // Mock OTP Verification
        if (otp !== '123456') {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        const officer = await prisma.officer.findUnique({ where: { id: officerId } });
        const document = await prisma.document.findUnique({ where: { id: documentId } });
        if (!document) return res.status(404).json({ message: 'Document not found' });

        // Load existing PDF
        const pdfPath = path.join(__dirname, '../../', document.fileUrl);
        const existingPdfBytes = fs.readFileSync(pdfPath);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const lastPage = pdfDoc.getPages()[pdfDoc.getPages().length - 1];
        const { width } = lastPage.getSize();

        // Add Aadhaar e-Sign Mark
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        lastPage.drawRectangle({
            x: width - 260,
            y: 20,
            width: 210,
            height: 60,
            borderColor: rgb(0, 0, 0.5),
            borderWidth: 1,
        });
        lastPage.drawText('e-SIGNED VIA AADHAAR', { x: width - 250, y: 65, size: 10, font, color: rgb(0, 0, 0.8) });
        lastPage.drawText(`Signer: ${officer?.name}`, { x: width - 250, y: 50, size: 9, font });
        lastPage.drawText(`Time: ${new Date().toLocaleString()}`, { x: width - 250, y: 38, size: 8, font });
        lastPage.drawText(`Auth ID: ${transactionId}`, { x: width - 250, y: 28, size: 8, font });

        const signedPdfBytes = await pdfDoc.save();
        fs.writeFileSync(pdfPath, signedPdfBytes);

        // Record Signature
        const record = await prisma.signatureRecord.create({
            data: {
                method: 'AADHAAR_ESIGN',
                documentId: document.id,
                officerId: officerId
            }
        });

        res.json({ success: true, message: 'Aadhaar e-Sign completed', record });

    } catch (error) {
        console.error("Aadhaar Verify Error:", error);
        res.status(500).json({ message: 'Error verifying Aadhaar e-Sign' });
    }
};
