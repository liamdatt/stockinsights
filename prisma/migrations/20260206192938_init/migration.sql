-- CreateTable
CREATE TABLE "stocks" (
    "ticker" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stocks_pkey" PRIMARY KEY ("ticker")
);

-- CreateTable
CREATE TABLE "price_data" (
    "id" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "volume" DOUBLE PRECISION NOT NULL,
    "lastTradedPrice" DOUBLE PRECISION NOT NULL,
    "closingPrice" DOUBLE PRECISION NOT NULL,
    "priceChange" DOUBLE PRECISION NOT NULL,
    "closingBid" DOUBLE PRECISION NOT NULL,
    "closingAsk" DOUBLE PRECISION NOT NULL,
    "change1DayPct" DOUBLE PRECISION,
    "change30DayPct" DOUBLE PRECISION,
    "relativeVolume" DOUBLE PRECISION,

    CONSTRAINT "price_data_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "price_data_date_idx" ON "price_data"("date");

-- CreateIndex
CREATE UNIQUE INDEX "price_data_ticker_date_key" ON "price_data"("ticker", "date");

-- AddForeignKey
ALTER TABLE "price_data" ADD CONSTRAINT "price_data_ticker_fkey" FOREIGN KEY ("ticker") REFERENCES "stocks"("ticker") ON DELETE CASCADE ON UPDATE CASCADE;
