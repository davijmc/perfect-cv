# Design Spec: Adequação Total à Vaga, Compatibilidade ATS e Edição Completa no Canvas

**Data:** 2026-10-30
**Status:** Aprovado em Brainstorming (Abordagem A)
**Escopo:** Revisão ponta a ponta do fluxo de geração de currículos, prompts sem contradições, completude e semântica ATS nos 5 templates, correção de exportação PDF/Markdown, edição inline total no Canvas e validador ATS determinístico em tempo real.

---

## 1. Contexto e Problemas Identificados na Auditoria

1. **Contradições nos Prompts (`lib/ai/prompts.ts`)**:
   - `buildGenerateResumeUserPrompt` instrui que o perfil mestre é a *"única fonte de fatos"*, enquanto `RESUME_GENERATOR_SYSTEM_PROMPT` e o bloco `job_specific` instruem assumir que o candidato possui todas as habilidades e experiências exigidas pela vaga. Essa contradição reduz a assertividade da LLM ou gera inconsistências.
   - No modo `generic` (`targetRole`), o prompt limitava a adaptação apenas aos fatos já descritos, sem posicionar o candidato estrategicamente para o cargo pretendido.
   - `buildRetryFeedback` era código morto importado em `app/api/generate/route.ts`.

2. **Lacunas no Fluxo do Gerador (`GeneratorWizard` e `/api/generate`)**:
   - Se o usuário colar o link da vaga sem clicar em "Buscar Vaga", ou colar a descrição da vaga e clicar direto em "Gerar Currículo com Resultados" sem clicar antes em "Diagnosticar Requisitos", o currículo é gerado com `jobAnalysis = null`, perdendo o mapeamento estruturado dos requisitos da vaga.

3. **Omissão de Seções e Ruídos para Filtros ATS nos 5 Templates (`components/resume-view/templates/*`)**:
   - `modern-minimal`: não renderizava `projects` nem `portfolioUrl`.
   - `executive-slate`: não renderizava `certifications`, `skills.softSkills`, `experiences[].technologies` nem `portfolioUrl`.
   - `tech-charcoal`: não renderizava `languages`, `certifications`, `skills.softSkills` nem `portfolioUrl`, além de cortar descrições de projetos com `truncate`.
   - `classic-serif`: não renderizava `projects`, `certifications`, `skills.softSkills`, `experiences[].technologies` nem `portfolioUrl`.
   - `nordic-warm`: não renderizava `projects`, `certifications`, `languages`, `skills.softSkills` nem `portfolioUrl`.
   - Emojis Unicode (`📍`, `✉️`, `📞`, `🔗`, `💻`) e marcadores (`##`, `>`) nos cabeçalhos e títulos não padronizados (`Sobre`, `Perfil Executivo`, `Trajetória Profissional`) prejudicavam parsers ATS.

4. **Corte no PDF em 1 Página e Markdown Incompleto (`app/globals.css` e `resume-canvas.tsx`)**:
   - A classe `.print-force-one-page .a4-page` aplicava `height: 297mm !important; overflow: hidden !important` antes da redução proporcional por `transform: scale(...)`, cortando o conteúdo excedente na impressão em PDF.
   - O botão "Copiar Markdown" ignorava `toolsAndCloud`, `softSkills`, `projects`, `certifications` e `languages`.

5. **Edição Pós-Geração Restrita no Canvas**:
   - Apenas `fullName`, `title`, `summary`, `keyResults` e `highlights` eram editáveis via `InlineText`. Campos adaptados pela IA (como `location`, `role`, `technologies`, `skills`, `projects`, `education`, `languages` e `certifications`) não podiam ser editados diretamente na folha.

---

## 2. Arquitetura da Solução (Abordagem A — Pipeline Unificado + Validador ATS Determinístico)

