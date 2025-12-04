const models = require('../models/firestore');

/**
 * Populate a single reference field in a document
 * @param {Object} doc - Firestore document instance
 * @param {string} fieldName - Name of the field to populate
 * @param {string} modelName - Name of the model to populate from
 * @returns {Promise<Object>} Document with populated field
 */
async function populateField(doc, fieldName, modelName) {
  if (!doc) return null;
  
  const data = doc.getData();
  const refId = data[fieldName];
  
  if (!refId) return doc;
  
  const Model = models[modelName];
  if (!Model) {
    console.warn(`Model ${modelName} not found`);
    return doc;
  }
  
  try {
    const refDoc = await Model.findOne({ id: refId });
    
    if (refDoc) {
      data[fieldName] = {
        id: refDoc.getId(),
        ...refDoc.getData()
      };
    }
  } catch (error) {
    console.error(`Error populating ${fieldName}:`, error.message);
  }
  
  return doc;
}

/**
 * Populate multiple documents with a reference field
 * @param {Array} docs - Array of Firestore document instances
 * @param {string} fieldName - Name of the field to populate
 * @param {string} modelName - Name of the model to populate from
 * @returns {Promise<Array>} Documents with populated fields
 */
async function populateMany(docs, fieldName, modelName) {
  if (!Array.isArray(docs)) return [];
  return Promise.all(docs.map(doc => populateField(doc, fieldName, modelName)));
}

/**
 * Convert Firestore document to API response format
 * @param {Object} doc - Firestore document instance
 * @returns {Object|null} Formatted document object
 */
function formatDoc(doc) {
  if (!doc) return null;
  
  const data = doc.getData();
  
  // Convert timestamps from milliseconds to Date objects for consistency
  const formatted = {
    id: doc.getId(),
    ...data
  };
  
  // Convert numeric timestamps to ISO strings for API responses
  if (formatted.createdAt && typeof formatted.createdAt === 'number') {
    formatted.createdAt = new Date(formatted.createdAt).toISOString();
  }
  if (formatted.updatedAt && typeof formatted.updatedAt === 'number') {
    formatted.updatedAt = new Date(formatted.updatedAt).toISOString();
  }
  
  return formatted;
}

/**
 * Convert multiple Firestore documents to API response format
 * @param {Array} docs - Array of Firestore document instances
 * @returns {Array} Array of formatted document objects
 */
function formatDocs(docs) {
  if (!Array.isArray(docs)) return [];
  return docs.map(formatDoc).filter(Boolean);
}

/**
 * Update timestamps on document update
 * @param {Object} data - Data object to update
 * @returns {Object} Data with updated timestamp
 */
function updateTimestamp(data) {
  return {
    ...data,
    updatedAt: Date.now()
  };
}

/**
 * Fetch related documents (manual populate for arrays)
 * @param {Array} ids - Array of document IDs
 * @param {string} modelName - Name of the model to fetch from
 * @returns {Promise<Array>} Array of populated documents
 */
async function fetchRelated(ids, modelName) {
  if (!Array.isArray(ids) || ids.length === 0) return [];
  
  const Model = models[modelName];
  if (!Model) {
    console.warn(`Model ${modelName} not found`);
    return [];
  }
  
  try {
    const docs = await Promise.all(
      ids.map(id => Model.findOne({ id }))
    );
    return docs.filter(Boolean);
  } catch (error) {
    console.error(`Error fetching related ${modelName}:`, error.message);
    return [];
  }
}

/**
 * Convert MongoDB-style query to Firestore query
 * @param {Object} mongoQuery - MongoDB-style query object
 * @returns {Object} Firestore-compatible query object
 */
function convertQuery(mongoQuery) {
  const firestoreQuery = { where: {} };
  
  for (const [key, value] of Object.entries(mongoQuery)) {
    if (key === '_id') {
      firestoreQuery.id = value;
    } else if (typeof value === 'object' && value !== null) {
      // Handle operators like $in, $ne, etc.
      if (value.$in) {
        firestoreQuery.where[key] = { 'in': value.$in };
      } else if (value.$ne) {
        firestoreQuery.where[key] = { '!=': value.$ne };
      } else if (value.$gt) {
        firestoreQuery.where[key] = { '>': value.$gt };
      } else if (value.$gte) {
        firestoreQuery.where[key] = { '>=': value.$gte };
      } else if (value.$lt) {
        firestoreQuery.where[key] = { '<': value.$lt };
      } else if (value.$lte) {
        firestoreQuery.where[key] = { '<=': value.$lte };
      } else {
        firestoreQuery.where[key] = value;
      }
    } else {
      firestoreQuery.where[key] = value;
    }
  }
  
  return firestoreQuery;
}

module.exports = {
  populateField,
  populateMany,
  formatDoc,
  formatDocs,
  updateTimestamp,
  fetchRelated,
  convertQuery
};
