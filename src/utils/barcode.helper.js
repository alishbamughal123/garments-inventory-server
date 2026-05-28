const bwipjs = require("bwip-js");

/*
|--------------------------------------------------------------------------
| GENERATE BARCODE IMAGE
|--------------------------------------------------------------------------
*/

const generateBarcodeImage =
  async (barcodeValue) => {
    try {
      const pngBuffer =
        await bwipjs.toBuffer({
          bcid: "code128",

          text: barcodeValue,

          scale: 3,

          height: 10,

          includetext: true,

          textxalign: "center",
        });

      return pngBuffer;
    } catch (error) {
      throw new Error(
        "Failed to generate barcode image"
      );
    }
  };

module.exports =
  generateBarcodeImage;