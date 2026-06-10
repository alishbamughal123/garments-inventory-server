const sanitizeToken = (
  value = ""
) =>
  String(value)
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9/ -]/g, "");

const normalizeSpaces = (
  value = ""
) =>
  String(value)
    .trim()
    .replace(/\s+/g, " ");

const generateColorCode = (
  color = ""
) => {
  const normalized =
    sanitizeToken(color).replace(
      /\//g,
      " "
    );

  if (!normalized) {
    return "";
  }

  const words = normalized
    .split(/[\s-]+/)
    .filter(Boolean);

  if (words.length === 1) {
    return words[0]
      .slice(0, 3)
      .toUpperCase();
  }

  return words
    .map((word) => word[0])
    .join("")
    .slice(0, 4);
};

const generateSizeCode = (
  size = ""
) =>
  sanitizeToken(size)
    .replace(/\s+/g, "")
    .slice(0, 5);

const buildStyleNumber = ({
  baseStyleNumber,
  size,
  colorCode,
}) => {
  const base =
    sanitizeToken(baseStyleNumber);
  const sizeCode =
    generateSizeCode(size);
  const finalColorCode =
    sanitizeToken(colorCode).replace(
      /\s+/g,
      ""
    );

  return [
    base,
    sizeCode || null,
    finalColorCode || null,
  ]
    .filter(Boolean)
    .join("-");
};

const buildDisplayName = ({
  productName,
  styleName,
  itemName,
}) => {
  if (
    productName &&
    productName.trim()
  ) {
    return normalizeSpaces(
      productName
    );
  }

  return normalizeSpaces(
    [styleName, itemName]
      .filter(Boolean)
      .join(" ")
  );
};

const normalizeProductPayload = (
  payload
) => {
  const colorCode =
    sanitizeToken(
      payload.colorCode ||
        generateColorCode(
          payload.color
        )
    ).replace(/\s+/g, "");

  const sizeCode =
    generateSizeCode(
      payload.size
    );

  const styleNumber =
    payload.styleNumber?.trim()
      ? sanitizeToken(
          payload.styleNumber
        ).replace(/\s+/g, "")
      : buildStyleNumber({
          baseStyleNumber:
            payload.baseStyleNumber,
          size: sizeCode,
          colorCode,
        });

  return {
    ...payload,
    productName:
      buildDisplayName(payload),
    baseStyleNumber:
      normalizeSpaces(
        payload.baseStyleNumber
      ) || null,
    styleNumber:
      styleNumber || null,
    styleName:
      normalizeSpaces(
        payload.styleName
      ) || null,
    itemName:
      normalizeSpaces(
        payload.itemName
      ) || null,
    color:
      normalizeSpaces(
        payload.color
      ) || "",
    colorCode:
      colorCode || null,
    size:
      normalizeSpaces(
        payload.size
      ) || null,
    fabric:
      normalizeSpaces(
        payload.fabric
      ) || null,
    fabricComposition:
      normalizeSpaces(
        payload.fabricComposition
      ) || null,
    fabricWeight:
      normalizeSpaces(
        payload.fabricWeight
      ) || null,
  };
};

module.exports = {
  buildStyleNumber,
  generateColorCode,
  generateSizeCode,
  normalizeProductPayload,
};