### 2.1 Prompts Enxutos e Direcionados (`lib/ai/prompts.ts`)
- **Regra Clara de Âncoras Fatuais vs. Adequação Total**:
  - **Âncoras Imutáveis**: Nome completo, e-mail, telefone, nomes das empresas (`experiences[].company`), períodos trabalhados (`startDate`, `endDate`, `isCurrent`), instituições de ensino (`education[].institution`) e cursos/graus (`degree`, `fieldOfStudy`). A IA nunca inventa empresas ou faculdades.
  - **Zonas de Adequação e Posicionamento**:
    - `personalInfo.title`: alinhado ao título exato da vaga ou cargo alvo.
    - `personalInfo.location`: preserva a cidade do candidato e, se a vaga exigir outra localidade/modelo presencial, adiciona disponibilidade de forma limpa.
    - `summary`: 3 a 4 linhas diretas com senioridade/identidade alinhada à vaga, competências técnicas centrais exigidas pela vaga e 1–2 resultados-âncora.
    - `keyResults`: 2 a 4 conquistas de alto impacto com métricas realistas e contextualizadas para a vaga (revisáveis pelo usuário no Canvas).
    - `experiences[].role`, `highlights` e `technologies`: cada bullet segue `Verbo de Ação Forte no Passado + Entrega Técnica Integrando Requisitos da Vaga + Resultado/Impacto`, demonstrando domínio prático de todos os requisitos da vaga dentro das experiências reais do candidato.
    - `skills` (`technical`, `toolsAndCloud`, `softSkills`): incorpora todas as palavras-chave técnicas, ferramentas e competências comportamentais da vaga (incluindo siglas e termos exatos para matching ATS), priorizando as mais relevantes no topo.
    - `projects`: destaca e alinha a descrição e as tecnologias dos projetos do candidato ao contexto da vaga.
- **Remoção de contradições e código morto**:
  - Remover a expressão `(única fonte de fatos)` de `buildGenerateResumeUserPrompt`.
  - Alinhar tanto `mode === 'job_specific'` quanto `mode === 'generic'` (Cargo Alvo) para posicionar o candidato como ideal para o alvo.
  - Remover `buildRetryFeedback` não utilizado.

### 2.2 Garantias no Fluxo de Geração (`GeneratorWizard` e `/api/generate`)
- **No `GeneratorWizard`**:
  - Se o usuário estiver no modo `job_specific`, tiver preenchido uma `jobUrl` mas ainda não tiver extraído a descrição (`!jobDescription.trim()`), o clique em Diagnosticar ou Gerar faz a extração automática antes de prosseguir.
- **No `POST /api/generate`**:
  - Se `mode === 'job_specific'`, houver `targetJobDetails.rawDescription` e `jobAnalysis` não tiver sido enviado pelo cliente, o backend ou o fluxo garante que a vaga seja integralmente mapeada e adequada.

### 2.3 Padronização ATS e Completude nos 5 Templates (`components/resume-view/templates/*`)
- **100% das seções renderizadas em todos os 5 templates** (sempre que a respectiva lista/campo não estiver vazia):
  1. Cabeçalho Pessoal (`fullName`, `title`, `location`, `email`, `phone`, `linkedinUrl`, `githubUrl`, `portfolioUrl`, `photoUrl` opcional).
  2. `Resumo Profissional` (`summary`)
  3. `Principais Resultados` (`keyResults`)
  4. `Experiência Profissional` (`experiences` com `role`, `company`, `startDate`, `endDate`, `location`, `highlights`, `technologies`)
  5. `Projetos Relevantes` (`projects` com `name`, `description`, `technologies`, `link`) — sem `truncate` que esconda texto.
  6. `Formação Acadêmica` (`education` com `degree`, `fieldOfStudy`, `institution`, `startDate`, `endDate`)
  7. `Competências e Tecnologias` (`skills.technical`, `skills.toolsAndCloud`, `skills.softSkills`)
  8. `Idiomas e Certificações` (`languages` e `certifications`)
- **Higiene de Extração ATS**:
  - Substituir emojis Unicode (`📍`, `✉️`, `📞`, `🔗`, `💻`) e prefixos markdown (`##`, `>`) por separadores tipográficos limpos ou elementos decorativos CSS/SVG com `aria-hidden="true"`, evitando caracteres estranhos na camada de texto do PDF.
  - Usar títulos de seção semânticos (`<h2>`) reconhecidos por todos os sistemas ATS em português.

