import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const supabase = createServiceClient()
  await supabase
    .from('evaluaciones')
    .update({ estado: 'pendiente' })
    .eq('id', id)
    .neq('estado', 'completado') // nunca resetear uno completado

  return NextResponse.json({ ok: true })
}
