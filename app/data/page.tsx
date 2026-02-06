import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { toDateKey } from '@/lib/date'

// Force dynamic behavior since we use searchParams
export const dynamic = 'force-dynamic'

interface Props {
    searchParams: Promise<{
        ticker?: string
        sort?: string
        order?: string
    }>
}

export default async function DataPage(props: Props) {
    const searchParams = await props.searchParams
    const ticker = searchParams.ticker || ''
    const sort = searchParams.sort || 'date'
    const order = searchParams.order === 'asc' ? 'asc' : 'desc'

    const data = await prisma.priceData.findMany({
        where: {
            ticker: {
                contains: ticker,
                mode: 'insensitive' // case-insensitive search
            }
        },
        orderBy: {
            [sort]: order
        },
        take: 100 // limit to 100 for performance
    })

    // Helper to generate sort link
    const sortLink = (key: string) => {
        const isActive = sort === key
        const nextOrder = isActive && order === 'desc' ? 'asc' : 'desc'
        return `?ticker=${ticker}&sort=${key}&order=${nextOrder}`
    }

    return (
        <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Stock Data Explorer</h1>

                {/* Filter Form */}
                <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <form className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label htmlFor="ticker" className="block text-sm font-medium text-gray-700">Filter by Ticker</label>
                            <input
                                type="text"
                                name="ticker"
                                defaultValue={ticker}
                                placeholder="e.g. 138SL"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            />
                        </div>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Search</button>
                        <Link href="/data" className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">Clear</Link>
                    </form>
                </div>

                {/* Data Table */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <SortHeader label="Ticker" sortKey="ticker" currentSort={sort} currentOrder={order} sortLink={sortLink} />
                                <SortHeader label="Date" sortKey="date" currentSort={sort} currentOrder={order} sortLink={sortLink} />
                                <SortHeader label="Close ($)" sortKey="closingPrice" currentSort={sort} currentOrder={order} sortLink={sortLink} />
                                <SortHeader label="Volume" sortKey="volume" currentSort={sort} currentOrder={order} sortLink={sortLink} />
                                <SortHeader label="1D %" sortKey="change1DayPct" currentSort={sort} currentOrder={order} sortLink={sortLink} />
                                <SortHeader label="30D %" sortKey="change30DayPct" currentSort={sort} currentOrder={order} sortLink={sortLink} />
                                <SortHeader label="Rel Vol" sortKey="relativeVolume" currentSort={sort} currentOrder={order} sortLink={sortLink} />
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.map((row) => (
                                <tr key={row.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.ticker}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{toDateKey(row.date)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 right-align">${row.closingPrice.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 right-align">{row.volume.toLocaleString()}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold right-align ${getColor(row.change1DayPct)}`}>
                                        {(row.change1DayPct || 0).toFixed(2)}%
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold right-align ${getColor(row.change30DayPct)}`}>
                                        {(row.change30DayPct || 0).toFixed(2)}%
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-bold right-align">
                                        {(row.relativeVolume || 0).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                            {data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">No data found matching your query.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

type SortHeaderProps = {
    label: string
    sortKey: string
    sortLink: (key: string) => string
    currentSort: string
    currentOrder: 'asc' | 'desc'
}

function SortHeader({ label, sortKey, sortLink, currentSort, currentOrder }: SortHeaderProps) {
    const isSorted = currentSort === sortKey
    const arrow = isSorted ? (currentOrder === 'asc' ? '↑' : '↓') : ''
    return (
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
            <Link href={sortLink(sortKey)} className="flex items-center gap-1 group w-full h-full">
                {label} <span className="text-gray-400 group-hover:text-gray-600">{arrow}</span>
            </Link>
        </th>
    )
}

function getColor(val: number | null) {
    if (!val) return 'text-gray-600'
    if (val > 0) return 'text-green-600'
    if (val < 0) return 'text-red-600'
    return 'text-gray-600'
}
