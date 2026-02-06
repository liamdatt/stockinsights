import Link from 'next/link'
import ResetDataButton from './ResetDataButton'

export default function Navbar() {
    return (
        <nav className="bg-indigo-700 text-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="font-bold text-xl tracking-tight">
                            FloPro Insights
                        </Link>
                        <div className="ml-10 flex items-baseline space-x-4">
                            <Link href="/" className="hover:bg-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                                Reports
                            </Link>
                            <Link href="/data" className="hover:bg-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                                Data
                            </Link>
                            <ResetDataButton />
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    )
}
