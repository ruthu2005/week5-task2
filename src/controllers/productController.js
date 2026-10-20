const mongoose = require('mongoose');
const Product = require('../models/Product');

/**
 * Helper to format Mongoose validation errors into a clean object
 */
const formatValidationErrors = (err) => {
  const errors = {};
  if (err.errors) {
    Object.keys(err.errors).forEach((key) => {
      errors[key] = err.errors[key].message;
    });
  }
  return errors;
};

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Public
 */
const createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    const savedProduct = await product.save();

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: savedProduct,
    });
  } catch (error) {
    // Handle Mongoose Validation Error
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: formatValidationErrors(error),
      });
    }

    // Handle MongoDB Duplicate Key Error (E11000)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      const value = error.keyValue ? error.keyValue[field] : '';
      return res.status(409).json({
        success: false,
        error: 'Duplicate Key Error',
        message: `Product with ${field} "${value}" already exists. SKU must be unique.`,
        field,
      });
    }

    // General Server Error
    return res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message,
    });
  }
};

/**
 * @desc    Get all products with filtering, search, sorting, and pagination
 * @route   GET /api/products
 * @access  Public
 */
const getAllProducts = async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      inStock,
      search,
      sortBy = 'createdAt_desc',
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    // Filter by Category
    if (category) {
      filter.category = category;
    }

    // Filter by Price Range
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined && !isNaN(Number(minPrice))) {
        filter.price.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    // Filter by In-Stock availability
    if (inStock !== undefined) {
      if (inStock === 'true' || inStock === true) {
        filter.stock = { $gt: 0 };
        filter.isAvailable = true;
      } else if (inStock === 'false' || inStock === false) {
        filter.$or = [{ stock: { $lte: 0 } }, { isAvailable: false }];
      }
    }

    // Full-Text Search on name and description
    if (search && search.trim() !== '') {
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { sku: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Sorting options
    let sortObj = { createdAt: -1 };
    switch (sortBy) {
      case 'price_asc':
        sortObj = { price: 1 };
        break;
      case 'price_desc':
        sortObj = { price: -1 };
        break;
      case 'name_asc':
        sortObj = { name: 1 };
        break;
      case 'name_desc':
        sortObj = { name: -1 };
        break;
      case 'rating_desc':
        sortObj = { rating: -1 };
        break;
      case 'oldest':
        sortObj = { createdAt: 1 };
        break;
      case 'newest':
      default:
        sortObj = { createdAt: -1 };
        break;
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Asynchronous Mongoose queries
    const [products, totalCount] = await Promise.all([
      Product.find(filter).sort(sortObj).skip(skip).limit(limitNum),
      Product.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: products.length,
      pagination: {
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / limitNum) || 1,
        currentPage: pageNum,
        limit: limitNum,
        hasNextPage: skip + products.length < totalCount,
        hasPrevPage: pageNum > 1,
      },
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message,
    });
  }
};

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Strict validation of MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID',
        message: `"${id}" is not a valid MongoDB ObjectId`,
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Product with ID "${id}" was not found`,
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message,
    });
  }
};

/**
 * @desc    Update an existing product by ID
 * @route   PUT /api/products/:id
 * @access  Public
 */
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Strict validation of MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID',
        message: `"${id}" is not a valid MongoDB ObjectId`,
      });
    }

    // Disallow overriding immutable or managed properties directly if needed
    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.createdAt;

    // Execute update with runValidators: true to enforce schema constraints on updates
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true, // Return modified document rather than the original
        runValidators: true, // Enforce schema validators on update operations
        context: 'query',
      }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Product with ID "${id}" was not found`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: formatValidationErrors(error),
      });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      const value = error.keyValue ? error.keyValue[field] : '';
      return res.status(409).json({
        success: false,
        error: 'Duplicate Key Error',
        message: `Product with ${field} "${value}" already exists. SKU must be unique.`,
        field,
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message,
    });
  }
};

/**
 * @desc    Delete a product by ID
 * @route   DELETE /api/products/:id
 * @access  Public
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Strict validation of MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID',
        message: `"${id}" is not a valid MongoDB ObjectId`,
      });
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Product with ID "${id}" was not found`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      deletedProduct: {
        id: deletedProduct._id,
        name: deletedProduct.name,
        sku: deletedProduct.sku,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message,
    });
  }
};

/**
 * @desc    Get aggregated product statistics
 * @route   GET /api/products/stats/summary
 * @access  Public
 */
const getProductStats = async (req, res) => {
  try {
    const stats = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          totalProducts: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          totalInventoryStock: { $sum: '$stock' },
        },
      },
      {
        $project: {
          category: '$_id',
          _id: 0,
          totalProducts: 1,
          avgPrice: { $round: ['$avgPrice', 2] },
          minPrice: { $round: ['$minPrice', 2] },
          maxPrice: { $round: ['$maxPrice', 2] },
          totalInventoryStock: 1,
        },
      },
      { $sort: { totalProducts: -1 } },
    ]);

    const overall = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          totalStock: { $sum: '$stock' },
        },
      },
      {
        $project: {
          _id: 0,
          totalProducts: 1,
          avgPrice: { $round: ['$avgPrice', 2] },
          totalStock: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      overall: overall[0] || { totalProducts: 0, avgPrice: 0, totalStock: 0 },
      byCategory: stats,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductStats,
};
