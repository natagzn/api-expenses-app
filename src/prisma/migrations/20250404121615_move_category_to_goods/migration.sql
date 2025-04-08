/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Receipt` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Receipt" DROP CONSTRAINT "Receipt_categoryId_fkey";

-- AlterTable
ALTER TABLE "Goods" ADD COLUMN     "categoryId" INTEGER;

-- AlterTable
ALTER TABLE "Receipt" DROP COLUMN "categoryId";

-- AddForeignKey
ALTER TABLE "Goods" ADD CONSTRAINT "Goods_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
