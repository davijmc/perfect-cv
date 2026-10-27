import Link from 'next/link';
import { 
  Settings, 
  User, 
  Sparkles, 
  Library, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Cpu, 
  FileUp, 
  Palette
} from 'lucide-react';

export default function HomePage() {
  const steps = [
    {
      title: '1. Configure sua IA',
      description: 'Escolha seu provedor preferido (Google Gemini, OpenAI, Claude, Groq, Ollama ou OmniRoute) e salve sua chave localmente.',
      href: '/settings',
      icon: Settings,
      color: 'from-blue-500 to-indigo-600',
    },
    {
      title: '2. Preencha seu Perfil',
      description: 'Preencha seus dados ou faça upload do seu currículo atual (PDF ou Word) para preenchimento automático via IA.',
      href: '/profile',
      icon: User,
      color: 'from-indigo-500 to-purple-600',
    },
    {
      title: '3. Gere Currículos Sob Medida',
      description: 'Adapte para um cargo genérico ou cole o link/descrição de uma vaga específica para calibragem ATS e escolha entre 5 estilos visuais.',
      href: '/generator',
      icon: Sparkles,
      color: 'from-purple-500 to-pink-600',
    },
    {
      title: '4. Biblioteca e Exportação',
      description: 'Acesse seu histórico de versões, edite o texto inline e baixe em PDF vetorial de alta definição para envio imediato.',
      href: '/resumes',
      icon: Library,
      color: 'from-pink-500 to-rose-600',
    },
  ];

  return (
    <div className="space-y-10 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 px-6 py-14 text-white shadow-xl sm:px-12 sm:py-20">
        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-blue-200 backdrop-blur-md">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>100% Local • Dados e Chaves Protegidos no seu Computador</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Currículos profissionais de alta conversão, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">turbinados por IA</span>
          </h1>

          <p className="text-lg text-slate-300 sm:text-xl">
            Pare de perder horas reformatando documentos. Suba seu currículo atual, informe a vaga desejada e gere versões sob medida, calibradas para passar nos robôs de triagem (ATS).
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <Link
              href="/generator"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-600 active:scale-95"
            >
              <Sparkles className="h-5 w-5" />
              <span>Gerar Novo Currículo</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/settings"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-6 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 active:scale-95"
            >
              <Settings className="h-5 w-5" />
              <span>Configurar Provedor de IA</span>
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 right-40 h-80 w-80 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
      </section>

      {/* Feature Steps Grid */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Como funciona o Perfect CV</h2>
          <p className="text-slate-600">Fluxo em 4 passos simples para acelerar suas candidaturas</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <Link
                key={step.title}
                href={step.href}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
              >
                <div className="space-y-4">
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr ${step.color} text-white shadow-md`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="pt-6 flex items-center gap-1 text-sm font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
                  <span>Acessar</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Destaques Técnicos */}
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Diferenciais da Plataforma</h3>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-start gap-3">
            <Cpu className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Multi-Provedor de LLM</h4>
              <p className="text-xs text-slate-600 mt-1">Compatível com Gemini, OpenAI, Claude, Groq, Ollama e OmniRoute.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <FileUp className="h-5 w-5 text-indigo-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Importação Automática</h4>
              <p className="text-xs text-slate-600 mt-1">Carregue PDF ou DOCX antigo e deixe a IA preencher seu perfil mestre.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Palette className="h-5 w-5 text-purple-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Carrossel de 5 Estilos</h4>
              <p className="text-xs text-slate-600 mt-1">Alterne entre templates profissionais calibrados para leitura visual e ATS.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Edição Inline & PDF</h4>
              <p className="text-xs text-slate-600 mt-1">Ajuste qualquer texto na folha A4 e exporte em alta resolução.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
