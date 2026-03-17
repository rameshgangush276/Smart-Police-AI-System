import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));

import authRoutes from './routes/authRoutes';
import complaintRoutes from './routes/complaintRoutes';
import aiRoutes from './routes/aiRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import legalRoutes from './routes/legalRoutes';
import complianceRoutes from './routes/complianceRoutes';
import supervisionRoutes from './routes/supervisionRoutes';
import documentRoutes from './routes/documentRoutes';
import signatureRoutes from './routes/signatureRoutes';

app.get('/', (req: Request, res: Response) => {
  res.send('Smart Police Case Management API is running');
});

// Basic request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/legal', legalRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/supervision', supervisionRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/signatures', signatureRoutes);

app.listen(Number(port), '0.0.0.0', () => {
  console.log(`[server]: Server is running at http://0.0.0.0:${port}`);
  console.log(`[server]: Local Network Access: http://10.40.13.195:${port}`);
});
