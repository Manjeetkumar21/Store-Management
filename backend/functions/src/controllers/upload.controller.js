const { uploadFile, deleteFile } = require("../../util/firebase-storage");
const { Store, Product } = require("../../models/firestore");
const { formatDoc } = require("../../util/firestore-helpers");
const { successResponse, errorResponse } = require("../utils/responseHandler.js");

// ===================== UPLOAD STORE NAVBAR IMAGE (BASE64) =====================
const uploadStoreNavbarImage = async (req, res) => {
  const storeId = req.params.id;
  const { imageData, fileName, mimeType } = req.body;

  if (!storeId) return errorResponse(res, 400, "Store ID is required");
  if (!imageData) return errorResponse(res, 400, "No image data provided");
  if (!fileName) return errorResponse(res, 400, "File name is required");

  try {
    const store = await Store.findOne({ id: storeId });
    if (!store) return errorResponse(res, 404, "Store not found");

    const storeData = store.getData();
    const oldImage = storeData.landingPage?.navbar?.logoImage || '';
    const storeName = storeData.name.replace(/[^a-zA-Z0-9]/g, '_');

    // Convert base64 to buffer
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const fileBuffer = Buffer.from(base64Data, 'base64');

    // Upload new image to Firebase Storage: stores/{storeName}/navbar/
    const imageUrl = await uploadFile(
      fileBuffer,
      fileName,
      `stores/${storeName}/navbar`,
      mimeType || 'image/jpeg'
    );

    // Update store with new navbar logo URL
    const updatedLandingPage = {
      ...storeData.landingPage,
      navbar: {
        ...storeData.landingPage?.navbar,
        logoImage: imageUrl
      }
    };
    
    await store.update({ landingPage: updatedLandingPage });

    // Delete old image if exists
    if (oldImage) {
      await deleteFile(oldImage).catch(err => 
        console.warn('⚠️ Failed to delete old navbar image:', err)
      );
    }

    const updatedStore = await Store.findOne({ id: storeId });
    const responseData = formatDoc(updatedStore);
    delete responseData.password;

    return successResponse(res, 200, "Navbar logo updated", responseData);
  } catch (err) {
    console.error("❌ Navbar upload error:", err);
    return errorResponse(res, 500, "Navbar image upload failed", err.message);
  }
};

// ===================== UPLOAD STORE FOOTER IMAGE (BASE64) =====================
const uploadStoreFooterImage = async (req, res) => {
  const storeId = req.params.id;
  const { imageData, fileName, mimeType } = req.body;

  if (!storeId) return errorResponse(res, 400, "Store ID is required");
  if (!imageData) return errorResponse(res, 400, "No image data provided");
  if (!fileName) return errorResponse(res, 400, "File name is required");

  try {
    const store = await Store.findOne({ id: storeId });
    if (!store) return errorResponse(res, 404, "Store not found");

    const storeData = store.getData();
    const oldImage = storeData.landingPage?.footer?.logoImage || '';
    const storeName = storeData.name.replace(/[^a-zA-Z0-9]/g, '_');

    // Convert base64 to buffer
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const fileBuffer = Buffer.from(base64Data, 'base64');

    // Upload new image to Firebase Storage: stores/{storeName}/footer/
    const imageUrl = await uploadFile(
      fileBuffer,
      fileName,
      `stores/${storeName}/footer`,
      mimeType || 'image/jpeg'
    );

    // Update store with new footer logo URL
    const updatedLandingPage = {
      ...storeData.landingPage,
      footer: {
        ...storeData.landingPage?.footer,
        logoImage: imageUrl
      }
    };
    
    await store.update({ landingPage: updatedLandingPage });

    // Delete old image if exists
    if (oldImage) {
      await deleteFile(oldImage).catch(err => 
        console.warn('⚠️ Failed to delete old footer image:', err)
      );
    }

    const updatedStore = await Store.findOne({ id: storeId });
    const responseData = formatDoc(updatedStore);
    delete responseData.password;

    return successResponse(res, 200, "Footer logo updated", responseData);
  } catch (err) {
    console.error("❌ Footer upload error:", err);
    return errorResponse(res, 500, "Footer image upload failed", err.message);
  }
};

