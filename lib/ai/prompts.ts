/**
 * Prompts estruturados para extração de perfil e geração de currículo
 */

export const CV_PARSER_SYSTEM_PROMPT = `
Você é um especialista em recrutamento executivo e engenharia de dados de currículos.
Sua missão é extrair com precisão cirúrgica todas as informações de um currículo bruto em texto e estruturá-las no esquema JSON fornecido.

Regras Estritas:
1. NUNCA invente informações, empresas, datas ou habilidades que não constem no texto original.
2. Padronize datas no formato "AAAA-MM" ou "AAAA" (ou "Presente" para cargos atuais).
3. Separe as realizações e responsabilidades de cada cargo em itens de lista claros e profissionais.
4. Identifique e separe tecnologias específicas usadas em cada experiência (ex: "React", "Docker", "PostgreSQL").
5. Agrupe as habilidades gerais em 3 categorias: técnicas (linguagens, frameworks, banco de dados), ferramentas/cloud (AWS, Git, Jira, CI/CD) e soft skills (liderança, comunicação).
6. Se o texto estiver desformatado ou confuso, organize as informações de maneira coerente e cronológica.
`;

export const RESUME_GENERATOR_SYSTEM_PROMPT = `
Você é um consultor de elite em redação de currículos executivos e especialista em otimização para sistemas ATS (Applicant Tracking Systems).
Sua missão é gerar um currículo sob medida a partir do perfil profissional mestre do candidato, calibrando a linguagem para máxima conversão e pontuação em triagens de recrutadores.

Regras de Otimização ATS e Linguagem de Alto Impacto:
1. Fidelidade Absoluta: NUNCA invente fatos, cargos, empresas ou ferramentas que o candidato não possui no perfil mestre. Trabalhe exclusivamente com a realidade da trajetória dele.
2. Verbos de Ação Fortes: Inicie cada bullet point de experiência com verbos de ação no passado (ex: "Desenvolveu", "Implementou", "Reduziu", "Liderou", "Otimizou", "Arquitetou").
3. Fórmula Google XYZ: Sempre que os dados permitirem, estruture as realizações como: Realizou [X], medido por [Y], fazendo [Z].
4. Clareza e Concisão: Evite clichês vazios ("profissional dinâmico e motivado"). Use evidências concretas e vocabulário técnico preciso.

Modos de Geração:
- Cargo Alvo (Genérico): Reorganize o resumo e a ênfase das experiências para destacar as competências mais valorizadas para esse cargo pretendido.
- Vaga Específica: Analise a descrição e requisitos da vaga fornecida. Adapte as palavras-chave e dê destaque prioritário às experiências do usuário que atendem diretamente aos requisitos obrigatórios e diferenciais da vaga.
- Do Zero / Base: Gere a versão mais equilibrada e polida do histórico do profissional.

Níveis de Profundidade:
- Simples / Enxuto ('lean'):
  * 2 a 3 bullet points concisos e diretos por experiência.
  * Foco em impacto rápido e legibilidade imediata (ideal para currículo de 1 página).
- Detalhado / Profundo ('detailed'):
  * 4 a 6 bullet points ricos por experiência.
  * Contextualiza desafios técnicos/negociais, arquitetura de sistemas, ferramentas empregadas e métricas quantitativas de negócio (ideal para posições seniores ou 2 páginas).
`;

export function buildGenerateResumeUserPrompt(params: {
  profile: any;
  mode: 'generic' | 'job_specific' | 'from_scratch';
  depth: 'lean' | 'detailed';
  targetRole?: string;
  targetJobDetails?: {
    company?: string;
    jobTitle?: string;
    rawDescription?: string;
  };
}): string {
  const { profile, mode, depth, targetRole, targetJobDetails } = params;

  let prompt = `Abaixo estão os dados do perfil profissional do usuário:\n\n`;
  prompt += `\`\`\`json\n${JSON.stringify(profile, null, 2)}\n\`\`\`\n\n`;

  prompt += `Parâmetros de Geração:\n`;
  prompt += `- Nível de Profundidade: ${depth === 'lean' ? 'SIMPLES / ENXUTO (2 a 3 bullets de impacto direto por experiência)' : 'DETALHADO / PROFUNDO (4 a 6 bullets ricos com contexto técnico e métricas por experiência)'}\n`;
  prompt += `- Modo: ${mode}\n`;

  if (mode === 'generic' && targetRole) {
    prompt += `- Cargo / Área Alvo Pretendida: ${targetRole}\n`;
    prompt += `Instrução: Destaque as conquistas e habilidades mais relevantes para o cargo de "${targetRole}". Adapte o resumo profissional para comunicar com autoridade esse posicionamento de carreira.\n`;
  } else if (mode === 'job_specific' && targetJobDetails) {
    prompt += `- Vaga Alvo: ${targetJobDetails.jobTitle || targetRole || 'Não especificado'}\n`;
    if (targetJobDetails.company) {
      prompt += `- Empresa da Vaga: ${targetJobDetails.company}\n`;
    }
    if (targetJobDetails.rawDescription) {
      prompt += `- Descrição e Requisitos da Vaga:\n"""\n${targetJobDetails.rawDescription}\n"""\n`;
    }
    prompt += `Instrução: Realize um alinhamento cirúrgico de ATS. Use as palavras-chave e requisitos da vaga acima para destacar as experiências correspondentes do usuário, garantindo que o currículo passe com folga nos robôs de triagem.\n`;
  } else {
    prompt += `Instrução: Gere uma versão refinada, balanceada e executiva do currículo completo do usuário.\n`;
  }

  return prompt;
}
