const generateSKU = (
  categoryName,
  color,
  size,
  count
) => {
  const categoryCode = categoryName
    .substring(0, 3)
    .toUpperCase();

  const colorCode = color
    .substring(0, 3)
    .toUpperCase();

  const sizeCode = size.toUpperCase();

  const serial = String(count + 1).padStart(4, "0");

  return `${categoryCode}-${colorCode}-${sizeCode}-${serial}`;
};

module.exports = generateSKU;