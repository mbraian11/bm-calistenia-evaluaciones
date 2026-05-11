import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServiceClient } from '@/lib/supabase'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { id, nombre, email } = await req.json()
    if (!id || !email) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const reporteUrl = `${appUrl}/reporte/${id}`

    // Obtener resumen del reporte
    const supabase = createServiceClient()
    const { data: evaluacion } = await supabase
      .from('evaluaciones')
      .select('reporte_completo, objetivo_principal')
      .eq('id', id)
      .single()

    const primerParrafo = evaluacion?.reporte_completo
      ?.split('\n\n')
      .find((p: string) => p.length > 100 && !p.startsWith('#'))
      ?.slice(0, 300) || ''

    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'BM Calistenia <onboarding@resend.dev>',
      to: [email],
      subject: `${nombre}, tu Evaluación 360° está lista — BM Calistenia`,
      html: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tu Evaluación 360° está lista</title>
</head>
<body style="margin:0;padding:0;background-color:#000000;font-family:'Inter',Arial,sans-serif;color:#ffffff;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">

    <!-- Header -->
    <div style="border-bottom:1px solid rgba(255,255,255,0.05);padding-bottom:24px;margin-bottom:32px;">
      <div style="display:inline-flex;align-items:center;gap:12px;">
        <div style="width:32px;height:32px;background-color:#B91C1C;border-radius:4px;display:inline-flex;align-items:center;justify-content:center;">
          <span style="color:#ffffff;font-weight:700;font-size:12px;">BM</span>
        </div>
        <span style="font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.4);">BM Calistenia</span>
      </div>
    </div>

    <!-- Badge -->
    <div style="margin-bottom:24px;">
      <span style="background-color:rgba(22,163,74,0.1);border:1px solid rgba(22,163,74,0.3);border-radius:100px;padding:6px 14px;font-size:11px;color:#4ade80;text-transform:uppercase;letter-spacing:0.1em;">
        ● Evaluación completada
      </span>
    </div>

    <!-- Title -->
    <h1 style="font-family:Georgia,serif;font-size:32px;font-weight:700;margin:0 0 16px;line-height:1.2;">
      Tu reporte está listo,<br>${nombre}
    </h1>

    <p style="color:rgba(255,255,255,0.5);font-size:15px;line-height:1.6;margin:0 0 24px;">
      Hemos completado el análisis de tu Evaluación 360°. Tu reporte personalizado, generado por inteligencia artificial, ya está disponible.
    </p>

    ${primerParrafo ? `
    <!-- Preview del reporte -->
    <div style="background-color:rgba(185,28,28,0.08);border-left:2px solid #B91C1C;padding:16px 20px;margin-bottom:32px;border-radius:0 4px 4px 0;">
      <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.7);line-height:1.6;font-style:italic;">
        "${primerParrafo}..."
      </p>
    </div>
    ` : ''}

    <!-- CTA -->
    <div style="text-align:center;margin:32px 0;">
      <a href="${reporteUrl}"
         style="display:inline-block;background-color:#B91C1C;color:#ffffff;text-decoration:none;padding:16px 40px;font-size:15px;font-weight:600;border-radius:2px;letter-spacing:0.02em;">
        Ver mi reporte completo →
      </a>
    </div>

    <p style="color:rgba(255,255,255,0.3);font-size:12px;text-align:center;margin:16px 0 0;">
      O copia este link en tu navegador:<br>
      <a href="${reporteUrl}" style="color:#B91C1C;text-decoration:none;word-break:break-all;">${reporteUrl}</a>
    </p>

    <!-- Divider -->
    <div style="border-top:1px solid rgba(255,255,255,0.05);margin:40px 0 24px;"></div>

    <!-- Footer -->
    <div style="text-align:center;">
      <p style="color:rgba(255,255,255,0.2);font-size:11px;margin:0;">
        © 2024 BM Calistenia. Panamá.
      </p>
      <p style="color:rgba(255,255,255,0.2);font-size:11px;margin:8px 0 0;">
        Este email fue enviado porque completaste una Evaluación 360° en BM Calistenia.
      </p>
    </div>

  </div>
</body>
</html>`,
    })

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error('[send-email] error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error enviando email' },
      { status: 500 }
    )
  }
}
