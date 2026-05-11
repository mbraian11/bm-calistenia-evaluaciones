import { createServiceClient } from '@/lib/supabase'
import { Evaluacion } from '@/types/evaluacion'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

async function getEvaluacion(id: string): Promise<Evaluacion | null> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('evaluaciones')
    .select('*')
    .eq('id', id)
    .single()
  return data
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1 h-5 bg-red-700 rounded-full" />
        <h2 className="font-display text-xl font-bold">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function MetricCard({ label, value, unit = '' }: { label: string; value: string | number | undefined; unit?: string }) {
  if (!value) return null
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-sm p-4">
      <p className="text-xs text-white/40 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}<span className="text-sm text-white/40 ml-1">{unit}</span></p>
    </div>
  )
}

function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*\n]+\*|<sub>[^<]*<\/sub>|`[^`]+`)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**'))
          return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>
        if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**'))
          return <em key={i} className="text-white/50 not-italic text-xs">{part.slice(1, -1)}</em>
        if (part.startsWith('<sub>') && part.endsWith('</sub>'))
          return <span key={i} className="text-xs text-white/40">{part.slice(5, -6)}</span>
        if (part.startsWith('`') && part.endsWith('`'))
          return <code key={i} className="text-red-300 bg-white/5 px-1 rounded text-xs">{part.slice(1, -1)}</code>
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

function parseTableRow(row: string): string[] {
  return row.split('|').map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1)
}

function ReporteMarkdown({ content }: { content: string }) {
  const lines = content.split('\n')
  const blocks: React.ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (!line.trim()) { i++; continue }

    // ── SECCIÓN heading (### SECCIÓN N — ...)
    if (line.match(/^###?\s*SECCI[ÓO]N\s+\d/i) || line.match(/^##\s*SECCI[ÓO]N\s+\d/i)) {
      const title = line.replace(/^#+\s*/, '')
      blocks.push(
        <div key={i} className="flex items-center gap-3 mt-10 mb-4">
          <div className="h-px flex-1 bg-white/5" />
          <span className="text-xs text-white/30 uppercase tracking-widest font-medium">{title}</span>
          <div className="h-px flex-1 bg-white/5" />
        </div>
      )
      i++; continue
    }

    // ── H4 (####)
    if (line.startsWith('#### ')) {
      blocks.push(<h5 key={i} className="font-semibold text-sm text-white/80 mt-4 mb-1">{line.slice(5)}</h5>)
      i++; continue
    }

    // ── H3 (###) — Parte A / B / C style
    if (line.startsWith('### ')) {
      const title = line.slice(4)
      const isParte = title.toLowerCase().startsWith('parte')
      blocks.push(
        <div key={i} className={`mt-8 mb-3 ${isParte ? 'flex items-center gap-2' : ''}`}>
          {isParte && <div className="w-1 h-4 bg-red-600 rounded-full flex-shrink-0" />}
          <h4 className={`font-display font-bold ${isParte ? 'text-base text-red-300' : 'text-base text-red-400'}`}>
            {title}
          </h4>
        </div>
      )
      i++; continue
    }

    // ── H2 (##)
    if (line.startsWith('## ')) {
      blocks.push(
        <h3 key={i} className="font-display text-lg font-bold text-white mt-8 mb-3 pb-2 border-b border-white/8">
          {line.slice(3)}
        </h3>
      )
      i++; continue
    }

    // ── H1 (#)
    if (line.startsWith('# ')) {
      blocks.push(
        <h2 key={i} className="font-display text-2xl font-bold text-white mt-10 mb-4">
          {line.slice(2)}
        </h2>
      )
      i++; continue
    }

    // ── Horizontal rule
    if (line.match(/^---+$/)) {
      blocks.push(<hr key={i} className="border-white/8 my-6" />)
      i++; continue
    }

    // ── Blockquote / italic source citation
    if (line.startsWith('> ') || (line.startsWith('*') && line.endsWith('*') && line.includes('Fuente'))) {
      const text = line.startsWith('> ') ? line.slice(2) : line
      blocks.push(
        <p key={i} className="text-xs text-white/35 italic mt-3 pl-3 border-l border-white/10">
          <Inline text={text} />
        </p>
      )
      i++; continue
    }

    // ── TABLE — detect by | at start/end
    if (line.startsWith('|') && line.endsWith('|')) {
      const tableLines: string[] = []
      while (i < lines.length && lines[i].startsWith('|') && lines[i].endsWith('|')) {
        tableLines.push(lines[i])
        i++
      }
      const headers = parseTableRow(tableLines[0])
      const dataRows = tableLines.slice(2) // skip separator row
      blocks.push(
        <div key={`table-${i}`} className="my-5 overflow-x-auto rounded-lg border border-white/8">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-white/5">
                {headers.map((h, j) => (
                  <th key={j} className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase tracking-wider border-b border-white/8 whitespace-nowrap">
                    <Inline text={h} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataRows.map((row, ri) => {
                const cells = parseTableRow(row)
                const isTotal = cells[0]?.toLowerCase().includes('total')
                return (
                  <tr key={ri} className={`border-b border-white/5 last:border-0 ${isTotal ? 'bg-red-950/20 font-semibold' : ri % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'}`}>
                    {cells.map((cell, ci) => (
                      <td key={ci} className={`px-4 py-3 ${ci === 0 ? 'text-white/70' : 'text-white/85'}`}>
                        <Inline text={cell} />
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )
      continue
    }

    // ── Numbered or bullet list
    if (line.match(/^[-•*]\s/) || line.match(/^\d+\.\s/)) {
      const items: { text: string; num: boolean }[] = []
      let isNum = !!line.match(/^\d+\.\s/)
      while (i < lines.length && (lines[i].match(/^[-•*]\s/) || lines[i].match(/^\d+\.\s/) || lines[i].startsWith('  '))) {
        if (lines[i].trim()) {
          items.push({ text: lines[i].replace(/^[-•*\d.]+\s*/, '').trimStart(), num: isNum })
        }
        i++
      }
      blocks.push(
        <ul key={`list-${i}`} className="space-y-2 my-3">
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-3 text-sm text-white/70 leading-relaxed">
              <span className={`mt-1 flex-shrink-0 ${item.num ? 'text-red-500 font-bold text-xs min-w-[1.2rem]' : 'text-red-500 text-xs'}`}>
                {item.num ? `${j + 1}.` : '▸'}
              </span>
              <span><Inline text={item.text} /></span>
            </li>
          ))}
        </ul>
      )
      continue
    }

    // ── Bold-only label line → highlighted callout
    if (line.startsWith('**') && line.endsWith('**') && !line.slice(2).includes('**')) {
      blocks.push(
        <p key={i} className="font-semibold text-white mt-4 mb-1 text-sm">
          {line.slice(2, -2)}
        </p>
      )
      i++; continue
    }

    // ── Bold label with colon → subtle callout
    if (line.startsWith('**') && line.includes(':**')) {
      blocks.push(
        <div key={i} className="bg-white/[0.03] border-l-2 border-red-800/60 pl-4 py-2.5 rounded-r my-2">
          <p className="text-sm text-white/80"><Inline text={line} /></p>
        </div>
      )
      i++; continue
    }

    // ── Regular paragraph
    blocks.push(
      <p key={i} className="text-sm text-white/70 leading-relaxed">
        <Inline text={line} />
      </p>
    )
    i++
  }

  return <div className="space-y-1.5">{blocks}</div>
}

