/**
 * Local development server for cosmic-trotter
 * Serves static files and Netlify functions from localhost
 * Usage: node local-dev-server.js
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Parse and apply _redirects rules
function parseRedirects(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const rules = [];
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const parts = trimmed.split(/\s+/);
    if (parts.length >= 2) {
      const from = parts[0];
      const to = parts[1];
      const status = parts[2] ? parseInt(parts[2]) : 200;
      const force = parts.slice(2).includes('!');
      rules.push({ from, to, status, force });
    }
  }
  return rules;
}

const redirectRules = parseRedirects(path.join(__dirname, '_redirects'));

// Apply _redirects middleware (before static files)
app.use((req, res, next) => {
  const reqPath = req.path;
  
  for (const rule of redirectRules) {
    const pattern = rule.from
      .replace(/\*/g, '.*')
      .replace(/\:splat/g, '(.*)')
      .replace(/\$/g, '\\$');
    const regex = new RegExp(`^${pattern}$`);
    const match = regex.exec(reqPath);
    
    if (match) {
      let dest = rule.to;
      if (match[1]) {
        dest = dest.replace(':splat', match[1]);
      }
      
      if (rule.status === 301 || rule.status === 302) {
        return res.redirect(rule.status, dest);
      } else if (rule.status === 200) {
        // Rewrite (internal redirect)
        req.url = dest;
        return next();
      }
    }
  }
  next();
});

// Serve static files
app.use(express.static(path.join(__dirname)));

// Load and expose Netlify functions
const askKrishnaHandler = require('./netlify/functions/ask-krishna.js').handler;
const storyCommHandler = require('./netlify/functions/story-community.js').handler;

// Function endpoint: ask-krishna
app.post('/.netlify/functions/ask-krishna', async (req, res) => {
  try {
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify(req.body),
      headers: req.headers,
    };
    const context = {};
    
    const result = await askKrishnaHandler(event, context);
    const body = typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
    
    res.status(result.statusCode || 200).json(body);
  } catch (error) {
    console.error('Error in ask-krishna function:', error);
    res.status(500).json({ 
      error: error.message,
      saved: false,
      saveAttempted: false,
      saveError: error.message
    });
  }
});

// Function endpoint: story-community
app.post('/.netlify/functions/story-community', async (req, res) => {
  try {
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify(req.body),
      headers: req.headers,
    };
    const context = {};
    
    const result = await storyCommHandler(event, context);
    const body = typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
    
    res.status(result.statusCode || 200).json(body);
  } catch (error) {
    console.error('Error in story-community function:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    env: {
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_PUBLISHABLE_KEY,
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Local dev server running on http://localhost:${PORT}`);
  console.log(`📚 Open http://localhost:${PORT} in your browser`);
  console.log(`\n✅ Environment loaded:`);
  console.log(`   - SUPABASE_URL: ${process.env.SUPABASE_URL ? '✓' : '✗ missing'}`);
  console.log(`   - SUPABASE_PUBLISHABLE_KEY: ${process.env.SUPABASE_PUBLISHABLE_KEY ? '✓' : '✗ missing'}`);
  console.log(`   - GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? '✓' : '✗ missing (will use local fallback)'}`);
  console.log(`\n📡 Functions available:`);
  console.log(`   - POST /.netlify/functions/ask-krishna`);
  console.log(`   - POST /.netlify/functions/story-community`);
  console.log(`\n💾 Supabase data will be saved when you test ask-krishna`);
  console.log(`🔍 Check browser console for [Ask Krishna] logs\n`);
});

process.on('SIGINT', () => {
  console.log('\n\nShutting down local dev server...');
  process.exit(0);
});
