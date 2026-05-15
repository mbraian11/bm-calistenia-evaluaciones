import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServiceClient } from '@/lib/supabase'
import { Evaluacion } from '@/types/evaluacion'
import { Resend } from 'resend'
import puppeteer from 'puppeteer'

export const maxDuration = 300

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

function getAnthropic() {
  return new Anthropic({ apiKey: ANTHROPIC_API_KEY })
}

function buildPrompt(e: Evaluacion): string {
  const inbody = e.inbody_resultados
  const imc = e.peso_kg && e.altura_cm ? (e.peso_kg / ((e.altura_cm / 100) ** 2)).toFixed(1) : 'N/A'
  const genero = e.genero ?? 'no especificado'
  const factorProteina = genero === 'femenino' ? 1.7 : 1.8
  const proteinaG = e.peso_kg ? Math.round(factorProteina * e.peso_kg) : null

  const pr = e.pruebas_fisicas_resultados

  const fmtCategoria = (val: { variante_nombre?: string; serie_1?: number; serie_2?: number; promedio?: number; progresion?: string } | undefined) => {
    if (!val?.variante_nombre) return 'No registrado'
    const prog = val.progresion === 'primera_vez' ? '1ª vez' : val.progresion === 'subio' ? '↑ Subió' : val.progresion === 'igual' ? '→ Igual' : val.progresion === 'bajo' ? '↓ Bajó' : ''
    return `${val.variante_nombre} — Serie 1: ${val.serie_1 ?? '?'} | Serie 2: ${val.serie_2 ?? '?'} | Promedio: ${val.promedio ?? '?'}${prog ? ` | ${prog}` : ''}`
  }

  const bloquePruebas = pr ? `
**Resultados pruebas físicas (variante seleccionada, 2 series y promedio):**

- Pull Ups: ${fmtCategoria(pr.pull_ups)}
- Push Ups: ${fmtCategoria(pr.push_ups)}
- Legs: ${fmtCategoria(pr.legs)}
- Pull Hold: ${fmtCategoria(pr.pull_hold)}
- Dips: ${fmtCategoria(pr.dips)}` : '**Resultados pruebas físicas:** No registrados'

  return `Eres el sistema de análisis científico de la Evaluación 360° de BM Calistenia, academia de calistenia en Panamá dirigida por el Coach Braian Meléndez.

Genera un reporte profundo, personalizado y basado en evidencia científica actualizada. Tono profesional pero cercano, directo y motivador — como si el coach le hablara personalmente al alumno. Usa "tú" y el nombre del alumno a lo largo del reporte. Basa TODAS las recomendaciones en revisiones sistemáticas y meta-análisis recientes.

---

## DATOS DEL ALUMNO

- Nombre: ${e.nombre}
- Edad: ${e.edad ?? 'No especificada'} años
- Género: ${genero}
- Peso: ${e.peso_kg ?? 'No especificado'} kg
- Altura: ${e.altura_cm ?? 'No especificada'} cm
- IMC calculado: ${imc}
- Programa: ${e.programa ?? 'No especificado'}
- Tiempo en BM Calistenia: ${e.tiempo_en_bm ?? 'No especificado'}
- Sesiones/semana en BM (últimas 4 semanas): ${e.sesiones_semana_bm ?? 'No especificado'}
- Objetivo principal: ${e.objetivo_principal ?? 'No especificado'}
- Descripción del objetivo: ${e.objetivo_detallado ?? 'No especificada'}

**Composición corporal (InBody):**
${inbody ? `- Masa muscular: ${inbody.musculo ?? 'N/D'}
- Masa grasa: ${inbody.grasa ?? 'N/D'}
- % Grasa corporal: ${inbody.porcentaje_grasa ?? 'N/D'}
- IMC InBody: ${inbody.imc ?? 'N/D'}
- Agua corporal: ${inbody.agua_corporal ?? 'N/D'}
- Metabolismo basal: ${inbody.metabolismo_basal ?? 'N/D'}
- Otros datos InBody: ${inbody.otros ?? 'N/D'}` : 'No disponible en texto — ver imagen adjunta si existe.'}

**Percepción del entrenamiento:**
- Sesión Pull & Push / Full Body: ${e.sesion_1_descripcion ?? 'No descrita'}
- Sesión Técnica / Handstand: ${e.sesion_2_descripcion ?? 'No descrita'}
- Impacto en día a día: ${e.sesion_3_descripcion ?? 'No descrito'}
- Nivel de cansancio post-sesión (1-10): ${e.nivel_cansancio ?? 'No especificado'}
- Percepción general del rendimiento: ${e.percepcion_rendimiento ?? 'No especificada'}

**Estilo de vida:**
- Ocupación: ${e.ocupacion ?? 'No especificada'}
- Nivel de estrés: ${e.nivel_estres ?? 'No especificado'}
- Horas de sueño: ${e.horas_sueno ?? 'No especificadas'}
- Calidad del sueño: ${e.calidad_sueno ?? 'No especificada'}
- Comidas por día: ${e.comidas_dia ?? 'No especificadas'}
- Descripción de alimentación: ${e.descripcion_alimentacion ?? 'No especificada'}
- Restricciones alimentarias: ${e.restricciones_alimentarias ?? 'Ninguna'}
- Suplementos actuales: ${e.suplementos ?? 'Ninguno'}

**Salud:**
- Condiciones médicas: ${e.condiciones_medicas ?? 'Ninguna'}
- Lesiones actuales: ${e.lesiones_actuales ?? 'Ninguna'}
- Lesiones pasadas: ${e.lesiones_pasadas ?? 'Ninguna'}
- Medicamentos: ${e.medicamentos ?? 'Ninguno'}
- Actividad física extra: ${e.actividad_extra ?? 'Ninguna'} — ${e.frecuencia_actividad_extra ?? ''}

${bloquePruebas}

**CONTEXTO BM CALISTENIA — sesiones presenciales:**
- Lunes: Pull & Push (push-ups, pull-ups, dips, front lever, L-sit, core tabata) ~75 min
- Martes: Full Body Pull + Pierna (pull-ups fuerza, jump squats, pistol squats, dragon flag) ~75 min
- Miércoles: Flexibilidad completa guiada ~45 min
- Jueves: Técnica Pull — Pull Up / Muscle Up / Front Lever (neuromuscular, sin AMRAP) ~60 min
- Viernes: Handstand — técnica por niveles N1/N2/N3 ~70 min
- Toda sesión: movilidad articular 3 min + calentamiento específico. El coach asigna nivel individualmente.

---

## INSTRUCCIONES DE ESTRUCTURA — sigue este orden exacto, sin saltarte ninguna sección:

### SECCIÓN 1 — Datos generales del alumno

Presenta un resumen ejecutivo personalizado: quién es ${e.nombre}, cuánto tiempo lleva en BM, cuántas sesiones hace, cuál es su objetivo y cómo llega a esta evaluación. 2-3 párrafos que conecten con su realidad concreta. Termina con una frase que lo motive a leer el reporte completo.

### SECCIÓN 2 — Composición corporal

**Parte A — Resultados actuales:**
Muestra una tabla clara con los resultados del InBody. Si tienes la imagen, extrae TODOS los datos visibles. Incluye una columna con el rango esperado/saludable para una persona de su mismo género, edad y objetivo (no valores genéricos — ajústalo a su perfil). Ejemplo de formato:

| Parámetro | Tu resultado | Rango esperado para tu perfil |
|-----------|-------------|-------------------------------|
| % Grasa | X% | Y-Z% |
| Masa muscular | Xkg | Y-Zkg |
| ...etc | | |

**Parte B — Interpretación:**
Explica qué significan sus números. Aclara que la bioimpedancia tiene una precisión del 85-90% (tiende a subestimar grasa 2-4% y sobreestimar músculo 2-3%), pero es excelente para seguimiento de tendencias. Explica cómo se encuentra en relación a su objetivo: ¿está bien posicionado? ¿Qué es lo más urgente a mejorar? Sé específico, no genérico.

*Fuentes: cita 1-2 estudios recientes sobre bioimpedancia y composición corporal.*

### SECCIÓN 3 — Nutrición

**Parte A — Estimación actual vs lo que necesitas:**
Basándote en lo que describió que come (${e.descripcion_alimentacion ?? 'no especificado'}), estima sus macros actuales de manera aproximada. Luego muestra lo que necesita según su objetivo, peso y composición corporal. Usa este formato de tabla doble:

**Tu consumo estimado actual:**
| Macronutriente | Gramos/día estimados | Calorías aprox. |
|---------------|---------------------|-----------------|
| Proteína | Xg | Xcal |
| Carbohidratos | Xg | Xcal |
| Grasas | Xg | Xcal |
| **TOTAL** | | **Xcal** |

**Lo que necesitas según tu objetivo y perfil:**
| Macronutriente | Gramos/día | Calorías | g/kg de peso |
|---------------|-----------|----------|-------------|
| Proteína | ${proteinaG ?? 'calcular'}g | Xcal | ${factorProteina}g/kg |
| Carbohidratos | Xg | Xcal | Xg/kg |
| Grasas | Xg | Xcal | Xg/kg |
| **TOTAL (TDEE estimado)** | | **Xcal** | |

**Parte B — Por qué este cambio:**
Justifica científicamente cada número. Explica por qué ${factorProteina}g/kg de proteína para una persona de ${e.edad ?? 'su'} años, con su composición corporal y objetivo de ${e.objetivo_principal ?? 'su objetivo'}. Cita bibliografía reciente (meta-análisis de los últimos 5 años sobre síntesis proteica, leucina threshold, timing, etc.). Explica también la lógica de carbohidratos y grasas según su gasto y objetivos.

**Parte C — Análisis de su alimentación actual y mejoras concretas:**
Analiza lo que describió que come. Señala específicamente qué está bien, qué le falta y cómo puede ajustarlo sin cambiar toda su vida. Da 4-5 recomendaciones muy concretas y aplicables a su rutina actual. Sin dietas exactas — principios claros que pueda aplicar.

*Fuentes: cita 2-3 estudios recientes sobre proteína, composición corporal y rendimiento en calistenia/fuerza.*

### SECCIÓN 4 — Auditoría de vida: sueño, estrés, NEAT y balance hormonal

Haz una auditoría real de su estilo de vida, no recomendaciones genéricas. Analiza:

- **Sueño (${e.horas_sueno ?? 'N/D'} horas, calidad: ${e.calidad_sueno ?? 'N/D'}):** Explica qué está pasando en su cuerpo ahora mismo con esa cantidad/calidad de sueño. Qué hormonas se ven afectadas (GH, cortisol, leptina, grelina, testosterona si aplica). Qué debería pasar para que rinda mejor y se vea mejor.
- **Estrés (${e.nivel_estres ?? 'N/D'}):** Cómo el cortisol crónico afecta su composición corporal, rendimiento y adherencia. Qué está pasando en su sistema nervioso.
- **NEAT y actividad fuera del gym:** Explica la distribución del gasto energético: TMB 50-70%, NEAT 15-35%, TEF 10-15%, ejercicio formal 5-10%. Aplícalo a su caso — si quiere perder grasa, el gym es solo el 5-10% del gasto. El NEAT y la proteína son las palancas más poderosas. Da recomendaciones prácticas para su ocupación (${e.ocupacion ?? 'su trabajo'}).
- **Balance hormonal y recuperación:** Conecta todo — sueño + estrés + nutrición + entrenamiento y cómo interactúan en su caso específico.

*Fuentes: cita estudios sobre sueño-composición corporal, cortisol-rendimiento, NEAT.*

### SECCIÓN 5 — Plan personalizado: próximos 30 días y más allá

**Parte A — Acciones concretas los próximos 30 días (ordenadas por impacto):**
Lista de 6-8 acciones muy específicas para ${e.nombre}. No genéricas. Que pueda empezar mañana. Incluye nutrición, sueño, NEAT, entrenamiento, mindset.

**Parte B — Mente y adherencia (la parte que casi nadie explica):**
Explica que el cerebro humano tiene ~200,000 años y no está diseñado para los hábitos modernos que queremos crear. El cambio de hábitos no es fuerza de voluntad — es arquitectura del ambiente y comprensión de cómo funciona el sistema de recompensa dopaminérgico. Da recomendaciones concretas de:
- Mindset y teatro mental: visualización, conexión con el "por qué" profundo, identidad ("soy alguien que cuida su cuerpo")
- Meditación o práctica de atención: 5-10 min diarios, por qué funciona para la adherencia y el manejo del estrés
- Cómo crear una conexión real con su cuerpo para que los cambios sean sostenibles y no una lucha

**Parte C — Suplementación (si aplica):**
Basándote en su perfil, déficits estimados y objetivos, recomienda suplementos si tienen evidencia sólida. Considera: creatina monohidrato, proteína whey o isolate (según su tolerancia y objetivo), omega-3, vitamina D, magnesio, otros si son relevantes para su caso. Para cada uno: dosis, timing, por qué para SU perfil específico, y cita evidencia. Si ya toma algo (${e.suplementos ?? 'ninguno'}), evalúa si lo está usando bien.

${(e.condiciones_medicas && e.condiciones_medicas !== 'Ninguna') || (e.lesiones_actuales && e.lesiones_actuales !== 'Ninguna') ? `**Nota de salud importante:** Analiza las condiciones reportadas (${e.condiciones_medicas ?? ''} / ${e.lesiones_actuales ?? ''}) y da recomendaciones específicas de precaución dentro del contexto de BM Calistenia. Siempre recomendar consultar con el médico tratante.` : ''}

### SECCIÓN 6 — Resumen compilado y cierre

Resume en formato de puntos clave todo lo más importante del reporte — máximo 8-10 puntos concretos que ${e.nombre} debe recordar. Luego escribe un párrafo final motivador y personalizado que conecte con su objetivo específico y su situación real.

Cierra con este texto exacto (sin modificar):

---
*Este reporte fue generado por el sistema de Evaluación 360° de BM Calistenia, basado en un modelo de análisis desarrollado y auditado por el Coach Braian Meléndez. **Versión 1.3** — Puede contener estimaciones o factores que no coincidan exactamente con tu realidad individual. Ante cualquier duda, consulta directamente con el Coach. Este reporte es una herramienta para que entiendas tu cuerpo y tengas un acercamiento más real a lo que está pasando — y lo que puedes hacer para mejorar tu rendimiento según tus objetivos.*`
}

