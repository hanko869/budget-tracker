export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Budget Tracker Test
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Application is working correctly!
        </p>
        <div className="space-x-4">
          <a href="/" className="btn-primary">
            Go to Dashboard
          </a>
          <a href="/admin" className="btn-secondary">
            Go to Admin
          </a>
        </div>
      </div>
    </div>
  )
} 