const assert = require('assert');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../src/config/db');
const Product = require('../src/models/Product');
const { seedDatabase, sampleProducts } = require('../src/utils/seedDatabase');
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductStats,
} = require('../src/controllers/productController');

// Helper to simulate Express req/res
const mockReqRes = (params = {}, query = {}, body = {}) => {
  const req = { params, query, body };
  const res = {
    statusCode: 200,
    headers: {},
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.data = payload;
      return this;
    },
  };
  return { req, res };
};

let mongoServer;

async function runTestSuite() {
  console.log('----------------------------------------------------');
  console.log('🧪 Starting Automated API & Database Test Suite');
  console.log('----------------------------------------------------');

  try {
    // 1. Start In-Memory MongoDB Server
    console.log('[Test Setup] Starting MongoMemoryServer...');
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await connectDB(uri);
    console.log('[Test Setup] In-memory MongoDB connected successfully.');

    // 2. Test Mongoose Model Schema Validation
    console.log('\n--- 1. Testing Mongoose Model Schema & Strict Validations ---');
    
    // Test: Missing required fields
    try {
      const invalidProduct = new Product({});
      await invalidProduct.validate();
      assert.fail('Should have failed required validation');
    } catch (err) {
      assert.strictEqual(err.name, 'ValidationError');
      assert.ok(err.errors.name, 'Name required error missing');
      assert.ok(err.errors.description, 'Description required error missing');
      assert.ok(err.errors.price, 'Price required error missing');
      assert.ok(err.errors.category, 'Category required error missing');
      assert.ok(err.errors.sku, 'SKU required error missing');
      console.log('✓ Model strictly enforces required fields (name, description, price, category, sku)');
    }

    // Test: Negative price & invalid category
    try {
      const invalidFields = new Product({
        name: 'A',
        description: 'Too short',
        price: -10,
        category: 'InvalidCategory',
        stock: -5,
        sku: 'ab',
      });
      await invalidFields.validate();
      assert.fail('Should have failed min price, enum category, short description, and negative stock');
    } catch (err) {
      assert.ok(err.errors.price, 'Price min constraint failed');
      assert.ok(err.errors.category, 'Category enum failed');
      assert.ok(err.errors.description, 'Description minlength failed');
      assert.ok(err.errors.stock, 'Stock min constraint failed');
      console.log('✓ Model strictly enforces min price (>0), category enum, minlength description, and min stock');
    }

    // Test: Default values & Timestamps
    const validProduct = new Product({
      name: 'Test Mechanical Keyboard',
      description: 'A great mechanical keyboard for developers with hot-swappable switches.',
      price: 129.99,
      category: 'Accessories',
      sku: 'TEST-MECH-01',
    });
    const saved = await validProduct.save();
    assert.strictEqual(saved.stock, 0, 'Default stock should be 0');
    assert.strictEqual(saved.isAvailable, true, 'Default isAvailable should be true');
    assert.strictEqual(saved.rating, 0, 'Default rating should be 0');
    assert.ok(saved.createdAt, 'createdAt timestamp should be automatically populated');
    assert.ok(saved.updatedAt, 'updatedAt timestamp should be automatically populated');
    assert.strictEqual(saved.inStock, false, 'Virtual inStock should return false when stock is 0');
    console.log('✓ Default values, automatic timestamps (createdAt, updatedAt), and virtual inStock work properly');

    // 3. Test Database Seeding Utility
    console.log('\n--- 2. Testing Database Seeding Utility ---');
    const seeded = await seedDatabase(uri);
    assert.strictEqual(seeded.length, sampleProducts.length);
    const countAfterSeed = await Product.countDocuments();
    assert.strictEqual(countAfterSeed, sampleProducts.length);
    console.log(`✓ Seeder successfully populated ${countAfterSeed} sample products`);

    // 4. Test Controller: getAllProducts with filtering & pagination
    console.log('\n--- 3. Testing Controller: getAllProducts ---');
    {
      const { req, res } = mockReqRes({}, { category: 'Audio' });
      await getAllProducts(req, res);
      assert.strictEqual(res.statusCode, 200);
      assert.ok(res.data.success);
      assert.ok(res.data.data.length > 0);
      res.data.data.forEach((p) => assert.strictEqual(p.category, 'Audio'));
      console.log(`✓ getAllProducts with category filter returned ${res.data.data.length} Audio products`);
    }

    // 5. Test Controller: getProductById
    console.log('\n--- 4. Testing Controller: getProductById ---');
    let sampleId;
    {
      const firstProduct = await Product.findOne();
      sampleId = firstProduct._id.toString();

      // Valid ID
      const { req, res } = mockReqRes({ id: sampleId });
      await getProductById(req, res);
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.data.data._id.toString(), sampleId);
      console.log('✓ getProductById returned product successfully for valid ID');

      // Invalid ObjectId format (400)
      const { req: errReq, res: errRes } = mockReqRes({ id: 'invalid-id-xyz' });
      await getProductById(errReq, errRes);
      assert.strictEqual(errRes.statusCode, 400);
      assert.strictEqual(errRes.data.error, 'Invalid ID');
      console.log('✓ getProductById correctly returns 400 for malformed ObjectId');

      // Non-existent ID (404)
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const { req: nfReq, res: nfRes } = mockReqRes({ id: nonExistentId });
      await getProductById(nfReq, nfRes);
      assert.strictEqual(nfRes.statusCode, 404);
      assert.strictEqual(nfRes.data.error, 'Not Found');
      console.log('✓ getProductById correctly returns 404 for non-existent ID');
    }

    // 6. Test Controller: createProduct
    console.log('\n--- 5. Testing Controller: createProduct ---');
    let createdId;
    {
      // Valid creation (201)
      const newProductPayload = {
        name: 'Brand New Test Webcam',
        description: 'Crystal clear 4K streaming webcam with AI auto-focus and HDR lighting.',
        price: 199.99,
        category: 'Electronics',
        stock: 50,
        sku: 'TEST-CAM-4K',
        tags: ['webcam', '4k', 'streaming'],
      };
      const { req, res } = mockReqRes({}, {}, newProductPayload);
      await createProduct(req, res);
      assert.strictEqual(res.statusCode, 201);
      assert.ok(res.data.data._id);
      createdId = res.data.data._id.toString();
      console.log('✓ createProduct successfully created product with status 201');

      // Duplicate SKU collision (409)
      const { req: dupReq, res: dupRes } = mockReqRes({}, {}, newProductPayload);
      await createProduct(dupReq, dupRes);
      assert.strictEqual(dupRes.statusCode, 409);
      assert.strictEqual(dupRes.data.error, 'Duplicate Key Error');
      console.log('✓ createProduct correctly catches duplicate SKU collision and returns 409');

      // Validation Error on creation (400)
      const { req: valReq, res: valRes } = mockReqRes({}, {}, { name: 'Incomplete' });
      await createProduct(valReq, valRes);
      assert.strictEqual(valRes.statusCode, 400);
      assert.strictEqual(valRes.data.error, 'Validation Error');
      console.log('✓ createProduct catches Mongoose ValidationError and returns 400');
    }

    // 7. Test Controller: updateProduct with runValidators
    console.log('\n--- 6. Testing Controller: updateProduct ---');
    {
      // Valid update (200)
      const { req, res } = mockReqRes({ id: createdId }, {}, { price: 219.99, stock: 75 });
      await updateProduct(req, res);
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.data.data.price, 219.99);
      assert.strictEqual(res.data.data.stock, 75);
      console.log('✓ updateProduct successfully updated product fields');

      // Invalid update failing schema constraints (400)
      const { req: badReq, res: badRes } = mockReqRes({ id: createdId }, {}, { price: -50 });
      await updateProduct(badReq, badRes);
      assert.strictEqual(badRes.statusCode, 400);
      assert.strictEqual(badRes.data.error, 'Validation Error');
      console.log('✓ updateProduct correctly runs validators and rejects negative price with 400');
    }

    // 8. Test Controller: deleteProduct
    console.log('\n--- 7. Testing Controller: deleteProduct ---');
    {
      const { req, res } = mockReqRes({ id: createdId });
      await deleteProduct(req, res);
      assert.strictEqual(res.statusCode, 200);
      assert.ok(res.data.message.includes('deleted'));

      // Check deletion was effective
      const lookup = await Product.findById(createdId);
      assert.strictEqual(lookup, null);
      console.log('✓ deleteProduct successfully deleted product from database');

      // Attempt deleting already deleted ID (404)
      const { req: del404Req, res: del404Res } = mockReqRes({ id: createdId });
      await deleteProduct(del404Req, del404Res);
      assert.strictEqual(del404Res.statusCode, 404);
      console.log('✓ deleteProduct returns 404 when product does not exist');
    }

    // 9. Test Controller: getProductStats
    console.log('\n--- 8. Testing Controller: getProductStats ---');
    {
      const { req, res } = mockReqRes();
      await getProductStats(req, res);
      assert.strictEqual(res.statusCode, 200);
      assert.ok(res.data.overall.totalProducts > 0);
      assert.ok(Array.isArray(res.data.byCategory));
      console.log(`✓ getProductStats returned aggregated data across ${res.data.byCategory.length} categories`);
    }

    console.log('\n====================================================');
    console.log('🎉 ALL TESTS PASSED SUCCESSFULLY! (100% Validated)');
    console.log('====================================================\n');
  } catch (error) {
    console.error('\n❌ Test Suite Failed:', error);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
    if (mongoServer) {
      await mongoServer.stop();
    }
    process.exit(process.exitCode || 0);
  }
}

runTestSuite();
