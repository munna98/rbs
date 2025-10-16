-- CreateTable
CREATE TABLE "restaurant_settings" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'My Restaurant',
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "tax_rate" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "gst_number" TEXT,

    CONSTRAINT "restaurant_settings_pkey" PRIMARY KEY ("id")
);
