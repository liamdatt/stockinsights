'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ResetDataButton() {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleReset = async () => {
        if (!confirm('Are you SURE you want to delete ALL data? This includes all stock history and generated reports. This action cannot be undone.')) {
            return
        }

        setIsLoading(true)
        try {
            const response = await fetch('/api/admin/reset', {
                method: 'DELETE',
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to reset data')
            }

            alert('All data has been reset successfully.')
            router.refresh()
            // Optionally redirect to home if on a data page
            router.push('/')

        } catch (error) {
            console.error('Reset error:', error)
            alert('Error resetting data. Check console for details.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <button
            onClick={handleReset}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
            {isLoading ? 'Resetting...' : 'Reset Data'}
        </button>
    )
}
