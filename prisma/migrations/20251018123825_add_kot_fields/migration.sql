/*
  Warnings:

  - A unique constraint covering the columns `[kot_number]` on the table `orders` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "kot_number" TEXT,
ADD COLUMN     "kot_printed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "kot_printed_at" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "orders_kot_number_key" ON "orders"("kot_number");