export default async function ReportePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const evaluacion = await getEvaluacion(id)
  if (!evaluacion) notFound()

  const bmi = evaluacion.peso_kg && evaluacion.altura_cm
    ? (evaluacion.peso_kg / ((evaluacion.altura_cm / 100) ** 2)).toFixed(1)
    : null

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/5 bg-black/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="BM Calistenia" width={34} height={34} className="object-contain" />
            <div>
              <p className="text-xs font-semibold tracking-wide uppercase leading-none">BM Calistenia</p>
              <p className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5 hidden sm:block">Reporte de Evaluación</p>
            </div>
          </div>
          <Link href="/evaluacion" className="text-xs text-red-400 hover:text-red-300 transition-colors whitespace-nowrap">
            Nueva evaluación →
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Encabezado del reporte */}
        <div className="mb-8 md:mb-12">
          <div className="absolute left-0 right-0 h-48 bg-[radial-gradient(ellipse_at_top,_rgba(185,28,28,0.1)_0%,_transparent_70%)] pointer-events-none" />

          <div className="inline-flex items-center gap-2 bg-green-950/40 border border-green-800/30 rounded-full px-4 py-1.5 text-xs text-green-400 uppercase tracking-widest mb-4">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            Evaluación completada
          </div>

          <h1 className="font-display text-2xl md:text-5xl font-bold mb-3 leading-tight">
            Reporte de {evaluacion.nombre}
          </h1>

          <p className="text-white/40 text-sm">
            Generado el {new Date(evaluacion.reporte_generado_at || evaluacion.created_at || '').toLocaleDateString('es-PA', {
              year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </p>

          <div className="line-accent w-full mt-6" />
        </div>

        {/* Métricas resumen */}
        <Section title="Datos personales">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <MetricCard label="Edad" value={evaluacion.edad} unit="años" />
            <MetricCard label="Peso" value={evaluacion.peso_kg} unit="kg" />
            <MetricCard label="Altura" value={evaluacion.altura_cm} unit="cm" />
            <MetricCard label="IMC calculado" value={bmi ?? undefined} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {evaluacion.programa && (
              <div className="bg-white/[0.03] border border-white/5 rounded-sm p-3">
                <p className="text-xs text-white/40">Programa</p>
                <p className="text-sm text-white capitalize">{evaluacion.programa.replace('_', ' ')}</p>
              </div>
            )}
            {evaluacion.objetivo_principal && (
              <div className="bg-white/[0.03] border border-white/5 rounded-sm p-3">
                <p className="text-xs text-white/40">Objetivo</p>
                <p className="text-sm text-white capitalize">{evaluacion.objetivo_principal.replace(/_/g, ' ')}</p>
              </div>
            )}
            {evaluacion.tiempo_en_bm && (
              <div className="bg-white/[0.03] border border-white/5 rounded-sm p-3">
                <p className="text-xs text-white/40">Tiempo en BM</p>
                <p className="text-sm text-white">{evaluacion.tiempo_en_bm.replace(/_/g, ' ')}</p>
              </div>
            )}
          </div>
        </Section>

        {/* InBody */}
        {evaluacion.inbody_resultados && Object.keys(evaluacion.inbody_resultados).length > 0 && (
          <Section title="Composición corporal (InBody)">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <MetricCard label="Masa muscular" value={evaluacion.inbody_resultados.musculo} />
              <MetricCard label="Masa grasa" value={evaluacion.inbody_resultados.grasa} />
              <MetricCard label="% Grasa" value={evaluacion.inbody_resultados.porcentaje_grasa} />
              <MetricCard label="IMC InBody" value={evaluacion.inbody_resultados.imc} />
              <MetricCard label="Agua corporal" value={evaluacion.inbody_resultados.agua_corporal} />
              <MetricCard label="Metabolismo basal" value={evaluacion.inbody_resultados.metabolismo_basal} />
            </div>
          </Section>
        )}

        {/* Percepción del entrenamiento */}
        {(evaluacion.sesiones_semana_bm || evaluacion.nivel_cansancio || evaluacion.percepcion_rendimiento) && (
          <Section title="Percepción del entrenamiento">
            <div className="space-y-4">
              {evaluacion.sesiones_semana_bm && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                  <span className="text-xs text-white/40 uppercase tracking-wider">Sesiones/semana en BM</span>
                  <span className="text-lg font-bold">{evaluacion.sesiones_semana_bm}</span>
                </div>
              )}
              {evaluacion.nivel_cansancio && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                  <span className="text-xs text-white/40 uppercase tracking-wider">Nivel de cansancio</span>
                  <span className="text-lg font-bold">{evaluacion.nivel_cansancio}<span className="text-sm text-white/40">/10</span></span>
                </div>
              )}
              {evaluacion.sesion_1_descripcion && (
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Sesión Pull & Push / Full Body</p>
                  <p className="text-sm text-white/70">{evaluacion.sesion_1_descripcion}</p>
                </div>
              )}
              {evaluacion.sesion_2_descripcion && (
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Sesión Técnica / Handstand</p>
                  <p className="text-sm text-white/70">{evaluacion.sesion_2_descripcion}</p>
                </div>
              )}
              {evaluacion.sesion_3_descripcion && (
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Impacto en el día a día</p>
                  <p className="text-sm text-white/70">{evaluacion.sesion_3_descripcion}</p>
                </div>
              )}
              {evaluacion.percepcion_rendimiento && (
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Percepción general del rendimiento</p>
                  <p className="text-sm text-white/70">{evaluacion.percepcion_rendimiento}</p>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Reporte IA */}
        {evaluacion.reporte_completo && (
          <Section title="Análisis y recomendaciones (IA)">
            <div className="bg-white/[0.02] border border-white/5 rounded-sm p-6 md:p-8">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/5">
                <div className="w-6 h-6 bg-red-900/40 border border-red-700/40 rounded-sm flex items-center justify-center">
                  <svg className="w-3 h-3 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                  </svg>
                </div>
                <span className="text-xs text-white/40 uppercase tracking-widest">Generado por Claude AI</span>
              </div>
              <ReporteMarkdown content={evaluacion.reporte_completo} />
            </div>
          </Section>
        )}

        {/* Fotos si existen */}
        {(evaluacion.foto_frente_url || evaluacion.foto_lateral_url || evaluacion.foto_espalda_url) && (
          <Section title="Fotos de progreso">
            <div className="grid grid-cols-3 gap-4">
              {[
                { url: evaluacion.foto_frente_url, label: 'Frente' },
                { url: evaluacion.foto_lateral_url, label: 'Lateral' },
                { url: evaluacion.foto_espalda_url, label: 'Espalda' },
              ].filter(f => f.url).map(({ url, label }) => (
                <div key={label} className="relative aspect-[3/4] bg-white/5 border border-white/10 rounded-sm overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url!} alt={label} className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <p className="text-xs text-white/60">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-white/5 text-center">
          <p className="text-xs text-white/20">
            Este reporte fue generado automáticamente por el sistema de Evaluación 360° de BM Calistenia.
            Consulta con tu entrenador para implementar las recomendaciones.
          </p>
          <div className="mt-4">
            <Link
              href="/evaluacion"
              className="inline-flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              Realizar nueva evaluación →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
