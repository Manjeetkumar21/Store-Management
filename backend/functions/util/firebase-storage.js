const { getStorage } = require('../config/firebase');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Upload a file to Firebase Storage
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {string} fileName - Original filename
 * @param {string} folder - Folder path in storage (e.g., 'products', 'stores')
 * @param {string} mimeType - File MIME type
 * @returns {Promise<string>} Public URL of uploaded file
 */
async function uploadFile(fileBuffer, fileName, folder = 'uploads', mimeType) {
  try {
    const bucket = getStorage().bucket();
    
    // Generate unique filename
    const fileExtension = path.extname(fileName);
    const uniqueFileName = `${folder}/${uuidv4()}${fileExtension}`;
    
    // Create file reference
    const file = bucket.file(uniqueFileName);
    
    // Upload file
    await file.save(fileBuffer, {
      metadata: {
        contentType: mimeType,
        metadata: {
          firebaseStorageDownloadTokens: uuidv4()
        }
      },
      public: true
    });
    
    // Make file publicly accessible
    await file.makePublic();
    
    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${uniqueFileName}`;
    
    console.log(`File uploaded successfully: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error('Error uploading file to Firebase Storage:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
}

/**
 * Delete a file from Firebase Storage
 * @param {string} fileUrl - Public URL of the file to delete
 * @returns {Promise<boolean>} Success status
 */
async function deleteFile(fileUrl) {
  try {
    if (!fileUrl) return false;
    
    const bucket = getStorage().bucket();
    
    // Extract file path from URL
    const urlParts = fileUrl.split(`${bucket.name}/`);
    if (urlParts.length < 2) {
      console.warn('Invalid file URL format');
      return false;
    }
    
    const filePath = urlParts[1];
    const file = bucket.file(filePath);
    
    // Check if file exists
    const [exists] = await file.exists();
    if (!exists) {
      console.warn(`File does not exist: ${filePath}`);
      return false;
    }
    
    // Delete file
    await file.delete();
    console.log(`File deleted successfully: ${filePath}`);
    return true;
  } catch (error) {
    console.error('Error deleting file from Firebase Storage:', error);
    return false;
  }
}

/**
 * Upload multiple files to Firebase Storage
 * @param {Array} files - Array of file objects from multer
 * @param {string} folder - Folder path in storage
 * @returns {Promise<Array<string>>} Array of public URLs
 */
async function uploadMultipleFiles(files, folder = 'uploads') {
  try {
    const uploadPromises = files.map(file => 
      uploadFile(file.buffer, file.originalname, folder, file.mimetype)
    );
    
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    throw new Error(`Failed to upload files: ${error.message}`);
  }
}

/**
 * Replace an existing file (delete old, upload new)
 * @param {string} oldFileUrl - URL of file to replace
 * @param {Buffer} newFileBuffer - New file buffer
 * @param {string} fileName - New filename
 * @param {string} folder - Folder path
 * @param {string} mimeType - File MIME type
 * @returns {Promise<string>} Public URL of new file
 */
async function replaceFile(oldFileUrl, newFileBuffer, fileName, folder, mimeType) {
  try {
    // Upload new file first
    const newUrl = await uploadFile(newFileBuffer, fileName, folder, mimeType);
    
    // Delete old file (don't fail if deletion fails)
    if (oldFileUrl) {
      await deleteFile(oldFileUrl).catch(err => 
        console.warn('Failed to delete old file:', err.message)
      );
    }
    
    return newUrl;
  } catch (error) {
    console.error('Error replacing file:', error);
    throw new Error(`Failed to replace file: ${error.message}`);
  }
}

/**
 * Get signed URL for temporary access (optional, for private files)
 * @param {string} filePath - Path to file in storage
 * @param {number} expiresIn - Expiration time in milliseconds (default: 1 hour)
 * @returns {Promise<string>} Signed URL
 */
async function getSignedUrl(filePath, expiresIn = 3600000) {
  try {
    const bucket = getStorage().bucket();
    const file = bucket.file(filePath);
    
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + expiresIn
    });
    
    return url;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new Error(`Failed to generate signed URL: ${error.message}`);
  }
}

module.exports = {
  uploadFile,
  deleteFile,
  uploadMultipleFiles,
  replaceFile,
  getSignedUrl
};
