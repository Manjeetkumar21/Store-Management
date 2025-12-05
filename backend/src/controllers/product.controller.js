const { Product, Store } = require("../../models/firestore");
const { formatDoc, formatDocs } = require("../../util/firestore-helpers");
const { successResponse, errorResponse } = require("../utils/responseHandler.js");

// ================= CREATE PRODUCT (ADMIN) =================
const createProduct = async (req, res) => {
  try {
    const { name, description, price, storeId, category, brand, qty, image } = req.body;

    if (!name || !price || !storeId) {
      return errorResponse(res, 400, "Name, Price & Store are required");
    }

    const product = await Product.create({
      name,
      description: description || "",
      price,
      storeId,
      category: category || "",
      brand: brand || "",
      qty: qty || 0,
      image: image || "",
    });

    return successResponse(res, 201, "Product created successfully", formatDoc(product));
  } catch (error) {
    return errorResponse(res, 500, "Server error", error.message);
  }
};


// ================= GET ALL PRODUCTS =======================
const getProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    
    // Populate store for each product
    const productsData = await Promise.all(
      products.map(async (product) => {
        const productData = formatDoc(product);
        
        if (productData.storeId) {
          const store = await Store.findOne({ id: productData.storeId });
          if (store) {
            productData.storeId = {
              id: store.getId(),
              name: store.getData().name
            };
          }
        }
        
        return productData;
      })
    );
    
    return successResponse(res, 200, "Products fetched successfully", productsData);
  } catch (error) {
    return errorResponse(res, 500, "Server error", error.message);
  }
};

// ================= GET SINGLE PRODUCT =====================
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return errorResponse(res, 400, "Product ID is required");

    const product = await Product.findOne({ id });
    if (!product) return errorResponse(res, 404, "Product not found");

    const productData = formatDoc(product);
    
    // Populate store
    if (productData.storeId) {
      const store = await Store.findOne({ id: productData.storeId });
      if (store) {
        productData.storeId = {
          id: store.getId(),
          name: store.getData().name
        };
      }
    }

    return successResponse(res, 200, "Product fetched successfully", productData);
  } catch (error) {
    return errorResponse(res, 500, "Server error", error.message);
  }
};

// ================= GET PRODUCTS BY STORE =================
const getProductsByStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    if (!storeId) return errorResponse(res, 400, "Store ID is required");

    const products = await Product.findAll({ where: { storeId } });
    
    // Populate store for products
    const productsData = await Promise.all(
      products.map(async (product) => {
        const productData = formatDoc(product);
        
        const store = await Store.findOne({ id: storeId });
        if (store) {
          productData.storeId = {
            id: store.getId(),
            name: store.getData().name
          };
        }
        
        return productData;
      })
    );

    return successResponse(res, 200, "Products fetched successfully", productsData);
  } catch (error) {
    return errorResponse(res, 500, "Server error", error.message);
  }
};

// ================= UPDATE PRODUCT (ADMIN) ==================
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!id) return errorResponse(res, 400, "Product ID is required");
    if (!updates || Object.keys(updates).length === 0)
      return errorResponse(res, 400, "No fields provided to update");

    const product = await Product.findOne({ id });
    if (!product) return errorResponse(res, 404, "Product not found");

    await Product.update(updates, { id });

    const updatedProduct = await Product.findOne({ id });
    return successResponse(res, 200, "Product updated successfully", formatDoc(updatedProduct));
  } catch (error) {
    return errorResponse(res, 500, "Server error", error.message);
  }
};

// ================= DELETE PRODUCT (ADMIN) ==================
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return errorResponse(res, 400, "Product ID is required");

    const product = await Product.findOne({ id });
    if (!product) return errorResponse(res, 404, "Product not found");

    await Product.destroy({ id });

    return successResponse(res, 200, "Product deleted successfully", {});
  } catch (error) {
    return errorResponse(res, 500, "Server error", error.message);
  }
};


module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByStore
};
