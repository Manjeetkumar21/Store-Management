const { Store, Company, Product } = require("../../models/firestore");
const { formatDoc, formatDocs } = require("../../util/firestore-helpers");
const { successResponse, errorResponse } = require("../utils/responseHandler");

// CREATE STORE
const createStore = async (req, res) => {
  try {
    const { companyId, name, email, password, location, address, landingPage } = req.body;

    if (!companyId || !name || !email || !password) {
      return errorResponse(res, 400, "Required fields missing", {
        companyId: !companyId ? "Company ID required" : null,
        name: !name ? "Store name required" : null,
        email: !email ? "Email required" : null,
        password: !password ? "Password required" : null,
      });
    }

    const companyExists = await Company.findOne({ id: companyId });
    if (!companyExists) return errorResponse(res, 404, "Company not found");

    const exists = await Store.findOne({ where: { email } });
    if (exists) return errorResponse(res, 409, "Store with email already exists");

    // Hash password
    const hashedPassword = await Store.hashPassword(password);

    const storeData = {
      companyId,
      name,
      email,
      password: hashedPassword,
      location,
      address,
      createdBy: req.user.id,
    };

    // Add landingPage if provided
    if (landingPage) {
      storeData.landingPage = landingPage;
    }

    const store = await Store.create(storeData);

    const responseData = formatDoc(store);
    delete responseData.password;

    return successResponse(res, 201, "Store created successfully", responseData);
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

//GET ALL STORES
const getAllStores = async (req, res) => {
  try {
    const stores = await Store.findAll();
    
    // Populate company and products for each store
    const storesData = await Promise.all(
      stores.map(async (store) => {
        const storeData = formatDoc(store);
        delete storeData.password;
        
        // Get company
        if (storeData.companyId) {
          const company = await Company.findOne({ id: storeData.companyId });
          if (company) {
            const companyData = formatDoc(company);
            storeData.companyId = {
              id: companyData.id,
              name: companyData.name,
              description: companyData.description,
              createdBy: companyData.createdBy
            };
          }
        }
        
        // Get products
        const products = await Product.findAll({ where: { storeId: storeData.id } });
        storeData.products = formatDocs(products);
        
        return storeData;
      })
    );

    return successResponse(res, 200, "Stores with company & products fetched", storesData);
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};


// GET STORES BY COMPANY
const getStoresByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;

    if (!companyId) return errorResponse(res, 400, "Company ID required");

    const stores = await Store.findAll({ where: { companyId } });
    const storesData = formatDocs(stores).map(store => {
      delete store.password;
      return store;
    });
    
    return successResponse(res, 200, "Stores fetched", storesData);
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

// GET STORE BY ID
const getStoreById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return errorResponse(res, 400, "Store ID is required");

    const store = await Store.findOne({ id });
    if (!store) return errorResponse(res, 404, "Store not found");

    const storeData = formatDoc(store);
    delete storeData.password;

    // Populate company
    if (storeData.companyId) {
      const company = await Company.findOne({ id: storeData.companyId });
      if (company) {
        const companyData = formatDoc(company);
        storeData.companyId = {
          id: companyData.id,
          name: companyData.name,
          email: companyData.email,
          description: companyData.description,
          createdAt: companyData.createdAt
        };
      }
    }

    // Populate products
    const products = await Product.findAll({ where: { storeId: id } });
    storeData.products = formatDocs(products);

    return successResponse(res, 200, "Store fetched successfully", storeData);
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

// GET LOGGED-IN STORE'S OWN DETAILS
const getMyStoreDetails = async (req, res) => {
  try {
    const store = await Store.findOne({ id: req.user.id });
    if (!store) return errorResponse(res, 404, "Store not found");

    const storeData = formatDoc(store);
    delete storeData.password;

    // Populate company
    if (storeData.companyId) {
      const company = await Company.findOne({ id: storeData.companyId });
      if (company) {
        const companyData = formatDoc(company);
        storeData.companyId = {
          id: companyData.id,
          name: companyData.name,
          email: companyData.email,
          description: companyData.description
        };
      }
    }

    // Populate products
    const products = await Product.findAll({ where: { storeId: req.user.id } });
    storeData.products = formatDocs(products);

    return successResponse(res, 200, "Store details fetched successfully", storeData);
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

// UPDATE STORE
const updateStore = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, location, address, landingPage } = req.body;

    if (!id) return errorResponse(res, 400, "Store ID is required");

    const store = await Store.findOne({ id });
    if (!store) return errorResponse(res, 404, "Store not found");

    if (email && email !== store.getData().email) {
      const emailExists = await Store.findOne({ where: { email } });
      if (emailExists) return errorResponse(res, 409, "Email already in use");
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) updateData.password = await Store.hashPassword(password);
    if (location) updateData.location = location;
    if (address) updateData.address = address;
    if (landingPage) updateData.landingPage = landingPage;

    await Store.update(updateData, { id });

    const updatedStore = await Store.findOne({ id });
    const responseData = formatDoc(updatedStore);
    delete responseData.password;

    return successResponse(res, 200, "Store updated successfully", responseData);
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

// DELETE STORE
const deleteStore = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return errorResponse(res, 400, "Store ID required");

    const store = await Store.findOne({ id });
    if (!store) return errorResponse(res, 404, "Store not found");

    await Store.destroy({ id });

    return successResponse(res, 200, "Store deleted successfully");
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

module.exports = {
  createStore,
  getAllStores,
  getStoresByCompany,
  getStoreById,
  getMyStoreDetails,
  updateStore,
  deleteStore
};
