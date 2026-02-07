import { NextResponse } from 'next/server'
import { listAllReports, deleteAllReports } from '@/lib/pdf'

// GET: List all generated report dates
export async function GET() {
    try {
        const reports = await listAllReports()
        return NextResponse.json({ success: true, reports })
    } catch (error) {
        console.error('Error listing reports:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to list reports' },
            { status: 500 }
        )
    }
}

// DELETE: Delete all generated reports
export async function DELETE() {
    try {
        const count = await deleteAllReports()
        return NextResponse.json({ success: true, deleted: count })
    } catch (error) {
        console.error('Error deleting reports:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to delete reports' },
            { status: 500 }
        )
    }
}
