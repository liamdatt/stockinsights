'use client'

import { useEffect, useState } from 'react'
import { formatDateKey } from '@/lib/date'

type DatesResponse = {
    success: boolean
    dates?: string[]
}

type ReportResponse = {
    success: boolean
    url?: string
    error?: {
        code?: string
        message?: string
    }
}

export default function ReportGenerator({ initialDates }: { initialDates: string[] }) {
    const [dates, setDates] = useState<string[]>(initialDates)
    const [selectedDate, setSelectedDate] = useState(initialDates[0] ?? '')
    const [isLoadingDates, setIsLoadingDates] = useState(initialDates.length === 0)
    const [isGenerating, setIsGenerating] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
        let cancelled = false

        async function loadDates() {
            setIsLoadingDates(true)
            try {
                const response = await fetch('/api/reports/dates')
                const data: DatesResponse = await response.json()

                if (!response.ok || !data.success || !Array.isArray(data.dates)) {
                    throw new Error('Failed to load dates')
                }

                const loadedDates = data.dates

                if (!cancelled) {
                    setDates(loadedDates)
                    setSelectedDate((current) => current || loadedDates[0] || '')
                }
            } catch (error) {
                if (!cancelled) {
                    console.error(error)
                    setMessage('Could not load available report dates.')
                }
            } finally {
                if (!cancelled) {
                    setIsLoadingDates(false)
                }
            }
        }

        loadDates()

        return () => {
            cancelled = true
        }
    }, [])

    const handleGenerate = async () => {
        if (!selectedDate) {
            return
        }

        setIsGenerating(true)
        setMessage('')

        try {
            const response = await fetch(`/api/reports/${selectedDate}`, {
                method: 'POST'
            })
            const data: ReportResponse = await response.json()

            if (!response.ok || !data.success || !data.url) {
                const code = data?.error?.code
                if (response.status === 404 && code === 'NO_DATA_FOR_DATE') {
                    setMessage('No market data exists for that date yet.')
                } else {
                    setMessage(data?.error?.message || 'Failed to generate report.')
                }
                return
            }

            window.open(data.url, '_blank')
        } catch (error) {
            console.error(error)
            setMessage('Error generating report.')
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <section className="mb-8 rounded-lg border border-indigo-100 bg-indigo-50 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-indigo-900">Generate Report</h3>
            <p className="mt-1 text-sm text-indigo-700">Select a market date and generate the PDF report.</p>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                    <label htmlFor="report-date" className="mb-1 block text-xs font-medium uppercase tracking-wide text-indigo-900">
                        Date
                    </label>
                    <select
                        id="report-date"
                        value={selectedDate}
                        onChange={(event) => setSelectedDate(event.target.value)}
                        disabled={isLoadingDates || dates.length === 0}
                        className="w-full rounded border border-indigo-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-400 focus:outline-none"
                    >
                        {dates.length === 0 ? (
                            <option value="">No dates available</option>
                        ) : (
                            dates.map((date) => (
                                <option key={date} value={date}>
                                    {formatDateKey(date, 'EEEE, MMMM do, yyyy')}
                                </option>
                            ))
                        )}
                    </select>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={isGenerating || isLoadingDates || !selectedDate}
                    className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isGenerating ? 'Generating...' : 'Generate PDF'}
                </button>
            </div>

            {message && <p className="mt-3 text-sm text-red-600">{message}</p>}
        </section>
    )
}
