# FloPro Equity Insights

Next.js application for ingesting JSE market data, generating date-based daily reports, and storing PDFs in MinIO.

## Local Development

1. Install Node.js dependencies:
```bash
npm install
```
2. Install Python dependencies:
```bash
python3 -m pip install -r requirements.txt
python3 -m playwright install chromium
```
3. Start infrastructure:
```bash
docker compose up -d
```
4. Run Prisma and app:
```bash
npx prisma generate
npx prisma db push
npm run dev
```

## Core APIs

1. `POST /api/ingest`
- Accepts scraper payload.
- Insert-only for `(ticker, date)` rows.
- Existing rows are skipped (not updated).
- Returns summary:
```json
{
  "success": true,
  "received": 10,
  "inserted": 8,
  "skipped": 2,
  "failed": 0,
  "errors": []
}
```

2. `GET /api/reports/dates`
- Returns available market-data dates:
```json
{
  "success": true,
  "dates": ["2026-02-05", "2026-02-04"]
}
```

3. `POST /api/reports/:date`
- Generates (or regenerates) report PDF for `YYYY-MM-DD`.
- Returns `201` with URL when successful.
- Returns `404` with `NO_DATA_FOR_DATE` when no market data exists.

4. `GET /api/reports/:date`
- Fetches an existing report URL only.
- Returns `404` with:
  - `NO_DATA_FOR_DATE` if market data does not exist.
  - `REPORT_NOT_FOUND` if PDF has not been generated yet.

## Scrapers

1. Full-history scraper (manual backfill):
```bash
python3 pricedata.py
```

2. Daily incremental updater (7-day window):
```bash
python3 scripts/pricedata_update.py
```

### Incremental Scraper Environment Variables

- `INGEST_URL` (default: `http://localhost:3000/api/ingest`)
- `UPDATE_WINDOW_DAYS` (default: `7`)
- `SCRAPE_DELAY_SECONDS` (default: `1.0`)
- `INGEST_MAX_RETRIES` (default: `3`)
- `INGEST_RETRY_BASE_SECONDS` (default: `2`)
- `UPDATE_LOCK_PATH` (default: `/tmp/jse_update.lock`)
- `TZ` (set to `America/Jamaica` in production)

## Coolify Deployment (Recommended Automation Setup)

Run scraper as a separate Coolify service/job from the Next.js app service.

1. Create scraper service image using `Dockerfile.scraper` (Python + Playwright Chromium).
2. Configure env vars:
- `TZ=America/Jamaica`
- `INGEST_URL=http://<next-service-internal-url>/api/ingest`
- `UPDATE_WINDOW_DAYS=7`
3. Schedule command in Coolify:
```bash
python3 scripts/pricedata_update.py
```
4. Schedule time:
- Daily at **6:30 PM Jamaica time**.

## Logs and Operational Checks

Expected scraper logs include:
- ticker count discovered
- payload row count
- ingest HTTP status
- ingest summary JSON (`inserted`, `skipped`, `failed`)

Alert conditions:
- non-2xx ingest status
- repeated lockfile contention (`/tmp/jse_update.lock`)
- persistent `failed > 0` in ingest response
