import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatDateKey, toDateKey } from '@/lib/date'
import ReportGenerator from './components/ReportGenerator'
import GenerateButton from './generate-button'

export const revalidate = 60 // Revalidate every minute

export default async function Dashboard() {
  // Find distinct dates that have data
  // Prisma doesn't support distinct on date nicely with standard findMany unless using groupBy
    const grouped = await prisma.priceData.groupBy({
        by: ['date'],
        orderBy: {
            date: 'desc'
        },
        take: 10
    })

    const recentDates = Array.from(new Set(grouped.map((item) => toDateKey(item.date))))

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="bg-indigo-600 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">FloPro Equity Insights</h1>
          <p className="text-indigo-100 text-sm mt-1">Automated Market Reporting System</p>
        </div>

        <div className="p-6">
          <ReportGenerator initialDates={recentDates} />
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Daily Reports</h2>

          {recentDates.length === 0 ? (
            <p className="text-gray-500 italic">No reports available properly.</p>
          ) : (
            <div className="grid gap-4">
              {recentDates.map((dateStr) => {
                return (
                  <div key={dateStr} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition flex justify-between items-center group">
                    <div>
                      <p className="font-medium text-gray-900">{formatDateKey(dateStr, 'EEEE, MMMM do, yyyy')}</p>
                      <p className="text-sm text-gray-500">Date: {dateStr}</p>
                    </div>
                    <div className="flex gap-3">
                      <Link
                        href={`/reports/${dateStr}`}
                        className="px-4 py-2 bg-white text-indigo-600 border border-indigo-200 rounded text-sm font-medium hover:bg-indigo-50"
                      >
                        View Web Report
                      </Link>
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