// ===================== UPLOAD STORE HERO IMAGE (BASE64) =====================
const uploadStoreHeroImage = async (req, res) => {
  const storeId = req.params.id;
  const { imageData, fileName, mimeType } = req.body;

  if (!storeId) return errorResponse(res, 400, "Store ID is required");
  if (!imageData) return errorResponse(res, 400, "No image data provided");
  if (!fileName) return errorResponse(res, 400, "File name is required");

  try {
    const store = await Store.findOne({ id: storeId });
    if (!store) return errorResponse(res, 404, "Store not found");

    const storeData = store.getData();
    const oldImage = storeData.landingPage?.hero?.heroImage || '';
    const storeName = storeData.name.replace(/[^a-zA-Z0-9]/g, '_');

    // Convert base64 to buffer
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const fileBuffer = Buffer.from(base64Data, 'base64');

    // Upload new image to Firebase Storage: stores/{storeName}/hero/
    const imageUrl = await uploadFile(
      fileBuffer,
      fileName,
      `stores/${storeName}/hero`,
      mimeType || 'image/jpeg'
    );

    // Update store with new hero image URL
    const updatedLandingPage = {
      ...storeData.landingPage,
      hero: {
        ...storeData.landingPage?.hero,
        heroImage: imageUrl
      }
    };
    
    await store.update({ landingPage: updatedLandingPage });

    // Delete old image if exists
    if (oldImage) {
      await deleteFile(oldImage).catch(err => 
        console.warn('⚠️ Failed to delete old hero image:', err)
      );
    }

    const updatedStore = await Store.findOne({ id: storeId });
    const responseData = formatDoc(updatedStore);
    delete responseData.password;

    return successResponse(res, 200, "Hero image updated", responseData);
  } catch (err) {
    console.error("❌ Hero upload error:", err);
    return errorResponse(res, 500, "Hero image upload failed", err.message);
  }
};

// ===================== UPLOAD PRODUCT IMAGE (BASE64) =====================
const uploadProductImage = async (req, res) => {
  const productId = req.params.id;
  const { imageData, fileName, mimeType } = req.body;

  console.log("📥 Upload request:", { productId, fileName, mimeType, hasData: !!imageData });

  if (!productId) return errorResponse(res, 400, "Product ID is required");
  if (!imageData) return errorResponse(res, 400, "No image data provided");
  if (!fileName) return errorResponse(res, 400, "File name is required");

  try {
    const product = await Product.findOne({ id: productId });
    if (!product) return errorResponse(res, 404, "Product not found");

    const productData = product.getData();
    const oldImage = productData.image;

    // Get store information for folder structure
    const store = await Store.findOne({ id: productData.storeId });
    const storeName = store ? store.getData().name.replace(/[^a-zA-Z0-9]/g, '_') : 'unknown';
    
    // Convert base64 to buffer
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const fileBuffer = Buffer.from(base64Data, 'base64');
    
    console.log("📤 Uploading to Firebase Storage...");
    
    // Upload new image to Firebase Storage with folder: products/{storeName}
    const imageUrl = await uploadFile(
      fileBuffer,
      fileName,
      `products/${storeName}`,
      mimeType || 'image/jpeg'
    );

    console.log("✅ Image uploaded:", imageUrl);

    // Update product with new image URL
    await product.update({ image: imageUrl });

    // Delete old image if exists
    if (oldImage) {
      await deleteFile(oldImage).catch(err => 
        console.warn('⚠️ Failed to delete old image:', err)
      );
    }

    const updatedProduct = await Product.findOne({ id: productId });
    return successResponse(res, 200, "Product image uploaded", formatDoc(updatedProduct));
  } catch (err) {
    console.error("❌ Upload error:", err);
    return errorResponse(res, 500, "Image upload failed", err.message);
  }
};

module.exports = { uploadStoreNavbarImage, uploadStoreFooterImage, uploadStoreHeroImage, uploadProductImage };
