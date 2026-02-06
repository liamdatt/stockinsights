import puppeteer from 'puppeteer'
import { minioClient, BUCKET_NAME, ensureBucket } from './minio'

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
    // 1. Launch browser
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    const page = await browser.newPage()

    // 2. Navigate to the internal report page
    // Assuming the app is running locally on 3000
    const reportUrl = `http://localhost:3000/reports/${date}`
    // NOTE: In production, this URL needs to be reachable by the container or service

    await page.goto(reportUrl, { waitUntil: 'networkidle0' })

    // 3. Generate PDF
    const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
    })

    await browser.close()

    // 4. Upload to MinIO
    await ensureBucket()

    const objectName = getReportObjectName(date)

    await minioClient.putObject(BUCKET_NAME, objectName, Buffer.from(pdfBuffer)) // minio expects Buffer or Stream

    // 5. Generate Presigned URL for access
    const url = await getReportPresignedUrl(date)

    return url
}
