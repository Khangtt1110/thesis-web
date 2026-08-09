import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import predictRoutes from './routes/predict';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', predictRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Disease Symptom Classification API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      predict: '/api/predict',
      shap: '/api/shap'
    }
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Python service URL: ${process.env.PYTHON_SERVICE_URL || 'http://localhost:5000'}`);
});
