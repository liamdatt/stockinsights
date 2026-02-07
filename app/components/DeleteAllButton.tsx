'use client'

import { useState } from 'react'

export default function DeleteAllButton({ onDeleted }: { onDeleted?: () => void }) {
    const [loading, setLoading] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const handleDelete = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/reports', { method: 'DELETE' })
            const data = await res.json()
            if (data.success) {
                alert(`Deleted ${data.deleted} report(s)`)
                onDeleted?.()
                window.location.reload()
            } else {
                alert('Failed to delete reports')
            }
        } catch (err) {
            alert('Error deleting reports')
        } finally {
            setLoading(false)
            setShowConfirm(false)
        }
    }

    if (showConfirm) {
        return (
            <div className="flex gap-2 items-center">
                <span className="text-sm text-red-600">Delete all reports?</span>
                <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
                >
                    {loading ? 'Deleting...' : 'Yes, Delete'}
                </button>
                <button
                    onClick={() => setShowConfirm(false)}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                >
                    Cancel
                </button>
            </div>
        )
    }

    return (
        <button
            onClick={() => setShowConfirm(true)}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition"
        >
            Delete All Reports
        </button>
    )
}
