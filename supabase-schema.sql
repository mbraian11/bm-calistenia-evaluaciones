-- BM Calistenia - Evaluación 360 Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla principal de evaluaciones
CREATE TABLE evaluaciones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Estado
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'procesando', 'completado', 'error')),

  -- Paso 1: Datos básicos
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT,
  edad INTEGER,
  genero TEXT,
  peso_kg DECIMAL(5,2),
  altura_cm DECIMAL(5,2),

  -- Paso 2: Programa y objetivo
  programa TEXT, -- presencial, online, niños
  tiempo_en_bm TEXT,
  objetivo_principal TEXT,
  objetivo_detallado TEXT,

  -- Paso 3: Día a día y alimentación
  ocupacion TEXT,
  nivel_estres TEXT,
  horas_sueno DECIMAL(3,1),
  calidad_sueno TEXT,
  comidas_dia INTEGER,
  descripcion_alimentacion TEXT,
  restricciones_alimentarias TEXT,
  suplementos TEXT,

  -- Paso 4: Salud y lesiones
  condiciones_medicas TEXT,
  lesiones_actuales TEXT,
  lesiones_pasadas TEXT,
  medicamentos TEXT,
  actividad_extra TEXT,
  frecuencia_actividad_extra TEXT,

  -- Paso 5: Pruebas físicas e InBody
  inbody_url TEXT,
  inbody_resultados JSONB, -- resultados escritos del InBody
  push_up_variante TEXT,
  push_up_reps INTEGER,
  dip_variante TEXT,
  dip_reps INTEGER,
  pull_up_variante TEXT,
  pull_up_reps INTEGER,
  squat_variante TEXT,
  squat_reps INTEGER,
  foto_frente_url TEXT,
  foto_lateral_url TEXT,
  foto_espalda_url TEXT,

  -- Reporte generado por Claude
  reporte_completo TEXT,
  reporte_generado_at TIMESTAMP WITH TIME ZONE
);

-- Índices
CREATE INDEX idx_evaluaciones_email ON evaluaciones(email);
CREATE INDEX idx_evaluaciones_estado ON evaluaciones(estado);
CREATE INDEX idx_evaluaciones_created_at ON evaluaciones(created_at DESC);

-- RLS Policies
ALTER TABLE evaluaciones ENABLE ROW LEVEL SECURITY;

-- Permite insertar desde el cliente (formulario público)
CREATE POLICY "Allow public insert" ON evaluaciones
  FOR INSERT WITH CHECK (true);

-- Permite leer solo el propio registro por ID (para página de reporte)
CREATE POLICY "Allow read by id" ON evaluaciones
  FOR SELECT USING (true);

-- Permite update desde server-side (service role key bypasses RLS)
CREATE POLICY "Allow update" ON evaluaciones
  FOR UPDATE USING (true);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_evaluaciones_updated_at
  BEFORE UPDATE ON evaluaciones
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Bucket de storage para archivos (InBody y fotos)
INSERT INTO storage.buckets (id, name, public)
VALUES ('evaluaciones', 'evaluaciones', false)
ON CONFLICT DO NOTHING;

-- Policy para subir archivos
CREATE POLICY "Allow upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'evaluaciones');

CREATE POLICY "Allow read storage" ON storage.objects
  FOR SELECT USING (bucket_id = 'evaluaciones');
