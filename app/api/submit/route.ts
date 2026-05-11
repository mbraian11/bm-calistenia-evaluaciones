import { NextRequest, NextResponse, after } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { EvaluacionFormData } from '@/types/evaluacion'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const rawData = formData.get('data')
    if (!rawData) return NextResponse.json({ error: 'No data provided' }, { status: 400 })

    const data: EvaluacionFormData = JSON.parse(rawData as string)
    if (!data.nombre || !data.email) {
      return NextResponse.json({ error: 'Nombre y email son requeridos' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Insertar evaluación
    const { data: evaluacion, error: insertError } = await supabase
      .from('evaluaciones')
      .insert({ ...data, estado: 'pendiente' })
      .select('id')
      .single()

    if (insertError) throw insertError

    const id = evaluacion.id

    // Subir archivos al storage
    const fileUploads: Record<string, string> = {}

    for (const [key, bucket_path] of [
      ['inbody', `${id}/inbody`],
      ['foto_frente', `${id}/foto_frente`],
      ['foto_lateral', `${id}/foto_lateral`],
      ['foto_espalda', `${id}/foto_espalda`],
    ] as const) {
      const file = formData.get(key) as File | null
      if (file) {
        const ext = file.name.split('.').pop() || 'jpg'
        const path = `${bucket_path}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('evaluaciones')
          .upload(path, file, { contentType: file.type })

        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('evaluaciones').getPublicUrl(path)
          fileUploads[key === 'inbody' ? 'inbody_url' : `${key}_url`] = urlData.publicUrl
        }
      }
    }

    // Actualizar con URLs de archivos y cambiar estado a procesando
    if (Object.keys(fileUploads).length > 0) {
      await supabase.from('evaluaciones').update(fileUploads).eq('id', id)
    }

    // Disparar generación de reporte después de responder (after garantiza que Vercel no mata el proceso)
    const reportId = id
    after(async () => {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://soy.bmcalistenia.com'
      await fetch(`${appUrl}/api/generate-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reportId }),
      }).catch((err) => console.error('[submit] after() fetch error:', err))
    })

    return NextResponse.json({ id, success: true })
  } catch (err: unknown) {
    console.error('[submit] error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error interno' },
      { status: 500 }
    )
  }
}
