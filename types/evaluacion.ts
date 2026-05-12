export interface Evaluacion {
  id?: string
  created_at?: string
  updated_at?: string
  estado?: 'pendiente' | 'procesando' | 'completado' | 'error'

  // Paso 1
  nombre: string
  email: string
  telefono?: string
  edad?: number
  genero?: string
  peso_kg?: number
  altura_cm?: number

  // Paso 2
  programa?: string
  tiempo_en_bm?: string
  objetivo_principal?: string
  objetivo_detallado?: string

  // Paso 3
  ocupacion?: string
  nivel_estres?: string
  horas_sueno?: number
  calidad_sueno?: string
  comidas_dia?: number
  descripcion_alimentacion?: string
  restricciones_alimentarias?: string
  suplementos?: string

  // Paso 4
  condiciones_medicas?: string
  lesiones_actuales?: string
  lesiones_pasadas?: string
  medicamentos?: string
  actividad_extra?: string
  frecuencia_actividad_extra?: string

  // Paso 5 — InBody
  inbody_url?: string
  inbody_resultados?: InBodyResultados
  foto_frente_url?: string
  foto_lateral_url?: string
  foto_espalda_url?: string

  // Paso 5 — Percepción del entrenamiento en BM
  sesiones_semana_bm?: number
  sesion_1_descripcion?: string
  sesion_2_descripcion?: string
  sesion_3_descripcion?: string
  nivel_cansancio?: number
  percepcion_rendimiento?: string

  // Paso 6 — Resultados pruebas físicas
  pruebas_fisicas_resultados?: PruebasFisicasResultados

  // Reporte
  reporte_completo?: string
  reporte_generado_at?: string
}

export interface InBodyResultados {
  peso?: string
  musculo?: string
  grasa?: string
  imc?: string
  porcentaje_grasa?: string
  agua_corporal?: string
  metabolismo_basal?: string
  otros?: string
}

export interface PruebaEjercicio {
  variante?: string
  variante_nombre?: string
  serie_1?: number
  serie_2?: number
  promedio?: number
  progresion?: string
  unidad?: string
}

export interface PruebasFisicasResultados {
  pull_ups?: PruebaEjercicio
  push_ups?: PruebaEjercicio
  legs?: PruebaEjercicio
  pull_hold?: PruebaEjercicio
  dips?: PruebaEjercicio
}

export type EvaluacionFormData = Omit<Evaluacion, 'id' | 'created_at' | 'updated_at' | 'estado' | 'reporte_completo' | 'reporte_generado_at'>
