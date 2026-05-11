'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { EvaluacionFormData } from '@/types/evaluacion'

const TOTAL_STEPS = 5

const stepTitles = [
  'Datos personales',
  'Programa y objetivo',
  'Día a día y alimentación',
  'Salud y lesiones',
  'Pruebas físicas e InBody',
]

const initialForm: EvaluacionFormData = {
  nombre: '', email: '', telefono: '+507 ', edad: undefined, genero: '', peso_kg: undefined, altura_cm: undefined,
  programa: '', tiempo_en_bm: '', objetivo_principal: '', objetivo_detallado: '',
  ocupacion: '', nivel_estres: '', horas_sueno: undefined, calidad_sueno: '', comidas_dia: undefined,
  descripcion_alimentacion: '', restricciones_alimentarias: '', suplementos: '',
  condiciones_medicas: '', lesiones_actuales: '', lesiones_pasadas: '', medicamentos: '',
  actividad_extra: '', frecuencia_actividad_extra: '',
  inbody_resultados: {},
  sesiones_semana_bm: undefined,
  sesion_1_descripcion: '', sesion_2_descripcion: '', sesion_3_descripcion: '',
  nivel_cansancio: undefined, percepcion_rendimiento: '',
}

function InputField({ label, name, value, onChange, type = 'text', placeholder = '', required = false }: {
  label: string; name: string; value: string | number | undefined; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string; placeholder?: string; required?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm text-white/60">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value ?? ''}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-red-700 transition-colors text-sm"
      />
    </div>
  )
}

function SelectField({ label, name, value, onChange, options, required = false }: {
  label: string; name: string; value: string | undefined; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[]; required?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm text-white/60">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={value ?? ''}
        onChange={onChange}
        required={required}
        className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-white focus:outline-none focus:border-red-700 transition-colors text-sm appearance-none"
      >
        <option value="" className="bg-black">Seleccionar...</option>
        {options.map(o => <option key={o.value} value={o.value} className="bg-black">{o.label}</option>)}
      </select>
    </div>
  )
}

function VoiceButton({ onText }: { onText: (text: string) => void }) {
  const [recording, setRecording] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)

  const toggle = () => {
    if (recording) {
      recognitionRef.current?.stop()
      setRecording(false)
      return
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognitionAPI) {
      alert('Tu navegador no soporta dictado por voz. Usa Google Chrome.')
      return
    }
    const recognition = new SpeechRecognitionAPI()
    recognition.lang = 'es'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.onresult = (event: { results: { [s: number]: { [s: number]: { transcript: string } } } }) => {
      const transcript = event.results[0][0].transcript
      onText(transcript)
    }
    recognition.onend = () => setRecording(false)
    recognition.onerror = () => setRecording(false)
    recognition.start()
    recognitionRef.current = recognition
    setRecording(true)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title={recording ? 'Detener grabación' : 'Dictar por voz'}
      className={`absolute right-2 bottom-2 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
        recording
          ? 'bg-red-600 animate-pulse shadow-[0_0_14px_rgba(220,38,38,0.7)]'
          : 'bg-white/10 hover:bg-white/20'
      }`}
    >
      {recording ? (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white">
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white">
          <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v6a2 2 0 0 0 4 0V5a2 2 0 0 0-2-2zM5 12a7 7 0 0 0 14 0h2a9 9 0 0 1-8 8.94V23h-2v-2.06A9 9 0 0 1 3 12H5z" />
        </svg>
      )}
    </button>
  )
}

function TextareaField({ label, name, value, onChange, placeholder = '', rows = 3, voice = false, onVoiceInput }: {
  label: string; name: string; value: string | undefined; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string; rows?: number; voice?: boolean; onVoiceInput?: (text: string) => void
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm text-white/60">{label}</label>
      <div className="relative">
        <textarea
          name={name}
          value={value ?? ''}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          className={`w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-red-700 transition-colors text-sm resize-none ${voice ? 'pr-12' : ''}`}
        />
        {voice && onVoiceInput && <VoiceButton onText={onVoiceInput} />}
      </div>
    </div>
  )
}

