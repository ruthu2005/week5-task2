# Week 5 - Task 2: Product Management & Placement Tracker Backend

A production-grade Node.js, Express, and MongoDB/Mongoose backend demonstrating isolated database connection setups, strict Mongoose schema validations, asynchronous CRUD controller logic, an automated database seeding utility, and an exported API testing collection.

---

## 📁 Suggested Project Structure

```text
week 5-task2/
├── README.md                          # Project documentation and API testing guide
├── package.json                       # Scripts, dependencies, and project metadata
├── .env.example                       # Environment variables template
├── .env                               # Local configuration
├── .gitignore                         # Ignored files and directories
├── postman_collection.json            # Exported Postman v2.1.0 testing collection
├── src/
│   ├── config/
│   │   └── db.js                      # Isolated MongoDB connection setup & lifecycle events
│   ├── models/
│   │   └── Product.js                 # Strict Mongoose schema, validators & timestamps
│   ├── controllers/
│   │   └── productController.js       # Asynchronous CRUD queries & error handling
│   ├── routes/
│   │   └── productRoutes.js           # RESTful Express route definitions
│   ├── utils/
│   │   └── seedDatabase.js            # Standalone database seeding script
│   └── server.js                      # Express application entry & live testing console
└── test/
    └── api.test.js                    # Automated in-memory test suite
```

---

## 🛠️ Architecture & Mini-Tasks Implementation

### 1. Isolated Database Connection (`src/config/db.js`)
- Modularized database connection using `mongoose.connect()`.
- Supports custom URIs, environment configuration via `process.env.MONGO_URI`, and local fallback (`mongodb://127.0.0.1:27017/product_db`).
- Listens to connection events: `connected`, `error`, and `disconnected`.
- Graceful application shutdown handling (`SIGINT` and `SIGTERM`) to cleanly terminate active MongoDB pools.

### 2. Strict Mongoose Model Schema (`src/models/Product.js`)
The `Product` schema enforces strict data constraints, custom error messages, default values, virtual properties, and automatic timestamp tracking:

| Field | Type | Rules & Validations | Default / Details |
| :--- | :--- | :--- | :--- |
| `name` | `String` | `required`, `trim: true`, `minlength: 2`, `maxlength: 100` | Custom validation messages |
| `description`| `String` | `required`, `trim: true`, `minlength: 10`, `maxlength: 2000` | Detailed product overview |
| `price` | `Number` | `required`, `min: 0.01` | Rounded to 2 decimal places |
| `category` | `String` | `required`, `enum: ['Electronics', 'Computers', 'Audio', 'Wearables', 'Accessories', 'Office', 'Books', 'Other']` | Strict categorization |
| `stock` | `Number` | `min: 0`, integer validator | `default: 0` |
| `sku` | `String` | `required`, `unique: true`, `uppercase: true`, regex: `/^[A-Z0-9_-]{3,20}$/` | Unique Stock Keeping Unit |
| `isAvailable`| `Boolean`| Boolean flag | `default: true` |
| `rating` | `Number` | `min: 0`, `max: 5.0` | `default: 0` |
| `tags` | `[String]`| Array of strings (maximum 15 tags) | `default: []` |
| `createdAt` | `Date` | Automatic timestamp via `{ timestamps: true }` | Managed by Mongoose |
| `updatedAt` | `Date` | Automatic timestamp via `{ timestamps: true }` | Managed by Mongoose |
| `inStock` | `Boolean`| **Virtual getter**: returns `true` if `stock > 0` | Computed dynamically |

### 3. Async CRUD Controllers (`src/controllers/productController.js`)
All database operations utilize modern `async/await` and asynchronous Mongoose queries:

1. **`createProduct` (`POST /api/products`)**:
   - Creates a new product document in MongoDB.
   - Catches `ValidationError` and formats field-specific error messages (`400 Bad Request`).
   - Detects MongoDB code `11000` duplicate key collisions (e.g. unique SKU) and returns a clean `409 Conflict`.
2. **`getAllProducts` (`GET /api/products`)**:
   - Supports query filtering: `category`, `minPrice`, `maxPrice`, `inStock`, and `search`.
   - Sorting options: `newest`, `oldest`, `price_asc`, `price_desc`, `name_asc`, `name_desc`.
   - Pagination: `page` and `limit` with `totalItems` and `totalPages` metadata.
