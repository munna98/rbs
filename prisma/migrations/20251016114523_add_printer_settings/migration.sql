-- CreateTable
CREATE TABLE "printer_settings" (
    "id" TEXT NOT NULL,
    "printer_name" TEXT NOT NULL,
    "paper_width" INTEGER NOT NULL DEFAULT 80,
    "copies" INTEGER NOT NULL DEFAULT 1,
    "enable_sound" BOOLEAN NOT NULL DEFAULT false,
    "auto_open_drawer" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "printer_settings_pkey" PRIMARY KEY ("id")
);
