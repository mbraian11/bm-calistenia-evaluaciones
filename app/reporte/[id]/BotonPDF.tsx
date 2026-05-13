'use client'

export default function BotonPDF({ nombre }: { nombre: string }) {
  const handlePrint = () => {
    const title = document.title
    document.title = `Reporte BM Calistenia — ${nombre}`
    window.print()
    document.title = title
  }

  return (
    <button
      onClick={handlePrint}
      className="no-print inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 hover:border-white/20 rounded-sm text-sm text-white/70 hover:text-white transition-all"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 004.561 21h14.878a2 2 0 001.94-1.515L22 17" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Descargar PDF
    </button>
  )
}
