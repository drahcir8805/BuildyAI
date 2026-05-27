require('dotenv').config();
const express = require('express');
const cors = require('cors');

const manualRoutes = require('./routes/manual');
const elevenlabsRoutes = require('./routes/elevenlabs');
const toolsRoutes = require('./routes/tools');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/api/manual', manualRoutes);
app.use('/api/elevenlabs', elevenlabsRoutes);
app.use('/api/tools', toolsRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`IKEA Voice Assistant backend running on http://localhost:${PORT}`);
});
