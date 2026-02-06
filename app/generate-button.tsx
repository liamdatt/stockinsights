'use client'

import { useState } from 'react'

export default function GenerateButton({ date }: { date: string }) {
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    const handleDownload = async () => {
        setLoading(true)
        setErrorMessage('')
        try {
            const res = await fetch(`/api/reports/${date}`, {
                method: 'POST'
            })
            const data = await res.json()
            if (res.ok && data.success && data.url) {
                window.open(data.url, '_blank')
            } else {
                const code = data?.error?.code
                if (res.status === 404 && code === 'NO_DATA_FOR_DATE') {
                    setErrorMessage('No market data exists for that date yet.')
                } else {
                    setErrorMessage(data?.error?.message || 'Failed to generate report.')
                }
            }
        } catch (e) {
            console.error(e)
            setErrorMessage('Error generating report.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <button
                onClick={handleDownload}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
            >
                {loading ? 'Generating...' : 'Generate PDF'}
            </button>
            {errorMessage && <p className="mt-2 text-xs text-red-600">{errorMessage}</p>}
        </div>
    )
}
