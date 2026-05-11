import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-700 rounded-sm flex items-center justify-center">
              <span className="text-white font-bold text-sm">BM</span>
            </div>
            <span className="font-semibold tracking-wide text-sm uppercase">BM Calistenia</span>
          </div>
          <Link href="/evaluacion" className="text-sm text-red-400 hover:text-red-300 transition-colors">
            Iniciar evaluación →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(185,28,28,0.15)_0%,_transparent_60%)] pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-red-700 to-transparent" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-red-950/40 border border-red-800/30 rounded-full px-4 py-1.5 text-xs text-red-400 uppercase tracking-widest mb-8">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            Programa exclusivo BM Calistenia
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6">
            Evaluación
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800">
              360°
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-4 leading-relaxed">
            Un análisis completo de tu composición corporal, rendimiento físico y estilo de vida,
            diseñado para maximizar tus resultados en calistenia.
          </p>

          <div className="line-accent w-40 mx-auto my-8" />

          <p className="text-sm text-white/40 max-w-xl mx-auto mb-12">
            Nuestro sistema utiliza inteligencia artificial para generar un reporte personalizado
            basado en tus datos de InBody, pruebas físicas y contexto de vida.
          </p>

          <Link
            href="/evaluacion"
            className="inline-flex items-center gap-3 bg-red-700 hover:bg-red-600 text-white px-8 py-4 rounded-sm font-semibold text-lg transition-all duration-200 hover:scale-105 hover:shadow-[0_0_30px_rgba(185,28,28,0.4)] group"
          >
            Comenzar evaluación
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>

          <p className="mt-4 text-xs text-white/20">Toma aproximadamente 10 minutos completar</p>
        </div>
      </section>

      {/* Qué incluye */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs text-red-500 uppercase tracking-widest mb-3">El proceso</p>
          <h2 className="font-display text-3xl md:text-4xl text-center mb-16">
            ¿Qué incluye tu evaluación?
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                num: '01',
                title: 'Datos y composición',
                desc: 'Análisis de tu InBody, métricas corporales y evolución de tu composición.',
              },
              {
                num: '02',
                title: 'Rendimiento físico',
                desc: 'Evaluación de push-ups, dips, pull-ups y squats en tus variantes actuales.',
              },
              {
                num: '03',
                title: 'Reporte personalizado',
                desc: 'Análisis generado por IA con recomendaciones específicas para tu situación.',
              },
            ].map((item) => (
              <div key={item.num} className="bg-white/[0.02] border border-white/5 p-6 rounded-sm hover:border-red-800/30 transition-colors">
                <span className="text-5xl font-display font-bold text-red-800/30">{item.num}</span>
                <h3 className="text-lg font-semibold mt-3 mb-2">{item.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pasos */}
      <section className="py-20 px-6 bg-white/[0.01] border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-xs text-red-500 uppercase tracking-widest mb-3">Cómo funciona</p>
          <h2 className="font-display text-3xl md:text-4xl text-center mb-16">
            5 pasos simples
          </h2>

          <div className="space-y-4">
            {[
              { step: 1, label: 'Datos personales y métricas básicas' },
              { step: 2, label: 'Tu programa en BM y objetivo principal' },
              { step: 3, label: 'Día a día, sueño y alimentación' },
              { step: 4, label: 'Salud, lesiones y actividad adicional' },
              { step: 5, label: 'Resultados de InBody y pruebas físicas' },
            ].map((s) => (
              <div key={s.step} className="flex items-center gap-4 p-4 border border-white/5 rounded-sm bg-white/[0.01]">
                <div className="w-8 h-8 flex-shrink-0 bg-red-900/40 border border-red-800/40 rounded-sm flex items-center justify-center text-red-400 text-sm font-bold">
                  {s.step}
                </div>
                <span className="text-white/70">{s.label}</span>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/evaluacion"
              className="inline-flex items-center gap-3 bg-red-700 hover:bg-red-600 text-white px-8 py-4 rounded-sm font-semibold transition-all duration-200 hover:shadow-[0_0_30px_rgba(185,28,28,0.4)] group"
            >
              Iniciar ahora
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center">
        <p className="text-xs text-white/20">© 2024 BM Calistenia. Todos los derechos reservados.</p>
      </footer>
    </main>
  )
}