export default function FormularioEvaluacion() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<EvaluacionFormData>(initialForm)
  const [files, setFiles] = useState<{ inbody?: File; frente?: File; lateral?: File; espalda?: File }>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inbodyRef = useRef<HTMLInputElement>(null)
  const frenteRef = useRef<HTMLInputElement>(null)
  const lateralRef = useRef<HTMLInputElement>(null)
  const espaldaRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? (value ? Number(value) : undefined) : value
    }))
  }

  const handleInBodyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      inbody_resultados: { ...prev.inbody_resultados, [name]: value }
    }))
  }

  const appendVoiceText = (field: keyof EvaluacionFormData) => (text: string) => {
    setForm(prev => {
      const current = (prev[field] as string) ?? ''
      return { ...prev, [field]: current ? `${current} ${text}` : text }
    })
  }

  const handleFileChange = (key: keyof typeof files) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setFiles(prev => ({ ...prev, [key]: file }))
  }

  const handleNext = () => {
    setError('')
    if (step === 1 && (!form.nombre || !form.email)) {
      setError('Nombre y email son requeridos')
      return
    }
    setStep(s => Math.min(s + 1, TOTAL_STEPS))
    window.scrollTo(0, 0)
  }

  const handleBack = () => {
    setStep(s => Math.max(s - 1, 1))
    window.scrollTo(0, 0)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const body = new FormData()
      body.append('data', JSON.stringify(form))
      if (files.inbody) body.append('inbody', files.inbody)
      if (files.frente) body.append('foto_frente', files.frente)
      if (files.lateral) body.append('foto_lateral', files.lateral)
      if (files.espalda) body.append('foto_espalda', files.espalda)

      const res = await fetch('/api/submit', { method: 'POST', body })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error al enviar')
      router.push(`/procesando?id=${json.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
      setLoading(false)
    }
  }

  const progress = ((step - 1) / (TOTAL_STEPS - 1)) * 100

  return (
    <div className="min-h-screen bg-black text-white px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <Image src="/logo.png" alt="BM Calistenia" width={40} height={40} className="object-contain" />
            <div>
              <p className="text-sm font-semibold tracking-wide uppercase leading-none">BM Calistenia</p>
              <p className="text-xs text-white/40 uppercase tracking-widest mt-0.5">Evaluación 360°</p>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="flex items-center gap-2 mb-3">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div key={i} className="flex-1 h-0.5 rounded-full overflow-hidden bg-white/10">
                <div
                  className="h-full bg-red-700 transition-all duration-500"
                  style={{ width: i < step ? '100%' : '0%' }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-white/30">
            <span>Paso {step} de {TOTAL_STEPS}</span>
            <span>{Math.round(progress)}% completado</span>
          </div>

          <h1 className="font-display text-2xl md:text-3xl font-bold mt-6">
            {stepTitles[step - 1]}
          </h1>
        </div>

        {/* Contenido del paso */}
        <div className="bg-white/[0.02] border border-white/5 rounded-sm p-6 md:p-8 space-y-6">

          {step === 1 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <InputField label="Nombre completo" name="nombre" value={form.nombre} onChange={handleChange} required placeholder="Tu nombre" />
                </div>
                <div className="col-span-2">
                  <InputField label="Email" name="email" value={form.email} onChange={handleChange} type="email" required placeholder="tu@email.com" />
                </div>
                <InputField label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange} placeholder="+507 6000-0000" />
                <InputField label="Edad" name="edad" value={form.edad} onChange={handleChange} type="number" placeholder="25" />
              </div>
              <SelectField
                label="Género"
                name="genero"
                value={form.genero}
                onChange={handleChange}
                options={[{ value: 'masculino', label: 'Masculino' }, { value: 'femenino', label: 'Femenino' }, { value: 'otro', label: 'Otro' }]}
              />
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Peso (kg)" name="peso_kg" value={form.peso_kg} onChange={handleChange} type="number" placeholder="70" />
                <InputField label="Altura (cm)" name="altura_cm" value={form.altura_cm} onChange={handleChange} type="number" placeholder="170" />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <SelectField
                label="Programa en BM Calistenia"
                name="programa"
                value={form.programa}
                onChange={handleChange}
                options={[
                  { value: 'presencial_adultos', label: 'Presencial - Adultos' },
                  { value: 'presencial_ninos', label: 'Presencial - Niños' },
                  { value: 'online', label: 'Online' },
                  { value: 'hibrido', label: 'Híbrido' },
                ]}
              />
              <SelectField
                label="¿Cuánto tiempo llevas en BM?"
                name="tiempo_en_bm"
                value={form.tiempo_en_bm}
                onChange={handleChange}
                options={[
                  { value: 'menos_1_mes', label: 'Menos de 1 mes' },
                  { value: '1_3_meses', label: '1 a 3 meses' },
                  { value: '3_6_meses', label: '3 a 6 meses' },
                  { value: '6_12_meses', label: '6 a 12 meses' },
                  { value: 'mas_1_año', label: 'Más de 1 año' },
                ]}
              />
              <SelectField
                label="Objetivo principal"
                name="objetivo_principal"
                value={form.objetivo_principal}
                onChange={handleChange}
                options={[
                  { value: 'perder_grasa', label: 'Perder grasa' },
                  { value: 'ganar_musculo', label: 'Ganar músculo' },
                  { value: 'mejorar_rendimiento', label: 'Mejorar rendimiento' },
                  { value: 'aprender_habilidades', label: 'Aprender habilidades (muscle-up, planche, etc.)' },
                  { value: 'salud_general', label: 'Salud y bienestar general' },
                  { value: 'competencia', label: 'Preparación para competencia' },
                ]}
              />
              <TextareaField
                label="Describe tu objetivo con más detalle"
                name="objetivo_detallado"
                value={form.objetivo_detallado}
                onChange={handleChange}
                placeholder="¿Qué resultado específico quieres lograr? ¿En cuánto tiempo?"
                rows={4}
                voice
                onVoiceInput={appendVoiceText('objetivo_detallado')}
              />
            </>
          )}

          {step === 3 && (
            <>
              <InputField label="Ocupación / trabajo" name="ocupacion" value={form.ocupacion} onChange={handleChange} placeholder="Ej. oficinista, estudiante, freelance..." />
              <SelectField
                label="Nivel de estrés actual"
                name="nivel_estres"
                value={form.nivel_estres}
                onChange={handleChange}
                options={[
                  { value: 'bajo', label: 'Bajo — muy tranquilo' },
                  { value: 'moderado', label: 'Moderado — manejable' },
                  { value: 'alto', label: 'Alto — bastante estresado' },
                  { value: 'muy_alto', label: 'Muy alto — me cuesta manejar' },
                ]}
              />
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Horas de sueño por noche" name="horas_sueno" value={form.horas_sueno} onChange={handleChange} type="number" placeholder="7" />
                <SelectField
                  label="Calidad del sueño"
                  name="calidad_sueno"
                  value={form.calidad_sueno}
                  onChange={handleChange}
                  options={[
                    { value: 'excelente', label: 'Excelente' },
                    { value: 'buena', label: 'Buena' },
                    { value: 'regular', label: 'Regular' },
                    { value: 'mala', label: 'Mala' },
                  ]}
                />
              </div>
              <InputField label="Comidas por día" name="comidas_dia" value={form.comidas_dia} onChange={handleChange} type="number" placeholder="3" />
              <TextareaField
                label="Describe tu alimentación típica"
                name="descripcion_alimentacion"
                value={form.descripcion_alimentacion}
                onChange={handleChange}
                placeholder="¿Qué comes normalmente? Desayuno, almuerzo, cena y snacks. Sé específico."
                rows={5}
                voice
                onVoiceInput={appendVoiceText('descripcion_alimentacion')}
              />
              <TextareaField
                label="Restricciones alimentarias"
                name="restricciones_alimentarias"
                value={form.restricciones_alimentarias}
                onChange={handleChange}
                placeholder="Alergias, intolerancias, preferencias (vegetariano, etc.)"
              />
              <TextareaField
                label="Suplementos que usas actualmente"
                name="suplementos"
                value={form.suplementos}
                onChange={handleChange}
                placeholder="Proteína, creatina, vitaminas, etc. Escribe 'Ninguno' si no usas."
              />
            </>
          )}

          {step === 4 && (
            <>
              <TextareaField
                label="Condiciones médicas actuales"
                name="condiciones_medicas"
                value={form.condiciones_medicas}
                onChange={handleChange}
                placeholder="Diabetes, hipertensión, tiroides, etc. Escribe 'Ninguna' si no tienes."
              />
              <TextareaField
                label="Lesiones actuales"
                name="lesiones_actuales"
                value={form.lesiones_actuales}
                onChange={handleChange}
                placeholder="¿Tienes alguna lesión activa que limite tu entrenamiento?"
              />
              <TextareaField
                label="Lesiones pasadas relevantes"
                name="lesiones_pasadas"
                value={form.lesiones_pasadas}
                onChange={handleChange}
                placeholder="Cirugías, fracturas, desgarros que debes considerar al entrenar."
              />
              <TextareaField
                label="Medicamentos"
                name="medicamentos"
                value={form.medicamentos}
                onChange={handleChange}
                placeholder="Medicamentos que tomas regularmente. Escribe 'Ninguno'."
              />
              <TextareaField
                label="Actividad física adicional"
                name="actividad_extra"
                value={form.actividad_extra}
                onChange={handleChange}
                placeholder="Fuera de BM Calistenia, ¿realizas otra actividad? (fútbol, natación, ciclismo, etc.)"
              />
              <SelectField
                label="Frecuencia de actividad adicional"
                name="frecuencia_actividad_extra"
                value={form.frecuencia_actividad_extra}
                onChange={handleChange}
                options={[
                  { value: 'ninguna', label: 'Ninguna' },
                  { value: '1_vez', label: '1 vez por semana' },
                  { value: '2_3_veces', label: '2-3 veces por semana' },
                  { value: '4_5_veces', label: '4-5 veces por semana' },
                  { value: 'diario', label: 'Diario' },
                ]}
              />
            </>
          )}

          {step === 5 && (
            <>
              {/* InBody */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider">Datos InBody</h3>
                <p className="text-xs text-white/40">Si tienes tu resultado de InBody, súbelo o escribe los datos manualmente.</p>

                <div
                  onClick={() => inbodyRef.current?.click()}
                  className="border border-dashed border-white/20 rounded-sm p-6 text-center cursor-pointer hover:border-red-700/50 transition-colors"
                >
                  <input ref={inbodyRef} type="file" accept=".pdf,image/*" className="hidden" onChange={handleFileChange('inbody')} />
                  {files.inbody ? (
                    <p className="text-sm text-green-400">✓ {files.inbody.name}</p>
                  ) : (
                    <>
                      <p className="text-sm text-white/50">Subir archivo InBody (PDF o imagen)</p>
                      <p className="text-xs text-white/20 mt-1">Opcional — también puedes escribir los datos abajo</p>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Peso corporal" name="peso" value={form.inbody_resultados?.peso} onChange={handleInBodyChange} placeholder="70 kg" />
                  <InputField label="Masa muscular" name="musculo" value={form.inbody_resultados?.musculo} onChange={handleInBodyChange} placeholder="32 kg" />
                  <InputField label="Masa grasa" name="grasa" value={form.inbody_resultados?.grasa} onChange={handleInBodyChange} placeholder="15 kg" />
                  <InputField label="% de grasa" name="porcentaje_grasa" value={form.inbody_resultados?.porcentaje_grasa} onChange={handleInBodyChange} placeholder="21%" />
                  <InputField label="IMC" name="imc" value={form.inbody_resultados?.imc} onChange={handleInBodyChange} placeholder="22.5" />
                  <InputField label="Agua corporal" name="agua_corporal" value={form.inbody_resultados?.agua_corporal} onChange={handleInBodyChange} placeholder="45 L" />
                  <InputField label="Metabolismo basal" name="metabolismo_basal" value={form.inbody_resultados?.metabolismo_basal} onChange={handleInBodyChange} placeholder="1800 kcal" />
                </div>
              </div>

              <div className="line-accent" />

              {/* Percepción del entrenamiento */}
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider">Tu experiencia en BM Calistenia</h3>
                  <p className="text-xs text-white/40 mt-1">Esto nos ayuda a entender cómo te está afectando el entrenamiento y personalizar mejor tus recomendaciones.</p>
                </div>

                <InputField
                  label="¿Cuántas veces por semana entrenas en BM en promedio (últimas 4 semanas)?"
                  name="sesiones_semana_bm"
                  value={form.sesiones_semana_bm}
                  onChange={handleChange}
                  type="number"
                  placeholder="3"
                />

                <TextareaField
                  label="Describe una sesión típica de Lunes o Martes (Pull & Push / Full Body)"
                  name="sesion_1_descripcion"
                  value={form.sesion_1_descripcion}
                  onChange={handleChange}
                  placeholder="¿Cómo te sientes durante esta sesión? ¿Qué ejercicios te cuestan más? ¿Cómo terminas?"
                  rows={4}
                  voice
                  onVoiceInput={appendVoiceText('sesion_1_descripcion')}
                />

                <TextareaField
                  label="Describe cómo vives una sesión de técnica (Jueves) o Handstand (Viernes)"
                  name="sesion_2_descripcion"
                  value={form.sesion_2_descripcion}
                  onChange={handleChange}
                  placeholder="¿Te resulta fácil o difícil? ¿Sientes progreso? ¿Hay algo que te frustre o que disfrutes?"
                  rows={4}
                  voice
                  onVoiceInput={appendVoiceText('sesion_2_descripcion')}
                />

                <TextareaField
                  label="¿Cómo afecta el entrenamiento en BM tu día a día? (energía, sueño, trabajo, ánimo)"
                  name="sesion_3_descripcion"
                  value={form.sesion_3_descripcion}
                  onChange={handleChange}
                  placeholder="¿Te sientes más activo o más cansado? ¿Nota tu cuerpo cambios? ¿Cómo influye en tu vida fuera del gimnasio?"
                  rows={4}
                  voice
                  onVoiceInput={appendVoiceText('sesion_3_descripcion')}
                />

                <div>
                  <label className="block text-sm text-white/60 mb-3">
                    ¿Qué tan cansado/a quedas después de una sesión típica? (1 = nada, 10 = agotado)
                  </label>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-white/30">1</span>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      name="nivel_cansancio"
                      value={form.nivel_cansancio ?? 5}
                      onChange={handleChange}
                      className="flex-1 accent-red-700"
                    />
                    <span className="text-xs text-white/30">10</span>
                    <span className="w-8 text-center text-white font-bold text-sm bg-red-900/40 border border-red-800/40 rounded-sm py-1">
                      {form.nivel_cansancio ?? 5}
                    </span>
                  </div>
                </div>

                <TextareaField
                  label="¿Cómo percibes tu rendimiento y progreso en BM Calistenia?"
                  name="percepcion_rendimiento"
                  value={form.percepcion_rendimiento}
                  onChange={handleChange}
                  placeholder="¿Sientes que mejoras? ¿Hay algo que sientes que te limita? ¿Qué cambiarías de cómo entrenas?"
                  rows={4}
                  voice
                  onVoiceInput={appendVoiceText('percepcion_rendimiento')}
                />
              </div>

              <div className="line-accent" />

              {/* Fotos opcionales */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider">Fotos de progreso <span className="text-white/30 font-normal">(opcional)</span></h3>
                <p className="text-xs text-white/40">Las fotos complementan el análisis de composición corporal.</p>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: 'frente' as const, ref: frenteRef, label: 'Frente' },
                    { key: 'lateral' as const, ref: lateralRef, label: 'Lateral' },
                    { key: 'espalda' as const, ref: espaldaRef, label: 'Espalda' },
                  ].map(({ key, ref, label }) => (
                    <div
                      key={key}
                      onClick={() => ref.current?.click()}
                      className="border border-dashed border-white/10 rounded-sm p-4 text-center cursor-pointer hover:border-red-700/40 transition-colors"
                    >
                      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFileChange(key)} />
                      {files[key] ? (
                        <p className="text-xs text-green-400">✓ {label}</p>
                      ) : (
                        <p className="text-xs text-white/30">{label}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 bg-red-950/40 border border-red-800/40 rounded-sm text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Navegación */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="px-6 py-3 text-sm text-white/40 hover:text-white disabled:opacity-0 transition-colors"
          >
            ← Anterior
          </button>

          {step < TOTAL_STEPS ? (
            <button
              onClick={handleNext}
              className="px-8 py-3 bg-red-700 hover:bg-red-600 text-white rounded-sm font-semibold text-sm transition-all hover:shadow-[0_0_20px_rgba(185,28,28,0.4)]"
            >
              Siguiente →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-3 bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white rounded-sm font-semibold text-sm transition-all hover:shadow-[0_0_20px_rgba(185,28,28,0.4)] flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Enviando...
                </>
              ) : 'Enviar evaluación'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
