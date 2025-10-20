-- AlterTable
ALTER TABLE "printer_settings" ADD COLUMN     "kitchen_printer_name" TEXT,
ADD COLUMN     "kot_copies" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "order_workflow_settings" (
    "id" TEXT NOT NULL,
    "orderWorkflowMode" TEXT NOT NULL DEFAULT 'FULL_SERVICE',
    "requirePaymentAtOrder" BOOLEAN NOT NULL DEFAULT false,
    "autoMarkServedWhenPaid" BOOLEAN NOT NULL DEFAULT false,
    "autoPrintKOT" BOOLEAN NOT NULL DEFAULT true,
    "requireKOTPrintConfirmation" BOOLEAN NOT NULL DEFAULT false,
    "kotPrintDelay" INTEGER NOT NULL DEFAULT 0,
    "autoStartPreparing" BOOLEAN NOT NULL DEFAULT false,
    "enableItemWisePreparing" BOOLEAN NOT NULL DEFAULT true,
    "allowPartialPayment" BOOLEAN NOT NULL DEFAULT true,
    "allowSplitPayment" BOOLEAN NOT NULL DEFAULT true,
    "requirePaymentForServed" BOOLEAN NOT NULL DEFAULT false,
    "autoOccupyTableOnOrder" BOOLEAN NOT NULL DEFAULT true,
    "autoFreeTableOnPayment" BOOLEAN NOT NULL DEFAULT true,
    "allowMultipleOrdersPerTable" BOOLEAN NOT NULL DEFAULT false,
    "orderStatusFlow" TEXT NOT NULL DEFAULT 'PENDING_PREPARING_SERVED_COMPLETED',
    "notifyKitchenOnNewOrder" BOOLEAN NOT NULL DEFAULT true,
    "notifyWaiterOnReady" BOOLEAN NOT NULL DEFAULT true,
    "playOrderSound" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_workflow_settings_pkey" PRIMARY KEY ("id")
);
