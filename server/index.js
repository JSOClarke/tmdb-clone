// Save this as: simple-server.js
// First install: npm install express cors torrent-search-api

const express = require('express');
const cors = require('cors');
const TorrentSearchApi = require('torrent-search-api');
const WebTorrent = require('webtorrent');

// Create Express app
const app = express();
const PORT = 3001;

const client = new WebTorrent();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize torrent search API
try {
  console.log('🚀 Initializing torrent providers...');
  TorrentSearchApi.enablePublicProviders();
  console.log('✅ Torrent providers initialized');
} catch (error) {
  console.error('❌ Error initializing torrent providers:', error);
  process.exit(1); // Exit if providers fail to initialize
}

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
    
    console.log(`🔍 Searching for: "${q}" (Category: ${category}, Limit: ${limit})`);
    
    const torrents = await TorrentSearchApi.search(q, category, parseInt(limit));
    console.log(`✅ Found ${torrents.length} torrents for query: "${q}"`);
    
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

// Play torrent endpoint
app.post('/play-torrent', async (req, res) => {
  const { magnetUri } = req.body;

  if (!magnetUri) {
    return res.status(400).json({ success: false, error: 'Magnet URI is required' });
  }

  console.log(`Attempting to play torrent: ${magnetUri}`);

  try {
    const torrent = client.add(magnetUri);

    torrent.on('ready', () => {
      console.log('Torrent ready, finding main file...');
      console.log('Files in torrent:', torrent.files.map(f => ({ name: f.name, length: f.length })));

      let file = torrent.files.find(file => file.name.endsWith('.mp4') || file.name.endsWith('.mkv') || file.name.endsWith('.avi'));

      if (!file) {
        console.log('No common video file found, trying to find the largest file.');
        file = torrent.files.reduce((a, b) => (a.length > b.length ? a : b));
      }

      if (!file) {
        console.error('No playable file found in torrent.');
        return res.status(500).json({ success: false, error: 'No playable file found in torrent.' });
      }

      console.log(`Selected file for streaming: ${file.name} (Size: ${file.length})`);

      try {
        const server = torrent.createServer();
        const port = 8888; // Port for WebTorrent's HTTP server
        console.log(`Attempting to start WebTorrent server on port ${port}...`);
        server.listen(port, () => {
          const streamUrl = `http://localhost:${port}/${file.path}`;
          console.log(`WebTorrent server started. Streaming URL: ${streamUrl}`);
          res.json({ success: true, message: 'WebTorrent server started', streamUrl: streamUrl });
        }).on('error', (err) => {
          console.error(`WebTorrent server failed to listen on port ${port}:`, err);
          res.status(500).json({ success: false, error: `WebTorrent server error: ${err.message}` });
        });
      } catch (error) {
        console.error('Error creating WebTorrent server:', error);
        res.status(500).json({ success: false, error: `Error creating WebTorrent server: ${error.message}` });
      }
    });

    // Add a timeout for torrent readiness
    setTimeout(() => {
      if (!torrent.ready) {
        console.error('Torrent did not become ready within 30 seconds.');
        client.remove(torrent); // Clean up
        res.status(500).json({ success: false, error: 'Torrent readiness timeout.' });
      }
    }, 30000); // 30 seconds timeout

    torrent.on('error', (err) => {
      console.error('Torrent error:', err);
      res.status(500).json({ success: false, error: `Torrent error: ${err.message}` });
    });

  } catch (error) {
    console.error('Error adding torrent:', error);
    res.status(500).json({ success: false, error: `Error adding torrent: ${error.message}` });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🌐 Server running on http://localhost:${PORT}`);
  console.log('📋 Try: http://localhost:3000/search?q=ubuntu');
}).on('error', (err) => {
  console.error('❌ Server failed to start:', err.message);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});