### 2.4 Edição Inline Completa no Canvas (`components/resume-view/`)
- Todos os campos renderizados nos 5 templates usam `InlineText` (ou edição inline de lista/texto):
  - Contato: `fullName`, `title`, `location`, `email`, `phone`, `linkedinUrl`, `githubUrl`, `portfolioUrl`.
  - Resumo: `summary`.
  - Principais Resultados: cada item de `keyResults[]`.
  - Experiências: `role`, `company`, `location`, `startDate`, `endDate`, cada item de `highlights[]`, e a linha de `technologies` (editável como lista separada por vírgula).
  - Projetos: `name`, `description`, e `technologies` (editável como lista separada por vírgula).
  - Educação: `degree`, `fieldOfStudy`, `institution`, `startDate`, `endDate`.
  - Competências: `skills.technical`, `skills.toolsAndCloud`, `skills.softSkills` (editáveis inline como listas separadas por vírgula, permitindo adicionar/remover ou renomear qualquer skill direto na folha).
  - Idiomas e Certificações: editáveis inline.
- Qualquer edição em `content` recalcula automaticamente `unverifiedClaims` (ou permite dispensar) e atualiza a auditoria ATS em tempo real.

### 2.5 Validador e Checklist ATS Determinístico (`lib/ai/ats-validator.ts` + `components/resume-view/ats-checklist-panel.tsx`)
- Módulo puro e determinístico `evaluateAtsCompliance(resume: GeneratedResume): AtsValidationReport`:
  1. **Score ATS (0–100)** calculado com base em critérios objetivos e auditáveis:
     - **Dados de Contato Essenciais (15 pts)**: Nome, e-mail, telefone/localização e link profissional (LinkedIn/GitHub/Portfólio).
     - **Estrutura e Seções Essenciais (20 pts)**: Presença de Título Alvo, Resumo Profissional (entre 120 e 600 caracteres), Experiência Profissional com verbos de ação, Formação Acadêmica e Competências Técnicas.
     - **Densidade de Impacto e Métricas (15 pts)**: Presença de resultados quantificados / métricas nos bullets ou em `keyResults`.
     - **Cobertura de Requisitos e Palavras-Chave da Vaga (50 pts quando houver vaga/cargo alvo, ou redistribuído quando geral)**:
       - Extrai os termos-chave dos requisitos diagnosticados (`jobAnalysis.requirements`) e/ou palavras-chave técnicas da descrição da vaga e verifica quantos estão efetivamente presentes no texto final do currículo (`summary`, `keyResults`, `experiences`, `skills`, `projects`).
       - Lista explicitamente as **Keywords Encontradas** (verde) e eventuais **Keywords Ausentes** (âmbar, com botão de 1 clique para injetar nas Competências Técnicas caso o usuário queira).
- **Componente Visual no Canvas (`AtsChecklistPanel`)**:
  - Exibe na barra superior/painel do Canvas (oculto na impressão `.no-print`) o Score ATS em tempo real, o status dos critérios estruturais, a cobertura de palavras-chave da vaga e o alerta de revisão de veracidade (`UnverifiedClaimsBanner`).

### 2.6 Correção da Exportação PDF (1 Página) e Markdown (`app/globals.css` e `resume-canvas.tsx`)
- Em `app/globals.css` e `resume-canvas.tsx`:
  - Quando `forceOnePage` está ativo e `pageHeight > A4_HEIGHT_PX`, remover `height: 297mm !important; overflow: hidden !important;` do `.a4-page` não escalado e aplicar `zoom` / `transform: scale(...)` com compensação de altura para que o conteúdo inteiro caiba perfeitamente em 1 folha A4 sem truncar o final da página.
- Em `handleCopyMarkdown`:
  - Incluir todas as seções: Contato completo (com Portfólio), Resumo Profissional, Principais Resultados, Experiência Profissional, Projetos Relevantes, Formação Acadêmica, Competências (Técnicas, Ferramentas & Cloud, Interpessoais), Certificações e Idiomas.

---

## 3. Estratégia de Testes e Verificação
1. `tests/ats-validator.test.ts`: testa cálculo de score ATS, detecção de seções, detecção de keywords da vaga presentes/ausentes e recomendações.
2. `tests/templates.test.ts`: verifica que **todos os 5 templates** renderizam 100% das seções (`summary`, `keyResults`, `experiences`, `projects`, `education`, `skills.technical`, `skills.toolsAndCloud`, `skills.softSkills`, `languages`, `certifications`, `portfolioUrl`), sem emojis Unicode nos contatos e com cabeçalhos ATS padrão.
3. `tests/prompts.test.ts` e `tests/analyze-prompts.test.ts`: verifica ausência de contradições (`única fonte de fatos` removido) e presença das diretrizes de âncoras imutáveis + adequação total.
4. `npx tsc --noEmit` e `npm test` com 100% dos testes passando.
