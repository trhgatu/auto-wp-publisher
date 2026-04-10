-- AlterTable
ALTER TABLE "catalog_products" ADD COLUMN     "carModels" TEXT,
ADD COLUMN     "galleryImageUrls" TEXT,
ADD COLUMN     "lazadaLink" TEXT,
ADD COLUMN     "material" TEXT,
ADD COLUMN     "price" TEXT,
ADD COLUMN     "shopeeLink" TEXT,
ADD COLUMN     "sku" TEXT,
ADD COLUMN     "tiktokLink" TEXT,
ADD COLUMN     "videoUrl" TEXT;

-- CreateTable
CREATE TABLE "system_api_logs" (
    "id" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "requestHeader" TEXT,
    "requestBody" TEXT,
    "responseBody" TEXT,
    "statusCode" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_api_logs_pkey" PRIMARY KEY ("id")
);
