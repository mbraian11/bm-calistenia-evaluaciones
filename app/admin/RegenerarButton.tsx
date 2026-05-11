'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegenerarButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRegenerar = async () => {
    setLoading(true)
    // Resetear a pendiente para que el chequeo de idempotencia lo permita
    await fetch('/api/reset-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).catch(() => {})
    router.push(`/procesando?id=${id}`)
  }

  return (
    <button
      onClick={handleRegenerar}
      disabled={loading}
      className="text-xs text-yellow-400 hover:text-yellow-300 disabled:opacity-50 transition-colors"
    >
      {loading ? 'Iniciando...' : '↺ Regenerar'}
    </button>
  )
}
