/*
|--------------------------------------------------------------------------
| GENERATE UNIQUE BARCODE
|--------------------------------------------------------------------------
*/

const generateBarcode = (count) => {
  const currentYear =
    new Date().getFullYear();

  const serial = String(
    count + 1
  ).padStart(6, "0");

  return `IMG-${currentYear}-${serial}`;
};

module.exports =
  generateBarcode;