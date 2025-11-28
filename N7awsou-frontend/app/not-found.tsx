import { Link } from '@/i18n/navigation';;

// This page renders when a route doesn't match any known routes
export default function GlobalNotFound() {
    return (
        <html>
            <body>
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="max-w-md w-full space-y-8 text-center">
                        <div>
                            <h1 className="text-6xl font-bold text-gray-900">404</h1>
                            <h2 className="mt-4 text-3xl font-bold text-gray-900">
                                Page not found
                            </h2>
                            <p className="mt-2 text-sm text-gray-600">
                                Sorry, we couldn't find the page you're looking for.
                            </p>
                        </div>
                        <div>
                            <Link
                                href="/en"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#FEAC19] hover:bg-[#e69516] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FEAC19]"
                            >
                                Go back home
                            </Link>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}