3. **`getProductById` (`GET /api/products/:id`)**:
   - Verifies MongoDB `ObjectId` format (returns `400` if malformed).
   - Returns `404 Not Found` if document does not exist.
4. **`updateProduct` (`PUT /api/products/:id`)**:
   - Validates `ObjectId` format.
   - Updates document with `{ new: true, runValidators: true }` so all Mongoose schema validators are strictly enforced during updates.
5. **`deleteProduct` (`DELETE /api/products/:id`)**:
   - Removes product by ID, returning `200 OK` with confirmation and deleted item metadata.
6. **`getProductStats` (`GET /api/products/stats/summary`)**:
   - Aggregates overall catalog statistics (total items, average price, total stock) and category breakdowns.

### 4. Database Seeding Utility (`src/utils/seedDatabase.js`)
- Clears existing documents and populates 11 diverse, production-quality sample products across all categories.
- Displays a formatted console summary table.
- Can be run directly via CLI (`npm run seed`) or imported as a module (`seedDatabase()`).

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.x or later)
- MongoDB instance (local or MongoDB Atlas connection string)

### 1. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 2. Environment Configuration
Copy the template configuration file:
```bash
cp .env.example .env
```
Ensure `.env` contains your MongoDB connection string:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/product_db
```

### 3. Seed Sample Data
Populate MongoDB with realistic sample data:
```bash
npm run seed
```

### 4. Start the Application
- **Development mode** (auto-reload):
  ```bash
  npm run dev
  ```
- **Production mode**:
  ```bash
  npm start
  ```

Open your browser to [http://localhost:5000](http://localhost:5000) to access the **Interactive API Testing Console**.

---

## 🧪 Testing the API

### 1. Automated Test Suite (No External Database Required)
Run the automated test suite powered by `mongodb-memory-server`:
```bash
npm test
```
This executes end-to-end assertions verifying schema validation rules, default values, timestamps, virtual fields, duplicate SKU conflicts, seeding, and all CRUD controller actions.

### 2. Exported Postman API Testing Collection
The repository includes `postman_collection.json` configured with environment variables and automated test assertions.

#### How to Import:
1. Open **Postman** (or Thunder Client / Insomnia).
2. Click **Import** &rarr; Select `postman_collection.json`.
3. The collection is organized into two primary folders:
   - **1. Valid CRUD Operations**:
     - `Create Product (Valid)` (`POST /api/products`) &rarr; `201 Created`
     - `Get All Products (Paginated)` (`GET /api/products?page=1&limit=10`) &rarr; `200 OK`
     - `Filter Products by Category & Price` (`GET /api/products?category=Accessories&minPrice=50`) &rarr; `200 OK`
     - `Get Product by ID` (`GET /api/products/{{productId}}`) &rarr; `200 OK`
     - `Update Product by ID` (`PUT /api/products/{{productId}}`) &rarr; `200 OK`
     - `Get Aggregated Product Statistics` (`GET /api/products/stats/summary`) &rarr; `200 OK`
     - `Delete Product by ID` (`DELETE /api/products/{{productId}}`) &rarr; `200 OK`
     - `System Health Check` (`GET /api/health`) &rarr; `200 OK`
   - **2. Validation Error Handling Tests**:
     - `Create Error - Missing All Required Fields` &rarr; `400 Bad Request`
     - `Create Error - Negative Price & Invalid Category` &rarr; `400 Bad Request`
     - `Create Error - Duplicate SKU Collision` &rarr; `409 Conflict`
     - `Get Error - Malformed ObjectId` &rarr; `400 Bad Request`
     - `Get Error - Non-Existent Product ID` &rarr; `404 Not Found`
     - `Update Error - Negative Stock (runValidators)` &rarr; `400 Bad Request`
     - `Delete Error - Non-Existent ID` &rarr; `404 Not Found`

---

## 📡 API Reference Summary

| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/products` | Create a new product with strict validation | `201 Created`, `400 Bad Request`, `409 Conflict` |
| `GET` | `/api/products` | Query products (supports search, filters, pagination) | `200 OK` |
| `GET` | `/api/products/:id` | Retrieve single product by MongoDB ObjectId | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `PUT` | `/api/products/:id` | Update product by ID (validates constraints) | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `DELETE` | `/api/products/:id` | Remove product by ID | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `GET` | `/api/products/stats/summary` | Get aggregated catalog statistics | `200 OK` |
| `GET` | `/api/health` | Health check endpoint | `200 OK` |
