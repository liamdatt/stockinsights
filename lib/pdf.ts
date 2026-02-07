import { renderToBuffer } from '@react-pdf/renderer'
import { minioClient, BUCKET_NAME, ensureBucket } from './minio'
import { getReportData } from './report-data'
import { getDateRangeForDateKey, formatDateKey } from './date'
import { MarketPulseDocument } from '@/app/reports/components/MarketPulseDocument'

const REPORT_URL_EXPIRY_SECONDS = 24 * 60 * 60

function isObjectMissingError(error: unknown): boolean {
    if (!error || typeof error !== 'object') {
        return false
    }

    const maybeError = error as { code?: string; name?: string; message?: string }
    return (
        maybeError.code === 'NoSuchKey' ||
        maybeError.code === 'NotFound' ||
        maybeError.code === 'NoSuchObject' ||
        maybeError.name === 'NotFound'
    )
}

export function getReportObjectName(date: string): string {
    return `report_${date}.pdf`
}

export async function reportExists(date: string): Promise<boolean> {
    await ensureBucket()

    try {
        await minioClient.statObject(BUCKET_NAME, getReportObjectName(date))
        return true
    } catch (error) {
        if (isObjectMissingError(error)) {
            return false
        }

        throw error
    }
}

export async function getReportPresignedUrl(date: string): Promise<string> {
    await ensureBucket()
    return minioClient.presignedGetObject(
        BUCKET_NAME,
        getReportObjectName(date),
        REPORT_URL_EXPIRY_SECONDS
    )
}

export async function generateReportPDF(date: string) {
    // 1. Get date range
    const dateRange = getDateRangeForDateKey(date)
    if (!dateRange) {
        throw new Error(`Invalid date format: ${date}`)
    }

    // 2. Fetch and compute all report data
    const formattedDate = formatDateKey(date, 'MMMM do, yyyy')
    const reportData = await getReportData(dateRange.start, dateRange.end, formattedDate)

    if (!reportData) {
        throw new Error(`No data found for date: ${date}`)
    }

    // 3. Render PDF using react-pdf
    const pdfBuffer = await renderToBuffer(
        MarketPulseDocument({ data: reportData })
    )

    // 4. Upload to MinIO
    await ensureBucket()

    const objectName = getReportObjectName(date)
    await minioClient.putObject(BUCKET_NAME, objectName, Buffer.from(pdfBuffer))

    // 5. Generate Presigned URL for access
    const url = await getReportPresignedUrl(date)

    return url
}

// List all generated report dates from MinIO
export async function listAllReports(): Promise<string[]> {
    await ensureBucket()

    const objects: string[] = []
    const stream = minioClient.listObjects(BUCKET_NAME, 'report_', true)

    return new Promise((resolve, reject) => {
        stream.on('data', (obj) => {
            // Extract date from filename like "report_2026-01-16.pdf"
            const match = obj.name?.match(/report_(\d{4}-\d{2}-\d{2})\.pdf/)
            if (match) {
                objects.push(match[1])
            }
        })
        stream.on('error', reject)
        stream.on('end', () => resolve(objects.sort().reverse()))
    })
}

// Delete all reports from MinIO
export async function deleteAllReports(): Promise<number> {
    await ensureBucket()

    const objects: string[] = []
    const stream = minioClient.listObjects(BUCKET_NAME, 'report_', true)

    return new Promise((resolve, reject) => {
        stream.on('data', (obj) => {
            if (obj.name) objects.push(obj.name)
        })
        stream.on('error', reject)
        stream.on('end', async () => {
            if (objects.length === 0) {
                resolve(0)
                return
            }
            try {
                await minioClient.removeObjects(BUCKET_NAME, objects)
                resolve(objects.length)
            } catch (err) {
                reject(err)
            }
        })
    })
}
