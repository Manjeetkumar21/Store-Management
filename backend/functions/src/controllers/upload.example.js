/**
 * Example Controller showing how to use Firebase Storage
 * This demonstrates the pattern for uploading images in your controllers
 */

const { uploadFile, deleteFile, replaceFile } = require('../util/firebase-storage');
const { User, Product, Store } = require('../models/firestore');
const { formatDoc } = require('../util/firestore-helpers');

/**
 * Example: Upload product image
 * Route: POST /api/products/:id/image
 */
const uploadProductImage = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Find product
    const product = await Product.findOne({ id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Get old image URL (if exists)
    const oldImageUrl = product.getData().image;
    
    // Upload new image to Firebase Storage
    const imageUrl = await uploadFile(
      req.file.buffer,
      req.file.originalname,
      'products', // folder name
      req.file.mimetype
    );
    
    // Update product with new image URL
    await product.update({ image: imageUrl });
    
    // Delete old image if it exists
    if (oldImageUrl) {
      await deleteFile(oldImageUrl).catch(err => 
        console.warn('Failed to delete old image:', err)
      );
    }
    
    // Return updated product
    const updatedProduct = await Product.findOne({ id });
    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: formatDoc(updatedProduct)
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to upload image',
      error: error.message 
    });
  }
};

/**
 * Example: Upload store logo
 * Route: POST /api/stores/:id/logo
 */
const uploadStoreLogo = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const store = await Store.findOne({ id });
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }
    
    const oldLogoUrl = store.getData().image;
    
    // Upload to 'stores' folder
    const logoUrl = await uploadFile(
      req.file.buffer,
      req.file.originalname,
      'stores',
      req.file.mimetype
    );
    
    await store.update({ image: logoUrl });
    
    if (oldLogoUrl) {
      await deleteFile(oldLogoUrl).catch(err => 
        console.warn('Failed to delete old logo:', err)
      );
    }
    
    const updatedStore = await Store.findOne({ id });
    res.json({
      success: true,
      message: 'Logo uploaded successfully',
      data: formatDoc(updatedStore)
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to upload logo',
      error: error.message 
    });
  }
};

/**
 * Example: Upload multiple images
 * Route: POST /api/products/:id/gallery
 */
const uploadProductGallery = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    
    const product = await Product.findOne({ id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Upload all images
    const uploadPromises = req.files.map(file =>
      uploadFile(file.buffer, file.originalname, 'products/gallery', file.mimetype)
    );
    
    const imageUrls = await Promise.all(uploadPromises);
    
    // Store URLs in product (you might want to add a 'gallery' field to Product model)
    await product.update({ 
      gallery: imageUrls // Add this field to your Product model if needed
    });
    
    res.json({
      success: true,
      message: 'Images uploaded successfully',
      data: {
        urls: imageUrls,
        count: imageUrls.length
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to upload images',
      error: error.message 
    });
  }
};

/**
 * Example: Delete image
 * Route: DELETE /api/products/:id/image
 */
const deleteProductImage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findOne({ id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const imageUrl = product.getData().image;
    if (!imageUrl) {
      return res.status(400).json({ message: 'No image to delete' });
    }
    
    // Delete from Firebase Storage
    await deleteFile(imageUrl);
    
    // Update product
    await product.update({ image: '' });
    
    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete image',
      error: error.message 
    });
  }
};

module.exports = {
  uploadProductImage,
  uploadStoreLogo,
  uploadProductGallery,
  deleteProductImage
};
