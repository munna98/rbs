/*
  Warnings:

  - The values [OTHER] on the enum `PaymentMethod` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[code]` on the table `menu_items` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[order_number]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `menu_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order_number` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('DINE_IN', 'TAKEAWAY', 'DELIVERY');

-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'READY';

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentMethod_new" AS ENUM ('CASH', 'CARD', 'UPI', 'SPLIT');
ALTER TABLE "payments" ALTER COLUMN "method" TYPE "PaymentMethod_new" USING ("method"::text::"PaymentMethod_new");
ALTER TYPE "PaymentMethod" RENAME TO "PaymentMethod_old";
ALTER TYPE "PaymentMethod_new" RENAME TO "PaymentMethod";
DROP TYPE "public"."PaymentMethod_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."order_items" DROP CONSTRAINT "order_items_order_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."payments" DROP CONSTRAINT "payments_order_id_fkey";

-- AlterTable
ALTER TABLE "menu_items" ADD COLUMN     "code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "customer_address" TEXT,
ADD COLUMN     "customer_name" TEXT,
ADD COLUMN     "customer_phone" TEXT,
ADD COLUMN     "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "order_number" TEXT NOT NULL,
ADD COLUMN     "order_type" "OrderType" NOT NULL DEFAULT 'DINE_IN',
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "menu_items_code_key" ON "menu_items"("code");

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_number_key" ON "orders"("order_number");

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
