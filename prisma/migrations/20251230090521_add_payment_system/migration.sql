-- CreateTable
CREATE TABLE "StripeAccount" (
    "stripe_account_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "stripe_account_code" TEXT NOT NULL,
    "account_status" TEXT NOT NULL DEFAULT 'pending',
    "charges_enabled" BOOLEAN NOT NULL DEFAULT false,
    "payouts_enabled" BOOLEAN NOT NULL DEFAULT false,
    "onboarding_complete" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StripeAccount_pkey" PRIMARY KEY ("stripe_account_id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "payment_id" SERIAL NOT NULL,
    "application_id" INTEGER NOT NULL,
    "client_id" INTEGER NOT NULL,
    "freelancer_id" INTEGER NOT NULL,
    "freelancer_stripe_id" INTEGER,
    "amount" DOUBLE PRECISION NOT NULL,
    "platform_fee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "freelancer_amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "stripe_payment_intent_id" TEXT,
    "stripe_charge_id" TEXT,
    "stripe_transfer_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paid_at" TIMESTAMP(3),
    "released_at" TIMESTAMP(3),
    "refunded_at" TIMESTAMP(3),
    "description" TEXT,
    "failure_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE "PaymentTransaction" (
    "transaction_id" SERIAL NOT NULL,
    "payment_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "stripe_event_id" TEXT,
    "amount" DOUBLE PRECISION,
    "status" TEXT NOT NULL,
    "metadata" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentTransaction_pkey" PRIMARY KEY ("transaction_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StripeAccount_user_id_key" ON "StripeAccount"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "StripeAccount_stripe_account_code_key" ON "StripeAccount"("stripe_account_code");

-- CreateIndex
CREATE INDEX "StripeAccount_user_id_idx" ON "StripeAccount"("user_id");

-- CreateIndex
CREATE INDEX "StripeAccount_stripe_account_code_idx" ON "StripeAccount"("stripe_account_code");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_application_id_key" ON "Payment"("application_id");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_stripe_payment_intent_id_key" ON "Payment"("stripe_payment_intent_id");

-- CreateIndex
CREATE INDEX "Payment_application_id_idx" ON "Payment"("application_id");

-- CreateIndex
CREATE INDEX "Payment_client_id_idx" ON "Payment"("client_id");

-- CreateIndex
CREATE INDEX "Payment_freelancer_id_idx" ON "Payment"("freelancer_id");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_stripe_payment_intent_id_idx" ON "Payment"("stripe_payment_intent_id");

-- CreateIndex
CREATE INDEX "PaymentTransaction_payment_id_idx" ON "PaymentTransaction"("payment_id");

-- CreateIndex
CREATE INDEX "PaymentTransaction_stripe_event_id_idx" ON "PaymentTransaction"("stripe_event_id");

-- AddForeignKey
ALTER TABLE "StripeAccount" ADD CONSTRAINT "StripeAccount_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "Application"("application_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_freelancer_id_fkey" FOREIGN KEY ("freelancer_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_freelancer_stripe_id_fkey" FOREIGN KEY ("freelancer_stripe_id") REFERENCES "StripeAccount"("stripe_account_id") ON DELETE SET NULL ON UPDATE CASCADE;
