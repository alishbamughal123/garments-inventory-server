const bwipjs = require("bwip-js");

/*
|--------------------------------------------------------------------------
| GENERATE BARCODE IMAGE
|--------------------------------------------------------------------------
*/

const generateBarcodeImage = async (
  barcodeValue
) => {
  try {
    const png = await bwipjs.toBuffer({
      bcid: "code128",
      text: barcodeValue,
      scale: 3,
      height: 10,
      includetext: true,
      textxalign: "center",
    });

    return png;
  } catch (error) {
    throw new Error(
      "Barcode generation failed"
    );
  }
};

module.exports = generateBarcodeImage;