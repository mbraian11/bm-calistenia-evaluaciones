# BM Calistenia — Portal de Evaluación 360°

Portal web para evaluaciones integrales de alumnos de BM Calistenia. Incluye formulario multi-paso, análisis con IA (Claude), almacenamiento en Supabase y email automático con Resend.

## Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** (negro + rojo #B91C1C, Playfair Display + Inter)
- **Supabase** — base de datos + storage de archivos
- **Claude API** (claude-opus-4-7) — generación del reporte
- **Resend** — email automático al alumno

## Estructura de páginas

| Ruta | Descripción |
|------|-------------|
| `/` | Landing page premium |
| `/evaluacion` | Formulario multi-paso (5 pasos) |
| `/procesando?id=...` | Pantalla de espera con polling |
| `/reporte/[id]` | Reporte completo del alumno |
| `/admin` | Dashboard con todos los alumnos |

## Setup

### 1. Variables de entorno

Edita `.env.local` con tus valores reales:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Resend
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=BM Calistenia <evaluaciones@tudominio.com>

# App URL (cambiar en producción)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Supabase — crear la base de datos

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ve a **SQL Editor** y ejecuta el contenido de `supabase-schema.sql`
3. Ve a **Storage** → verifica que existe el bucket `evaluaciones`
4. Copia la URL y las claves en `.env.local`

### 3. Resend — configurar emails

1. Crea cuenta en [resend.com](https://resend.com)
2. Crea una API key
3. Verifica tu dominio (o usa el dominio sandbox de Resend para pruebas)
4. Actualiza `RESEND_FROM_EMAIL` con tu email verificado

### 4. Correr en desarrollo

```bash
# Activar Node.js (si usas nvm)
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"

npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

### 5. Build para producción

```bash
npm run build
npm start
```

## Flujo de datos

```
Alumno llena formulario (5 pasos)
         ↓
POST /api/submit
  → Guarda en Supabase (estado: pendiente)
  → Sube archivos a Supabase Storage
  → Llama /api/generate-report en background
         ↓
/procesando — polling cada 3s a GET /api/generate-report
         ↓
POST /api/generate-report
  → Marca estado: procesando
  → Construye prompt con todos los datos del alumno
  → Llama Claude API (claude-opus-4-7)
  → Guarda reporte en Supabase
  → Marca estado: completado
  → Llama /api/send-email en background
         ↓
/reporte/[id] — reporte completo visible en pantalla
         ↓
POST /api/send-email
  → Envía email al alumno con link al reporte (Resend)
```

## Acceso admin

Navega a `/admin` para ver todos los alumnos, estados y acceder a reportes completados.

> Para producción, protege `/admin` con autenticación (middleware de Next.js + Supabase Auth).