// GET: consulta estado (usado por polling del cliente)
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const supabase = createServiceClient()
  const { data } = await supabase
    .from('evaluaciones')
    .select('estado')
    .eq('id', id)
    .single()

  return NextResponse.json({ estado: data?.estado ?? 'pendiente' })
}

// POST: genera el reporte (llamado desde /api/submit en background)
export async function POST(req: NextRequest) {
  let id: string | undefined
  try {
    const body = await req.json()
    id = body.id
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const supabase = createServiceClient()

    // Verificar estado actual — bloquear si ya está completado o procesando para evitar doble llamada a Claude
    const { data: current } = await supabase
      .from('evaluaciones').select('estado').eq('id', id).single()
    if (current?.estado === 'completado' || current?.estado === 'procesando') {
      return NextResponse.json({ estado: current.estado })
    }

    // Marcar como procesando
    await supabase.from('evaluaciones').update({ estado: 'procesando' }).eq('id', id)

    // Fire-and-forget — en Railway (Node.js persistente) esto sigue corriendo después de responder
    void (async () => {
      const supabaseAfter = createServiceClient()
      try {
        const { data: evaluacion, error } = await supabaseAfter
          .from('evaluaciones').select('*').eq('id', id).single()
        if (error || !evaluacion) throw new Error('Evaluación no encontrada')

        const prompt = buildPrompt(evaluacion)

        type ImageMediaType = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'
        type MsgContent = { type: 'text'; text: string } | { type: 'image'; source: { type: 'base64'; media_type: ImageMediaType; data: string } }

        let userContent: MsgContent[] | string = prompt

        if (evaluacion.inbody_url) {
          try {
            const urlPath = evaluacion.inbody_url.split('/storage/v1/object/public/')[1] || ''
            const [bucket, ...rest] = urlPath.split('/')
            const filePath = rest.join('/')
            const { data: fileData, error: fileError } = await supabaseAfter.storage.from(bucket).download(filePath)
            if (!fileError && fileData) {
              const arrayBuffer = await fileData.arrayBuffer()
              const base64 = Buffer.from(arrayBuffer).toString('base64')
              const rawType = fileData.type || 'image/jpeg'
              const mediaType: ImageMediaType = (['image/jpeg','image/png','image/webp','image/gif'].includes(rawType) ? rawType : 'image/jpeg') as ImageMediaType
              userContent = [
                { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
                { type: 'text', text: `La imagen anterior es el reporte InBody del alumno. Extrae TODOS los datos visibles y úsalos directamente en el análisis.\n\n${prompt}` }
              ]
            }
          } catch { /* continúa sin imagen */ }
        }

        const abortController = new AbortController()
        const claudeTimeout = setTimeout(() => abortController.abort(), 240_000) // 240s — deja margen antes del límite de 300s

        let message
        try {
          message = await getAnthropic().messages.create(
            {
              model: 'claude-sonnet-4-5',
              max_tokens: 8000,
              messages: [{ role: 'user', content: userContent }],
            },
            { signal: abortController.signal }
          )
        } finally {
          clearTimeout(claudeTimeout)
        }

        const reporte = message.content[0].type === 'text' ? message.content[0].text : ''

        await supabaseAfter.from('evaluaciones').update({
          reporte_completo: reporte,
          estado: 'completado',
          reporte_generado_at: new Date().toISOString(),
        }).eq('id', id)

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://soy.bmcalistenia.com'
        const reporteUrl = `${appUrl}/reporte/${id}`

        // Generar PDF con puppeteer
        let pdfBuffer: Buffer | undefined
        try {
          const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
            headless: true,
          })
          const page = await browser.newPage()
          await page.emulateMediaType('print')
          await page.goto(reporteUrl, { waitUntil: 'networkidle0', timeout: 60000 })
          await page.waitForSelector('.print-page', { timeout: 15000 }).catch(() => {})
          const pdf = await page.pdf({
            format: 'A4',
            margin: { top: '1.5cm', right: '1.5cm', bottom: '1.5cm', left: '1.5cm' },
            printBackground: true,
          })
          await browser.close()
          pdfBuffer = Buffer.from(pdf)
          console.log('[generate-report] PDF generado correctamente')
        } catch (pdfErr) {
          console.error('[generate-report] Error generando PDF:', pdfErr)
        }

        // Enviar email con PDF adjunto
        try {
          const resend = new Resend(process.env.RESEND_API_KEY)
          const primerParrafo = reporte
            .split('\n\n')
            .find((p: string) => p.length > 100 && !p.startsWith('#'))
            ?.slice(0, 300) || ''

          const nombreArchivo = `Reporte-BM-Calistenia-${evaluacion.nombre.replace(/\s+/g, '-')}.pdf`

          await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'BM Calistenia <onboarding@resend.dev>',
            to: [evaluacion.email],
            subject: `${evaluacion.nombre}, tu Evaluación 360° está lista — BM Calistenia`,
            html: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#000000;font-family:'Inter',Arial,sans-serif;color:#ffffff;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="border-bottom:1px solid rgba(255,255,255,0.05);padding-bottom:24px;margin-bottom:32px;">
      <div style="display:inline-flex;align-items:center;gap:12px;">
        <div style="width:32px;height:32px;background-color:#B91C1C;border-radius:4px;display:inline-flex;align-items:center;justify-content:center;">
          <span style="color:#ffffff;font-weight:700;font-size:12px;">BM</span>
        </div>
        <span style="font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.4);">BM Calistenia</span>
      </div>
    </div>
    <div style="margin-bottom:24px;">
      <span style="background-color:rgba(22,163,74,0.1);border:1px solid rgba(22,163,74,0.3);border-radius:100px;padding:6px 14px;font-size:11px;color:#4ade80;text-transform:uppercase;letter-spacing:0.1em;">● Evaluación completada</span>
    </div>
    <h1 style="font-family:Georgia,serif;font-size:32px;font-weight:700;margin:0 0 16px;line-height:1.2;">Tu reporte está listo,<br>${evaluacion.nombre}</h1>
    <p style="color:rgba(255,255,255,0.5);font-size:15px;line-height:1.6;margin:0 0 24px;">Hemos completado el análisis de tu Evaluación 360°. Tu reporte personalizado, generado por inteligencia artificial, ya está disponible.${pdfBuffer ? ' También lo encontrarás adjunto en este email como PDF.' : ''}</p>
    ${primerParrafo ? `<div style="background-color:rgba(185,28,28,0.08);border-left:2px solid #B91C1C;padding:16px 20px;margin-bottom:32px;border-radius:0 4px 4px 0;"><p style="margin:0;font-size:14px;color:rgba(255,255,255,0.7);line-height:1.6;font-style:italic;">"${primerParrafo}..."</p></div>` : ''}
    <div style="text-align:center;margin:32px 0;">
      <a href="${reporteUrl}" style="display:inline-block;background-color:#B91C1C;color:#ffffff;text-decoration:none;padding:16px 40px;font-size:15px;font-weight:600;border-radius:2px;letter-spacing:0.02em;">Ver mi reporte completo →</a>
    </div>
    <p style="color:rgba(255,255,255,0.3);font-size:12px;text-align:center;margin:16px 0 0;">O copia este link en tu navegador:<br><a href="${reporteUrl}" style="color:#B91C1C;text-decoration:none;word-break:break-all;">${reporteUrl}</a></p>
    <div style="border-top:1px solid rgba(255,255,255,0.05);margin:40px 0 24px;"></div>
    <div style="text-align:center;">
      <p style="color:rgba(255,255,255,0.2);font-size:11px;margin:0;">© 2025 BM Calistenia. Panamá.</p>
      <p style="color:rgba(255,255,255,0.2);font-size:11px;margin:8px 0 0;">Este email fue enviado porque completaste una Evaluación 360° en BM Calistenia.</p>
    </div>
  </div>
</body>
</html>`,
            ...(pdfBuffer ? { attachments: [{ filename: nombreArchivo, content: pdfBuffer }] } : {}),
          })
          console.log('[generate-report] Email enviado a', evaluacion.email)
        } catch (emailErr) {
          console.error('[generate-report] Error enviando email:', emailErr)
        }

      } catch (err) {
        console.error('[generate-report] error en background:', err)
        await supabaseAfter.from('evaluaciones').update({ estado: 'error' }).eq('id', id)
      }
    })()

    return NextResponse.json({ ok: true, id })
  } catch (err: unknown) {
    console.error('[generate-report] error:', err)
    if (id) {
      const supabase = createServiceClient()
      await supabase.from('evaluaciones').update({ estado: 'error' }).eq('id', id)
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error interno' },
      { status: 500 }
    )
  }
}
