require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { connectDB } = require('./config/db');
const productRoutes = require('./routes/productRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Body parser & CORS middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// HTTP request logging (suppressed during automated tests)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Serve static Postman collection file if requested
app.get('/postman_collection.json', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'postman_collection.json'));
});

// API Routes
app.use('/api/products', productRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Product Management API',
    uptime: `${process.uptime().toFixed(1)}s`,
  });
});

// Beautiful Interactive API Documentation & Live Testing Dashboard
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Product Management API - Live Test Console</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-primary: #0a0e17;
      --bg-surface: #111827;
      --bg-card: #1f2937;
      --border: #374151;
      --accent: #6366f1;
      --accent-hover: #4f46e5;
      --accent-glow: rgba(99, 102, 241, 0.25);
      --success: #10b981;
      --danger: #ef4444;
      --warning: #f59e0b;
      --text: #f3f4f6;
      --text-muted: #9ca3af;
      --font-main: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      background: radial-gradient(circle at 10% 20%, #171b2e 0%, var(--bg-primary) 90%);
      color: var(--text);
      font-family: var(--font-main);
      min-height: 100vh;
      line-height: 1.6;
      padding: 2rem 1.5rem;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    header {
      background: rgba(31, 41, 55, 0.7);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 18px;
      padding: 2.2rem;
      margin-bottom: 2rem;
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.5rem;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .badge .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 10px #10b981;
    }
    h1 {
      font-size: 2.2rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      background: linear-gradient(135deg, #ffffff 40%, #a5b4fc 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-top: 0.5rem;
    }
    p.subtitle {
      color: var(--text-muted);
      font-size: 1rem;
      margin-top: 0.4rem;
    }
    .header-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.4rem;
      border-radius: 12px;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;
      text-decoration: none;
      font-family: inherit;
    }
    .btn-primary {
      background: var(--accent);
      color: white;
      box-shadow: 0 4px 14px var(--accent-glow);
    }
    .btn-primary:hover {
      background: var(--accent-hover);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
    }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.06);
      color: var(--text);
      border: 1px solid rgba(255, 255, 255, 0.12);
    }
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.12);
      transform: translateY(-2px);
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1.1fr;
      gap: 2rem;
    }
    @media (max-width: 968px) {
      .grid {
        grid-template-columns: 1fr;
      }
    }
    .card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }
    .card-title {
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      border-bottom: 1px solid var(--border);
      padding-bottom: 0.75rem;
    }
    .test-section {
      margin-bottom: 1.5rem;
    }
    .test-section h4 {
      font-size: 0.85rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.75rem;
    }
    .action-group {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }
    .test-btn {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 0.85rem 1rem;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 10px;
      color: var(--text);
      cursor: pointer;
      font-family: inherit;
      font-size: 0.9rem;
      transition: all 0.2s ease;
      text-align: left;
    }
    .test-btn:hover {
      background: rgba(99, 102, 241, 0.1);
      border-color: rgba(99, 102, 241, 0.3);
      transform: translateX(4px);
    }
    .method-tag {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.2rem 0.55rem;
      border-radius: 6px;
      text-transform: uppercase;
      margin-right: 0.75rem;
    }
    .method-get { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
    .method-post { background: rgba(16, 185, 129, 0.2); color: #34d399; }
    .method-put { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
    .method-delete { background: rgba(239, 68, 68, 0.2); color: #f87171; }
    .status-badge {
      font-family: var(--font-mono);
      font-size: 0.8rem;
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.08);
    }
    .console-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }
    .terminal-window {
      background: #080c14;
      border: 1px solid #1e293b;
      border-radius: 12px;
      overflow: hidden;
    }
    .terminal-bar {
      background: #0f172a;
      padding: 0.6rem 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      border-bottom: 1px solid #1e293b;
    }
    .circle { width: 10px; height: 10px; border-radius: 50%; }
    .red { background: #ef4444; }
    .yellow { background: #f59e0b; }
    .green { background: #10b981; }
    .terminal-title {
      font-size: 0.8rem;
      color: #64748b;
      font-family: var(--font-mono);
      margin-left: auto;
    }
    pre#responseBox {
      padding: 1.25rem;
      font-family: var(--font-mono);
      font-size: 0.85rem;
      color: #38bdf8;
      max-height: 520px;
      overflow-y: auto;
      white-space: pre-wrap;
      word-break: break-all;
    }
    .stat-pill {
      font-family: var(--font-mono);
      font-size: 0.85rem;
      padding: 0.3rem 0.6rem;
      border-radius: 6px;
    }
    .stat-200, .stat-201 { background: rgba(16, 185, 129, 0.2); color: #34d399; }
    .stat-400, .stat-409 { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
    .stat-404, .stat-500 { background: rgba(239, 68, 68, 0.2); color: #f87171; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div>
        <div class="badge"><div class="dot"></div> MongoDB & Mongoose Active</div>
        <h1>Product Management API</h1>
        <p class="subtitle">Mongoose Model Schema &bull; Strict Validation &bull; Async CRUD Controllers &bull; Seeder</p>
      </div>
      <div class="header-actions">
        <a href="/postman_collection.json" download="Product_API_Collection.postman_collection.json" class="btn btn-primary" id="downloadPostmanBtn">
          <span>&darr;</span> Download Postman Collection
        </a>
        <button onclick="runHealthCheck()" class="btn btn-secondary" id="healthBtn">
          Health Check
        </button>
      </div>
    </header>

    <div class="grid">
      <!-- Left Column: Actions / Operations -->
      <div class="card">
        <div class="card-title">
          <span>&boxplus;</span> Live Operations & Error Validation Tests
        </div>

        <div class="test-section">
          <h4>&bull; Standard CRUD Operations (Valid Cases)</h4>
          <div class="action-group">
            <button class="test-btn" onclick="testGetAll()" id="btnGetAll">
              <span><span class="method-tag method-get">GET</span> All Products</span>
              <span class="status-badge">200 OK</span>
            </button>
            <button class="test-btn" onclick="testFilterProducts()" id="btnFilter">
              <span><span class="method-tag method-get">GET</span> Filter by Category (Audio)</span>
              <span class="status-badge">200 OK</span>
            </button>
            <button class="test-btn" onclick="testGetStats()" id="btnStats">
              <span><span class="method-tag method-get">GET</span> Aggregated Product Stats</span>
              <span class="status-badge">200 OK</span>
            </button>
            <button class="test-btn" onclick="testCreateValid()" id="btnCreateValid">
              <span><span class="method-tag method-post">POST</span> Create New Valid Product</span>
              <span class="status-badge">201 Created</span>
            </button>
            <button class="test-btn" onclick="testUpdateProduct()" id="btnUpdate">
              <span><span class="method-tag method-put">PUT</span> Update Product Stock & Price</span>
              <span class="status-badge">200 OK</span>
            </button>
            <button class="test-btn" onclick="testDeleteProduct()" id="btnDelete">
              <span><span class="method-tag method-delete">DEL</span> Delete Target Product</span>
              <span class="status-badge">200 OK</span>
            </button>
          </div>
        </div>

        <div class="test-section">
          <h4>&bull; Strict Schema Validation & Error Handling Tests</h4>
          <div class="action-group">
            <button class="test-btn" onclick="testMissingFields()" id="btnErrMissing">
              <span><span class="method-tag method-post">POST</span> Missing Name, Price, Category</span>
              <span class="status-badge" style="color:#fbbf24">400 Bad Request</span>
            </button>
            <button class="test-btn" onclick="testNegativePrice()" id="btnErrPrice">
              <span><span class="method-tag method-post">POST</span> Negative Price (Validation Error)</span>
              <span class="status-badge" style="color:#fbbf24">400 Bad Request</span>
            </button>
            <button class="test-btn" onclick="testInvalidCategory()" id="btnErrCategory">
              <span><span class="method-tag method-post">POST</span> Unsupported Category Enum</span>
              <span class="status-badge" style="color:#fbbf24">400 Bad Request</span>
            </button>
            <button class="test-btn" onclick="testDuplicateSku()" id="btnErrSku">
              <span><span class="method-tag method-post">POST</span> Duplicate SKU Collision</span>
              <span class="status-badge" style="color:#fbbf24">409 Conflict</span>
            </button>
            <button class="test-btn" onclick="testInvalidObjectId()" id="btnErrInvalidId">
              <span><span class="method-tag method-get">GET</span> Malformed ObjectId ("invalid-id-123")</span>
              <span class="status-badge" style="color:#fbbf24">400 Bad Request</span>
            </button>
            <button class="test-btn" onclick="testNotFoundId()" id="btnErr404">
              <span><span class="method-tag method-get">GET</span> Non-Existent ID (507f1f77bcf86cd799439011)</span>
              <span class="status-badge" style="color:#f87171">404 Not Found</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Right Column: Live Console Output -->
      <div class="card">
        <div class="console-header">
          <div class="card-title" style="margin-bottom:0; border:none; padding:0;">
            <span>&terminal;</span> Live API Response Viewer
          </div>
          <span id="responseStatusBadge" class="stat-pill stat-200">READY</span>
        </div>
        <div class="terminal-window">
          <div class="terminal-bar">
            <span class="circle red"></span>
            <span class="circle yellow"></span>
            <span class="circle green"></span>
            <span class="terminal-title" id="terminalUrl">Click any operation on the left to test live</span>
          </div>
          <pre id="responseBox">// Press any button on the left to fire live requests against your API!
// Responses from Express and MongoDB will be rendered here in real-time.</pre>
        </div>
      </div>
    </div>
  </div>

  <script>
    let lastCreatedId = null;

    function displayResponse(status, url, data) {
      const box = document.getElementById('responseBox');
      const urlBar = document.getElementById('terminalUrl');
      const badge = document.getElementById('responseStatusBadge');

      urlBar.textContent = url;
      badge.textContent = status + (status === 200 ? ' OK' : status === 201 ? ' CREATED' : status === 400 ? ' BAD REQUEST' : status === 404 ? ' NOT FOUND' : status === 409 ? ' CONFLICT' : '');
      badge.className = 'stat-pill ' + (status >= 200 && status < 300 ? 'stat-200' : status === 404 ? 'stat-404' : 'stat-400');
      box.textContent = JSON.stringify(data, null, 2);
    }

    async function runHealthCheck() {
      const res = await fetch('/api/health');
      const data = await res.json();
      displayResponse(res.status, 'GET /api/health', data);
    }

    async function testGetAll() {
      const res = await fetch('/api/products?limit=5');
      const data = await res.json();
      if (data.data && data.data.length > 0) {
        lastCreatedId = data.data[0]._id;
      }
      displayResponse(res.status, 'GET /api/products?limit=5', data);
    }

    async function testFilterProducts() {
      const res = await fetch('/api/products?category=Audio');
      const data = await res.json();
      displayResponse(res.status, 'GET /api/products?category=Audio', data);
    }

    async function testGetStats() {
      const res = await fetch('/api/products/stats/summary');
      const data = await res.json();
      displayResponse(res.status, 'GET /api/products/stats/summary', data);
    }

    async function testCreateValid() {
      const randomSku = 'SKU-' + Math.floor(1000 + Math.random() * 9000);
      const payload = {
        name: 'HyperX QuadCast S RGB Microphone',
        description: 'USB condenser microphone with customizable RGB lighting, anti-vibration shock mount, and tap-to-mute sensor.',
        price: 159.99,
        category: 'Audio',
        stock: 25,
        sku: randomSku,
        tags: ['audio', 'usb', 'rgb', 'streaming']
      };
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.data && data.data._id) {
        lastCreatedId = data.data._id;
      }
      displayResponse(res.status, 'POST /api/products (Valid)', data);
    }

    async function testUpdateProduct() {
      if (!lastCreatedId) {
        // Fetch one first to update
        const fetchRes = await fetch('/api/products?limit=1');
        const fetchData = await fetchRes.json();
        if (fetchData.data && fetchData.data.length > 0) {
          lastCreatedId = fetchData.data[0]._id;
        } else {
          alert('Please create or fetch products first.');
          return;
        }
      }
      const res = await fetch('/api/products/' + lastCreatedId, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: 189.99,
          stock: 40,
          description: 'Updated description: Premium USB condenser microphone with updated firmware.'
        })
      });
      const data = await res.json();
      displayResponse(res.status, 'PUT /api/products/' + lastCreatedId, data);
    }

    async function testDeleteProduct() {
      if (!lastCreatedId) {
        alert('Please create a product first or retrieve all products.');
        return;
      }
      const res = await fetch('/api/products/' + lastCreatedId, {
        method: 'DELETE'
      });
      const data = await res.json();
      displayResponse(res.status, 'DELETE /api/products/' + lastCreatedId, data);
      lastCreatedId = null;
    }

    // Validation Error Cases
    async function testMissingFields() {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      displayResponse(res.status, 'POST /api/products (Missing Fields)', data);
    }

    async function testNegativePrice() {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Invalid Negative Price Item',
          description: 'Valid description that has more than 10 characters',
          price: -25.50,
          category: 'Electronics',
          sku: 'NEG-PRICE-001'
        })
      });
      const data = await res.json();
      displayResponse(res.status, 'POST /api/products (Negative Price)', data);
    }

    async function testInvalidCategory() {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Invalid Category Item',
          description: 'Valid description that has more than 10 characters',
          price: 99.00,
          category: 'InvalidCategory123',
          sku: 'CAT-FAIL-001'
        })
      });
      const data = await res.json();
      displayResponse(res.status, 'POST /api/products (Invalid Category Enum)', data);
    }

    async function testDuplicateSku() {
      // First ensure LOGI-MXM3S-001 or duplicate exists
      const payload = {
        name: 'Duplicate SKU Attempt Product',
        description: 'Attempting to insert a product with an already existing SKU in collection',
        price: 89.99,
        category: 'Accessories',
        sku: 'LOGI-MXM3S-001'
      };
      // Try posting once
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      // Post again to trigger 409
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      displayResponse(res.status, 'POST /api/products (Duplicate SKU Collision)', data);
    }

    async function testInvalidObjectId() {
      const res = await fetch('/api/products/invalid-id-123');
      const data = await res.json();
      displayResponse(res.status, 'GET /api/products/invalid-id-123', data);
    }

    async function testNotFoundId() {
      const res = await fetch('/api/products/507f1f77bcf86cd799439011');
      const data = await res.json();
      displayResponse(res.status, 'GET /api/products/507f1f77bcf86cd799439011', data);
    }

    // Auto-load health check on boot
    window.addEventListener('DOMContentLoaded', runHealthCheck);
  </script>
</body>
</html>`);
});

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('[Global Error]', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.name || 'Internal Server Error',
    message: err.message || 'An unexpected error occurred on the server',
  });
});

// Start server if executed directly
if (process.env.NODE_ENV !== 'test') {
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`[Server] Server running on http://localhost:${PORT}`);
        console.log(`[Server] Interactive API Playground available at http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error(`[Server Boot Error] Could not start server: ${err.message}`);
      console.log(`[Server Boot] Starting server anyway to serve API endpoints...`);
      app.listen(PORT, () => {
        console.log(`[Server] Server running on http://localhost:${PORT} (Database pending connection)`);
      });
    });
}

module.exports = app;
