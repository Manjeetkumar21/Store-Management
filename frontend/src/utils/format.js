// Format product dimensions for display
export const formatDimensions = (dimensions) => {
  if (!dimensions) return null;
  
  const { length, width, height } = dimensions;
  const parts = [];
  
  if (length) parts.push(`${length}`);
  if (width) parts.push(`${width}`);
  if (height) parts.push(`${height}`);
  
  if (parts.length === 0) return null;
  
  // Format based on how many dimensions are provided
  if (parts.length === 3) {
    return `${parts[0]} × ${parts[1]} × ${parts[2]} cm (L × W × H)`;
  } else if (parts.length === 2) {
    return `${parts[0]} × ${parts[1]} cm`;
  } else {
    return `${parts[0]} cm`;
  }
};
