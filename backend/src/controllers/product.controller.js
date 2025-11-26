const Product = require("../../models/product.model.js");
const { asyncHandler } = require("../utils/asyncHandler.js");
const { ApiResponse } = require("../utils/apiResponse.js");
const { ApiError } = require("../utils/apiError.js");

// Create Product (ADMIN)
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, store } = req.body;

  if (!name || !price || !store) {
    throw new ApiError(400, "Name, Price and Store are required");
  }

  const product = await Product.create({
    name,
    description,
    price,
    store,
  });

  return res.status(201).json(new ApiResponse(201, product, "Product created"));
});

// Get All Products
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find().populate("store", "name");

  return res.status(200).json(new ApiResponse(200, products));
});

// Get Single Product
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    "store",
    "name"
  );

  if (!product) throw new ApiError(404, "Product not found");

  return res.status(200).json(new ApiResponse(200, product));
});

// Update Product (ADMIN)
const updateProduct = asyncHandler(async (req, res) => {
  const updates = req.body;

  const product = await Product.findByIdAndUpdate(req.params.id, updates, {
    new: true,
  });

  if (!product) throw new ApiError(404, "Product not found");

  return res.status(200).json(new ApiResponse(200, product, "Product updated"));
});

// Delete Product (ADMIN)
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) throw new ApiError(404, "Product not found");

  return res.status(200).json(new ApiResponse(200, {}, "Product deleted"));
});

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
