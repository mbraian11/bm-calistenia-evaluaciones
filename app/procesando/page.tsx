'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const MESSAGES = [
  'Analizando tu composición corporal...',
  'Evaluando tus pruebas físicas...',
  'Procesando datos de nutrición y estilo de vida...',
  'Identificando áreas de mejora...',
  'Generando recomendaciones personalizadas...',
  'Construyendo tu reporte completo...',
  'Últimos ajustes al análisis...',
]

function ProcesandoContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const [messageIndex, setMessageIndex] = useState(0)
  const [dots, setDots] = useState('')
  const [progress, setProgress] = useState(0)
  const [timedOut, setTimedOut] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [retrying, setRetrying] = useState(false)

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMessageIndex(i => (i + 1) % MESSAGES.length)
    }, 3500)
    return () => clearInterval(msgInterval)
  }, [])

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.')
    }, 500)
    return () => clearInterval(dotsInterval)
  }, [])

  useEffect(() => {
    if (!id) return

    let attempts = 0
    const maxAttempts = 80

    // Disparar generación inmediatamente al cargar la página
    fetch(`/api/generate-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).catch(() => {})

    const poll = async () => {
      attempts++
      setProgress(Math.min((attempts / maxAttempts) * 95, 95))

      try {
        const res = await fetch(`/api/generate-report?id=${id}`)
        const data = await res.json()

        if (data.estado === 'completado') {
          setProgress(100)
          setTimeout(() => router.push(`/reporte/${id}`), 800)
        } else if (data.estado === 'error') {
          setHasError(true)
        } else {
          if (attempts < maxAttempts) {
            setTimeout(poll, 3000)
          } else {
            setTimedOut(true)
          }
        }
      } catch {
        if (attempts < maxAttempts) {
          setTimeout(poll, 3000)
        } else {
          setTimedOut(true)
        }
      }
    }

    const timeout = setTimeout(poll, 2000)
    return () => clearTimeout(timeout)
  }, [id, router])

  const handleRetry = async () => {
    setRetrying(true)
    setHasError(false)
    setTimedOut(false)
    setProgress(0)

    // Resetear estado en DB
    await fetch('/api/reset-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).catch(() => {})

    // Redirigir de nuevo a procesando para reiniciar el flujo limpio
    router.push(`/procesando?id=${id}`)
  }

  if (hasError || timedOut) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(185,28,28,0.05)_0%,_transparent_70%)] pointer-events-none" />
        <div className="relative text-center max-w-md">
          <div className="w-14 h-14 bg-red-950/60 border border-red-800/40 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-6 h-6 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold mb-3">
            {timedOut ? 'Ha tardado más de lo esperado' : 'Ocurrió un error'}
          </h1>
          <p className="text-white/50 text-sm mb-8 leading-relaxed">
            {timedOut
              ? 'El servidor está tardando más de lo normal. Puede que el reporte esté procesando en segundo plano.'
              : 'Hubo un problema al generar tu reporte. Puedes volver a intentarlo.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="px-6 py-2.5 bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-medium rounded-sm transition-colors"
            >
              {retrying ? 'Iniciando...' : '↺ Volver a intentar'}
            </button>
            <a
              href={`/reporte/${id}`}
              className="px-6 py-2.5 border border-white/10 text-white/60 hover:text-white hover:border-white/20 text-sm font-medium rounded-sm transition-colors"
            >
              Ver reporte (si existe)
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      {/* Fondo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(185,28,28,0.08)_0%,_transparent_70%)] pointer-events-none" />

      <div className="relative text-center max-w-lg">
        {/* Icono animado */}
        <div className="relative mx-auto mb-10 w-24 h-24">
          <div className="absolute inset-0 rounded-full border border-red-800/30 animate-ping" style={{ animationDuration: '2s' }} />
          <div className="absolute inset-2 rounded-full border border-red-700/40 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.3s' }} />
          <div className="absolute inset-4 rounded-full border border-red-600/50 animate-ping" style={{ animationDuration: '3s', animationDelay: '0.6s' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-red-900/40 border border-red-700/60 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-400 animate-spin" style={{ animationDuration: '3s' }} viewBox="0 0 24 24" fill="none">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 bg-red-950/30 border border-red-800/20 rounded-full px-4 py-1.5 text-xs text-red-400 uppercase tracking-widest mb-6">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
          Inteligencia artificial activa
        </div>

        <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
          Generando tu reporte
        </h1>

        {/* Mensaje dinámico */}
        <div className="h-8 mb-8">
          <p className="text-white/50 text-base transition-all duration-500">
            {MESSAGES[messageIndex]}{dots}
          </p>
        </div>

        {/* Barra de progreso */}
        <div className="w-full bg-white/5 rounded-full h-1 mb-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-700 to-red-500 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-white/20">{Math.round(progress)}%</p>

        <div className="mt-12 p-5 bg-white/[0.02] border border-white/5 rounded-sm text-left">
          <p className="text-xs text-white/30 uppercase tracking-widest mb-3">Claude está analizando</p>
          <div className="space-y-2">
            {[
              'Composición corporal (InBody)',
              'Rendimiento en pruebas físicas',
              'Nutrición y hábitos de vida',
              'Salud y factores de riesgo',
              'Objetivos y contexto personal',
            ].map((item, i) => (
              <div key={item} className="flex items-center gap-2 text-sm text-white/40">
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: progress > (i + 1) * 18 ? '#B91C1C' : '#ffffff20',
                    transition: 'background-color 0.5s ease',
                  }}
                />
                {item}
              </div>
            ))}
          </div>
        </div>

        <p className="mt-6 text-xs text-white/20">
          Este proceso toma aproximadamente 1-2 minutos. No cierres esta ventana.
        </p>
      </div>
    </div>
  )
}

export default function ProcesandoPage() {
  return (
    <Suspense>
      <ProcesandoContent />
    </Suspense>
  )
}
