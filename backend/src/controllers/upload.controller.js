const cloudinary = require("../utils/cloudinary.js");
const Store = require("../../models/store.model.js");
const Product = require("../../models/product.model.js");
const { successResponse, errorResponse } = require("../utils/responseHandler.js");

// ===================== UPLOAD STORE IMAGE =====================
const uploadStoreImage = async (req, res) => {
  const storeId = req.params.id;
  const file = req.file;

  if (!storeId) return errorResponse(res, 400, "Store ID is required");
  if (!file) return errorResponse(res, 400, "No file uploaded");

  try {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "stores" },
      async (error, result) => {
        if (error) return errorResponse(res, 500, "Upload failed", error.message);

        const store = await Store.findByIdAndUpdate(
          storeId,
          { image: result.secure_url },
          { new: true }
        );

        if (!store) return errorResponse(res, 404, "Store not found");

        return successResponse(res, 200, "Store image updated", store);
      }
    );

    uploadStream.end(file.buffer);

  } catch (err) {
    return errorResponse(res, 500, "Image upload failed", err.message);
  }
};

// ===================== UPLOAD PRODUCT IMAGE =====================
const uploadProductImage = async (req, res) => {
  const productId = req.params.id;
  const file = req.file;

  if (!productId) return errorResponse(res, 400, "Product ID is required");
  if (!file) return errorResponse(res, 400, "No file uploaded");

  try {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "products" },
      async (error, result) => {
        if (error) return errorResponse(res, 500, "Upload failed", error.message);

        const product = await Product.findByIdAndUpdate(
          productId,
          { image: result.secure_url },
          { new: true }
        );

        if (!product) return errorResponse(res, 404, "Product not found");

        return successResponse(res, 200, "Product image uploaded", product);
      }
    );

    uploadStream.end(file.buffer);

  } catch (err) {
    return errorResponse(res, 500, "Image upload failed", err.message);
  }
};

module.exports = { uploadStoreImage, uploadProductImage };
