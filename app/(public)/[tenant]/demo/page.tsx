export default function DemoPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          🎉 Middleware Funcionando
        </h1>
        <p className="text-gray-600">
          Tenant detectado correctamente por el middleware.
        </p>
      </div>
    </div>
  )
}
