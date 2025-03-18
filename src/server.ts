import express from 'express';
import mongoose from 'mongoose';
import { json } from 'body-parser';
import path from 'path';

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/custodian-integration')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB', err));

// API Routes will be added here
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 