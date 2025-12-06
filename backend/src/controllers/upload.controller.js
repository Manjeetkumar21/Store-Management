const { uploadFile, deleteFile } = require("../../util/firebase-storage");
const { Store, Product } = require("../../models/firestore");
const { formatDoc } = require("../../util/firestore-helpers");
const { successResponse, errorResponse } = require("../utils/responseHandler.js");

// ===================== UPLOAD STORE IMAGE =====================
const uploadStoreImage = async (req, res) => {
  const storeId = req.params.id;
  const file = req.file;

  if (!storeId) return errorResponse(res, 400, "Store ID is required");
  if (!file) return errorResponse(res, 400, "No file uploaded");

  try {
    const store = await Store.findOne({ id: storeId });
    if (!store) return errorResponse(res, 404, "Store not found");

    const oldImage = store.getData().image;

    // Upload new image to Firebase Storage
    const imageUrl = await uploadFile(
      file.buffer,
      file.originalname,
      'stores',
      file.mimetype
    );

    // Update store with new image URL
    await store.update({ image: imageUrl });

    // Delete old image if exists
    if (oldImage) {
      await deleteFile(oldImage).catch(err => 
        console.warn('Failed to delete old image:', err)
      );
    }

    const updatedStore = await Store.findOne({ id: storeId });
    const storeData = formatDoc(updatedStore);
    delete storeData.password;

    return successResponse(res, 200, "Store image updated", storeData);
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
    const product = await Product.findOne({ id: productId });
    if (!product) return errorResponse(res, 404, "Product not found");

    const productData = product.getData();
    const oldImage = productData.image;

    // Get store information for folder structure
    const store = await Store.findOne({ id: productData.storeId });
    const storeName = store ? store.getData().name.replace(/[^a-zA-Z0-9]/g, '_') : 'unknown';
    
    // Upload new image to Firebase Storage with folder: products/{storeName}
    const imageUrl = await uploadFile(
      file.buffer,
      file.originalname,
      `products/${storeName}`,
      file.mimetype
    );

    // Update product with new image URL
    await product.update({ image: imageUrl });

    // Delete old image if exists
    if (oldImage) {
      await deleteFile(oldImage).catch(err => 
        console.warn('Failed to delete old image:', err)
      );
    }

    const updatedProduct = await Product.findOne({ id: productId });
    return successResponse(res, 200, "Product image uploaded", formatDoc(updatedProduct));
  } catch (err) {
    return errorResponse(res, 500, "Image upload failed", err.message);
  }
};

module.exports = { uploadStoreImage, uploadProductImage };
