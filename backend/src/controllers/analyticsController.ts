import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get Crime Heatmap Data
export const getHeatmapData = async (req: Request, res: Response) => {
    try {
        const complaints = await prisma.complaint.findMany({
            where: {
                latitude: { not: null },
                longitude: { not: null }
            },
            select: {
                id: true,
                crimeCategory: true,
                latitude: true,
                longitude: true
            }
        });

        res.json({ heatmaps: complaints });
    } catch (error) {
        console.error("Heatmap Data Error:", error);
        res.status(500).json({ message: 'Error retrieving heatmap data' });
    }
};

// Get Hotspots Data for Android App
export const getHotspots = async (req: Request, res: Response) => {
    try {
        const complaints = await prisma.complaint.findMany({
            where: {
                latitude: { not: null },
                longitude: { not: null }
            },
            select: {
                complaintId: true,
                crimeCategory: true,
                latitude: true,
                longitude: true,
                incidentLocation: true
            }
        });

        const hotspotData = complaints
            .filter(c => c.latitude !== null && c.longitude !== null) // Double check safety
            .map(c => ({
            complaintId: c.complaintId,
            crimeCategory: c.crimeCategory,
            latitude: (c.latitude as number),
            longitude: (c.longitude as number),
            locationDesc: c.incidentLocation
        }));

        res.json({ success: true, data: hotspotData });
    } catch (error) {
        console.error("Get Hotspots Error:", error);
        res.status(500).json({ message: 'Error fetching hotspot data' });
    }
}

// Simulate Case Linkage Detection
export const getComplaintLinkages = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        const complaint = await prisma.complaint.findUnique({ where: { id } });
        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

        // A real system would use AI to analyze MO, Suspect Details, Location
        // Here we simulate by finding complaints with the same category in a 30-day window
        const linkages = await prisma.complaint.findMany({
            where: {
                id: { not: id },
                crimeCategory: complaint.crimeCategory
            },
            take: 3
        });

        res.json({ 
            sourceComplaintId: id,
            linkagesFound: linkages.length,
            linkedCases: linkages 
        });

    } catch (error) {
        console.error("Linkage Detection Error:", error);
        res.status(500).json({ message: 'Error discovering linkages' });
    }
};

// Natural Language Search (Simulated AI to SQL/Filter)
export const naturalLanguageSearch = async (req: Request, res: Response) => {
    try {
        const { query } = req.query;
        if (!query) return res.json({ results: [] });

        // In a real system: Send text to ChatGPT/Gemini -> Returns JSON query parameters -> Filter DB
        // Mock Implementation: just do a generic LIKE on descriptions
        const mockAnalyzedKeywords = String(query).toLowerCase().split(' ').filter(w => w.length > 3);

        const results = await prisma.complaint.findMany();
        
        const filtered = results.filter((c: any) => {
            const desc = c.incidentDescription.toLowerCase();
            return mockAnalyzedKeywords.some(kw => desc.includes(kw));
        });

        res.json({
            understoodIntent: mockAnalyzedKeywords,
            results: filtered
        });

    } catch (error) {
        console.error("NL Search Error:", error);
        res.status(500).json({ message: 'Error processing natural language query' });
    }
};

// Knowledge Graph Nodes and Edges Generation
export const generateKnowledgeGraph = async (req: Request, res: Response) => {
    try {
        const complaints = await prisma.complaint.findMany();
        
        const nodes: any[] = [];
        const edges: any[] = [];

        // Build Graph
        complaints.forEach((c: any) => {
            nodes.push({ id: c.id, label: c.complaintId, type: 'COMPLAINT' });
            
            if (c.complainantName) {
                const pId = `PERSON-${c.complainantName.replace(/\s/g, '')}`;
                nodes.push({ id: pId, label: c.complainantName, type: 'PERSON' });
                edges.push({ source: pId, target: c.id, relation: 'FILED_BY' });
            }
            if (c.incidentLocation) {
                const locId = `LOC-${c.incidentLocation.replace(/\s/g, '')}`;
                nodes.push({ id: locId, label: c.incidentLocation, type: 'LOCATION' });
                edges.push({ source: c.id, target: locId, relation: 'OCCURRED_AT' });
            }
        });

        // Deduplicate Nodes
        const uniqueNodesMap = new Map();
        nodes.forEach(n => uniqueNodesMap.set(n.id, n));

        res.json({
            nodes: Array.from(uniqueNodesMap.values()),
            edges
        });

    } catch (error) {
         console.error("Graph Error:", error);
         res.status(500).json({ message: 'Error generating knowledge graph' });
    }
}

// Get Officer Stats for Dashboard
export const getOfficerStats = async (req: Request, res: Response) => {
    try {
        const total = await prisma.complaint.count();
        const pending = await prisma.complaint.count({ where: { status: 'PENDING' } });
        const investigating = await prisma.complaint.count({ where: { status: 'UNDER_INVESTIGATION' } });
        const closed = await prisma.complaint.count({ where: { status: 'CLOSED' } });

        res.json({
            total,
            pending,
            investigating,
            closed
        });
    } catch (error) {
        console.error("Officer Stats Error:", error);
        res.status(500).json({ message: 'Error fetching officer statistics' });
    }
};
