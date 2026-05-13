import { createServiceClient } from '@/lib/supabase'
import { Evaluacion } from '@/types/evaluacion'
import Link from 'next/link'
import Image from 'next/image'
import RegenerarButton from './RegenerarButton'

export const dynamic = 'force-dynamic'

const ESTADO_BADGE: Record<string, { color: string; label: string }> = {
  pendiente: { color: 'bg-yellow-900/40 text-yellow-400 border-yellow-800/30', label: 'Pendiente' },
  procesando: { color: 'bg-blue-900/40 text-blue-400 border-blue-800/30', label: 'Procesando' },
  completado: { color: 'bg-green-900/40 text-green-400 border-green-800/30', label: 'Completado' },
  error: { color: 'bg-red-900/40 text-red-400 border-red-800/30', label: 'Error' },
}

async function getEvaluaciones(): Promise<Evaluacion[]> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('evaluaciones')
    .select('id, created_at, nombre, email, estado, objetivo_principal, programa, reporte_generado_at')
    .order('created_at', { ascending: false })
  return data || []
}

export default async function AdminPage() {
  const evaluaciones = await getEvaluaciones()

  const stats = {
    total: evaluaciones.length,
    completados: evaluaciones.filter(e => e.estado === 'completado').length,
    procesando: evaluaciones.filter(e => e.estado === 'procesando').length,
    pendientes: evaluaciones.filter(e => e.estado === 'pendiente').length,
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <nav className="border-b border-white/5 bg-black/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="BM Calistenia" width={40} height={40} className="object-contain" />
            <div>
              <span className="font-semibold text-sm">BM Calistenia</span>
              <span className="text-white/30 text-xs ml-2">Admin</span>
            </div>
          </div>
          <Link href="/" className="text-xs text-white/40 hover:text-white transition-colors">
            ← Portal público
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-display text-3xl font-bold mb-2">Dashboard de alumnos</h1>
          <p className="text-white/40 text-sm">Todas las evaluaciones 360° recibidas</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total evaluaciones', value: stats.total, color: 'text-white' },
            { label: 'Completadas', value: stats.completados, color: 'text-green-400' },
            { label: 'Procesando', value: stats.procesando, color: 'text-blue-400' },
            { label: 'Pendientes', value: stats.pendientes, color: 'text-yellow-400' },
          ].map(s => (
            <div key={s.label} className="bg-white/[0.02] border border-white/5 rounded-sm p-5">
              <p className="text-xs text-white/40 uppercase tracking-wider mb-2">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabla */}
        <div className="bg-white/[0.02] border border-white/5 rounded-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="font-semibold text-sm">Evaluaciones</h2>
            <span className="text-xs text-white/30">{evaluaciones.length} registros</span>
          </div>

          {evaluaciones.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-white/30 text-sm">No hay evaluaciones todavía</p>
              <Link href="/evaluacion" className="text-xs text-red-400 hover:text-red-300 mt-3 block transition-colors">
                Crear primera evaluación →
              </Link>
            </div>
          ) : (
            <>
              {/* Tabla — desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left px-6 py-3 text-xs text-white/30 uppercase tracking-wider font-normal">Alumno</th>
                      <th className="text-left px-6 py-3 text-xs text-white/30 uppercase tracking-wider font-normal">Programa</th>
                      <th className="text-left px-6 py-3 text-xs text-white/30 uppercase tracking-wider font-normal">Objetivo</th>
                      <th className="text-left px-6 py-3 text-xs text-white/30 uppercase tracking-wider font-normal">Estado</th>
                      <th className="text-left px-6 py-3 text-xs text-white/30 uppercase tracking-wider font-normal">Fecha</th>
                      <th className="text-right px-6 py-3 text-xs text-white/30 uppercase tracking-wider font-normal">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evaluaciones.map((e, i) => {
                      const badge = ESTADO_BADGE[e.estado || 'pendiente']
                      return (
                        <tr key={e.id} className={`border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                          <td className="px-6 py-4">
                            <p className="font-medium text-white">{e.nombre}</p>
                            <p className="text-xs text-white/40">{e.email}</p>
                          </td>
                          <td className="px-6 py-4 text-white/60 capitalize">{e.programa?.replace(/_/g, ' ') || '—'}</td>
                          <td className="px-6 py-4 text-white/60 capitalize">{e.objetivo_principal?.replace(/_/g, ' ') || '—'}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs border ${badge.color}`}>{badge.label}</span>
                          </td>
                          <td className="px-6 py-4 text-white/40 text-xs">
                            {new Date(e.created_at || '').toLocaleDateString('es-PA', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {e.estado === 'completado' ? (
                              <Link href={`/reporte/${e.id}`} className="text-xs text-red-400 hover:text-red-300 transition-colors">Ver reporte →</Link>
                            ) : e.estado === 'pendiente' || e.estado === 'error' || e.estado === 'procesando' ? (
                              <RegenerarButton id={e.id!} />
                            ) : null}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Cards — móvil */}
              <div className="md:hidden divide-y divide-white/[0.04]">
                {evaluaciones.map((e) => {
                  const badge = ESTADO_BADGE[e.estado || 'pendiente']
                  return (
                    <div key={e.id} className="px-4 py-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-white text-sm">{e.nombre}</p>
                          <p className="text-xs text-white/40">{e.email}</p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs border shrink-0 ${badge.color}`}>{badge.label}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-white/50">
                        <span className="capitalize">{e.objetivo_principal?.replace(/_/g, ' ') || '—'}</span>
                        <span>·</span>
                        <span>{new Date(e.created_at || '').toLocaleDateString('es-PA', { day: '2-digit', month: 'short' })}</span>
                      </div>
                      <div className="pt-1">
                        {e.estado === 'completado' ? (
                          <Link href={`/reporte/${e.id}`} className="text-xs text-red-400 hover:text-red-300 transition-colors">Ver reporte →</Link>
                        ) : e.estado === 'pendiente' || e.estado === 'error' ? (
                          <RegenerarButton id={e.id!} />
                        ) : (
                          <span className="text-xs text-blue-400">Procesando...</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
