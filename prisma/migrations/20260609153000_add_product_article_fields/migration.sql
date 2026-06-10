ALTER TABLE "Product"
ADD COLUMN "baseStyleNumber" TEXT,
ADD COLUMN "styleNumber" TEXT,
ADD COLUMN "styleName" TEXT,
ADD COLUMN "itemName" TEXT,
ADD COLUMN "colorCode" TEXT,
ADD COLUMN "fabricComposition" TEXT,
ADD COLUMN "fabricWeight" TEXT;

ALTER TABLE "Product"
ALTER COLUMN "size" DROP NOT NULL;

CREATE UNIQUE INDEX "Product_styleNumber_key" ON "Product"("styleNumber");
CREATE INDEX "Product_baseStyleNumber_idx" ON "Product"("baseStyleNumber");
CREATE INDEX "Product_styleNumber_idx" ON "Product"("styleNumber");
CREATE INDEX "Product_styleName_idx" ON "Product"("styleName");
