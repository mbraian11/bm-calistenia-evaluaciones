import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServiceClient } from '@/lib/supabase'
import { Evaluacion } from '@/types/evaluacion'

export const maxDuration = 60

function getAnthropic() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

function buildPrompt(e: Evaluacion): string {
  const inbody = e.inbody_resultados
  const imc = e.peso_kg && e.altura_cm ? (e.peso_kg / ((e.altura_cm / 100) ** 2)).toFixed(1) : 'N/A'
  const genero = e.genero ?? 'no especificado'
  const factorProteina = genero === 'femenino' ? 1.7 : 1.8
  const proteinaG = e.peso_kg ? Math.round(factorProteina * e.peso_kg) : null

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

    // Verificar estado actual — solo bloquear si ya está completado
    const { data: current } = await supabase
      .from('evaluaciones').select('estado').eq('id', id).single()
    if (current?.estado === 'completado') {
      return NextResponse.json({ estado: 'completado' })
    }

    // Marcar como procesando
    await supabase.from('evaluaciones').update({ estado: 'procesando' }).eq('id', id)

    // Obtener datos completos
    const { data: evaluacion, error } = await supabase
      .from('evaluaciones')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !evaluacion) throw new Error('Evaluación no encontrada')

    // Llamar a Claude — con imagen InBody si existe
    const prompt = buildPrompt(evaluacion)

    type ImageMediaType = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'
    type MsgContent = { type: 'text'; text: string } | { type: 'image'; source: { type: 'base64'; media_type: ImageMediaType; data: string } }

    let userContent: MsgContent[] | string = prompt

    if (evaluacion.inbody_url) {
      try {
        // Extraer path del archivo desde la URL de Supabase storage
        const urlPath = evaluacion.inbody_url.split('/storage/v1/object/public/')[1] || ''
        const [bucket, ...rest] = urlPath.split('/')
        const filePath = rest.join('/')

        const { data: fileData, error: fileError } = await supabase.storage
          .from(bucket)
          .download(filePath)

        if (!fileError && fileData) {
          const arrayBuffer = await fileData.arrayBuffer()
          const base64 = Buffer.from(arrayBuffer).toString('base64')
          const rawType = fileData.type || 'image/jpeg'
          const mediaType: ImageMediaType = (['image/jpeg','image/png','image/webp','image/gif'].includes(rawType)
            ? rawType : 'image/jpeg') as ImageMediaType

          userContent = [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
            { type: 'text', text: `La imagen anterior es el reporte InBody del alumno. Extrae TODOS los datos visibles (masa muscular, masa grasa, % grasa, IMC, agua corporal, metabolismo basal, puntuación InBody, etc.) y úsalos directamente en el análisis — NO digas que no tienes datos InBody si los ves en la imagen.\n\n${prompt}` }
          ]
        }
      } catch {
        // Si falla la imagen, continúa sin ella
      }
    }

    // Streaming: guardar token a token para no perder contenido si hay timeout
    let reporte = ''
    const stream = getAnthropic().messages.stream({
      model: 'claude-sonnet-4-5',
      max_tokens: 3000,
      messages: [{ role: 'user', content: userContent }],
    })

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        reporte += chunk.delta.text
      }
    }

    // Guardar reporte y marcar completado
    await supabase.from('evaluaciones').update({
      reporte_completo: reporte,
      estado: 'completado',
      reporte_generado_at: new Date().toISOString(),
    }).eq('id', id)

    // Enviar email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://soy.bmcalistenia.com'
    fetch(`${appUrl}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, nombre: evaluacion.nombre, email: evaluacion.email }),
    }).catch(() => {})

    return NextResponse.json({ success: true, id })
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
