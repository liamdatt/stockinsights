import { formatDateKey } from '@/lib/date'
import { listAllReports } from '@/lib/pdf'
import ReportGenerator from './components/ReportGenerator'
import GenerateButton from './generate-button'
import DeleteAllButton from './components/DeleteAllButton'
import { prisma } from '@/lib/prisma'
import { toDateKey } from '@/lib/date'

export const revalidate = 60 // Revalidate every minute

export default async function Dashboard() {
  // Fetch available dates with price data (for the report generator dropdown)
  const grouped = await prisma.priceData.groupBy({
    by: ['date'],
    orderBy: { date: 'desc' },
    take: 30
  })
  const availableDates = Array.from(new Set(grouped.map((item) => toDateKey(item.date))))

  // Fetch reports that have been generated (from MinIO)
  const generatedReports = await listAllReports()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="bg-indigo-600 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">FloPro Equity Insights</h1>
          <p className="text-indigo-100 text-sm mt-1">Automated Market Reporting System</p>
        </div>

        <div className="p-6">
          {/* Report Generator - for creating new reports */}
          <ReportGenerator initialDates={availableDates} />

          {/* Generated Reports Section */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Generated Reports</h2>
            {generatedReports.length > 0 && <DeleteAllButton />}
          </div>

          {generatedReports.length === 0 ? (
            <p className="text-gray-500 italic">No reports have been generated yet. Use the generator above to create reports.</p>
          ) : (
            <div className="grid gap-4">
              {generatedReports.map((dateStr) => {
                return (
                  <div key={dateStr} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition flex justify-between items-center group">
                    <div>
                      <p className="font-medium text-gray-900">{formatDateKey(dateStr, 'EEEE, MMMM do, yyyy')}</p>
                      <p className="text-sm text-gray-500">Date: {dateStr}</p>
                    </div>
                    <div className="flex gap-3">
                      <GenerateButton date={dateStr} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
