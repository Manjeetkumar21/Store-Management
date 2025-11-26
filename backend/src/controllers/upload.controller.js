const cloudinary = require("../utils/cloudinary.js");
const Store = require("../../models/store.model.js");
const Product = require("../../models/product.model.js");

// Upload Store Image
const uploadStoreImage = async (req, res) => {
  try {
    const storeId = req.params.id;
    const file = req.file;

    if (!file)
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });

    const uploadRes = await cloudinary.uploader.upload_stream(
      { folder: "stores" },
      async (error, result) => {
        if (error)
          return res
            .status(500)
            .json({ success: false, message: error.message });

        const store = await Store.findByIdAndUpdate(
          storeId,
          { image: result.secure_url },
          { new: true }
        );

        res.json({ success: true, message: "Store image updated", store });
      }
    );

    uploadRes.end(file.buffer);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Upload Product Image
const uploadProductImage = async (req, res) => {
  try {
    const productId = req.params.id;
    const file = req.file;

    if (!file)
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });

    const uploadRes = await cloudinary.uploader.upload_stream(
      { folder: "products" },
      async (error, result) => {
        if (error)
          return res
            .status(500)
            .json({ success: false, message: error.message });

        const product = await Product.findByIdAndUpdate(
          productId,
          { image: result.secure_url },
          { new: true }
        );

        res.json({ success: true, message: "Product image uploaded", product });
      }
    );

    uploadRes.end(file.buffer);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { uploadStoreImage, uploadProductImage };
