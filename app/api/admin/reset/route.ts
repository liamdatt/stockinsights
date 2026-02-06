import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { minioClient, BUCKET_NAME } from '@/lib/minio'

export async function DELETE() {
    try {
        console.log('Starting data reset...')

        // 1. Delete all data from Database
        // Deleting stocks will cascade delete priceDict due to relation
        const deleteStocks = await prisma.stock.deleteMany({})
        console.log(`Deleted ${deleteStocks.count} stocks from database.`)

        // 2. Delete all files from MinIO
        const objectsList: string[] = []
        const stream = minioClient.listObjects(BUCKET_NAME, '', true)

        await new Promise<void>((resolve, reject) => {
            stream.on('data', (obj) => {
                if (obj.name) {
                    objectsList.push(obj.name)
                }
            })
            stream.on('end', () => resolve())
            stream.on('error', (err) => reject(err))
        })

        if (objectsList.length > 0) {
            await minioClient.removeObjects(BUCKET_NAME, objectsList)
            console.log(`Deleted ${objectsList.length} objects from MinIO bucket ${BUCKET_NAME}.`)
        } else {
            console.log(`No objects found in MinIO bucket ${BUCKET_NAME}.`)
        }

        return NextResponse.json({
            message: 'All data reset successfully',
            deletedStocks: deleteStocks.count,
            deletedFiles: objectsList.length
        })

    } catch (error) {
        console.error('Error resetting data:', error)
        return NextResponse.json(
            { error: 'Failed to reset data' },
            { status: 500 }
        )
    }
}
