// Save this as: simple-server.js
// First install: npm install express cors torrent-search-api

const express = require('express');
const cors = require('cors');
const TorrentSearchApi = require('torrent-search-api');

// Create Express app
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize torrent search API
console.log('🚀 Initializing torrent providers...');
TorrentSearchApi.enablePublicProviders();
console.log('✅ Torrent providers initialized');

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Torrent Search API is running!',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Search endpoint
app.get('/search', async (req, res) => {
  try {
    const { q, category = 'All', limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter "q" is required'
      });
    }
    
    console.log(`🔍 Searching for: "${q}"`);
    
    const torrents = await TorrentSearchApi.search(q, category, parseInt(limit));
    
    res.json({
      success: true,
      query: q,
      resultCount: torrents.length,
      data: torrents
    });
    
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get providers
app.get('/providers', (req, res) => {
  try {
    const activeProviders = TorrentSearchApi.getActiveProviders();
    res.json({
      success: true,
      providers: activeProviders.map(p => p.name)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🌐 Server running on http://localhost:${PORT}`);
  console.log('📋 Try: http://localhost:3000/search?q=ubuntu');
});