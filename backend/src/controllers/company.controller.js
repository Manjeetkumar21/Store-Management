const Company = require("../../models/company.model");
const { successResponse, errorResponse } = require("../utils/responseHandler");

// Create Company
const createCompany = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Validate fields
    if (!name || !description) {
      return errorResponse(res, 400, "All fields are required", {
        name: !name ? "Company name is required" : null,
        description: !description ? "Description is required" : null,
      });
    }

    // Check if company already exists
    const existing = await Company.findOne({ name });
    if (existing) {
      return errorResponse(res, 409, "Company already exists", {
        name: "Company name must be unique",
      });
    }

    console.log("req.user : ", req.user, req.user._id)
    const company = await Company.create({ name, description,createdBy: req.user._id, });

    return successResponse(res, 201, "Company created successfully", company);
  } catch (error) {
    return errorResponse(res, 500, "Server error", error.message);
  }
};

// Get All Companies
const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find();
    return successResponse(res, 200, "Companies fetched successfully", companies);
  } catch (error) {
    return errorResponse(res, 500, "Server error", error.message);
  }
};

// Get Company by ID
const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id) return errorResponse(res, 400, "Company ID is required");

    const company = await Company.findById(id);
    if (!company) return errorResponse(res, 404, "Company not found");

    return successResponse(res, 200, "Company details fetched", company);
  } catch (error) {
    return errorResponse(res, 500, "Server error", error.message);
  }
};

// Update Company
const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!id) return errorResponse(res, 400, "Company ID is required");

    if (!name && !description) {
      return errorResponse(res, 400, "At least one field is required to update");
    }

    const company = await Company.findByIdAndUpdate(
      id,
      { name, description },
      { new: true }
    );

    if (!company) return errorResponse(res, 404, "Company not found");

    return successResponse(res, 200, "Company updated successfully", company);
  } catch (error) {
    return errorResponse(res, 500, "Server error", error.message);
  }
};

// Delete Company
const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) return errorResponse(res, 400, "Company ID is required");

    const company = await Company.findByIdAndDelete(id);

    if (!company) return errorResponse(res, 404, "Company not found");

    return successResponse(res, 200, "Company deleted successfully", company);
  } catch (error) {
    return errorResponse(res, 500, "Server error", error.message);
  }
};


module.exports = {
  createCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
};