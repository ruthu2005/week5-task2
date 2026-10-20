const mongoose = require('mongoose');

/**
 * Product Schema
 * Demonstrates strict field validations, custom error messages,
 * default values, custom schema validators, and automatic timestamp tracking.
 */
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [2, 'Product name must be at least 2 characters long'],
      maxlength: [100, 'Product name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
      minlength: [10, 'Product description must be at least 10 characters long'],
      maxlength: [2000, 'Product description cannot exceed 2000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0.01, 'Price must be greater than 0'],
      set: (val) => (typeof val === 'number' ? Math.round(val * 100) / 100 : val),
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      trim: true,
      enum: {
        values: [
          'Electronics',
          'Computers',
          'Audio',
          'Wearables',
          'Accessories',
          'Office',
          'Books',
          'Other',
        ],
        message: 'Category "{VALUE}" is not supported. Allowed: Electronics, Computers, Audio, Wearables, Accessories, Office, Books, Other',
      },
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative'],
      validate: {
        validator: function (val) {
          return Number.isInteger(val);
        },
        message: 'Stock quantity must be an integer (received: {VALUE})',
      },
    },
    sku: {
      type: String,
      required: [true, 'SKU (Stock Keeping Unit) is required'],
      unique: true,
      uppercase: true,
      trim: true,
      match: [
        /^[A-Z0-9_-]{3,20}$/,
        'SKU must be 3-20 characters long and contain only uppercase alphanumeric characters, hyphens, or underscores',
      ],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot exceed 5.0'],
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          return Array.isArray(arr) && arr.length <= 15;
        },
        message: 'A product can have a maximum of 15 tags',
      },
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt fields
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual property to dynamically compute inStock status
productSchema.virtual('inStock').get(function () {
  return typeof this.stock === 'number' && this.stock > 0;
});

// Text index on name and description for full-text search capability
productSchema.index({ name: 'text', description: 'text' });
// Index on category and price for common query filters
productSchema.index({ category: 1, price: 1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
