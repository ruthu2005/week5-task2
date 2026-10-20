const express = require('express');
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductStats,
} = require('../controllers/productController');

// Aggregated product statistics
router.get('/stats/summary', getProductStats);

// Main collection routes: Create and Read All
router.route('/')
  .post(createProduct)
  .get(getAllProducts);

// Individual product item routes: Read Single, Update, Delete
router.route('/:id')
  .get(getProductById)
  .put(updateProduct)
  .delete(deleteProduct);

module.exports = router;
