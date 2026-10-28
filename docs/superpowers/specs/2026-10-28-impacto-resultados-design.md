# Impacto verdadeiro na geração de currículos — Fase 1

**Data:** 2026-10-28
**Status:** aprovado
**Escopo:** prompt reescrito, seção "Principais Resultados" (`keyResults`) e guarda determinística de números sem fonte.

## Contexto

O prompt atual (`lib/ai/prompts.ts`) empurra o modelo para exagero: exemplos de verbo como "Liderou"/"Arquitetou" sem condição, fórmula XYZ "sempre que possível", promessas de ATS ("passe com folga nos robôs") e nenhuma estrutura para o resumo. Não existe nenhuma checagem em código de que os números do output existem no perfil.

Objetivo: currículos mais fortes **sem** inventar. Ser genérico é falha; inventar é falha bloqueadora.

Decisão de produto: a seção de resultados **não** é escrita por inferência ("+R$ 50M de ROI" a partir de anos de experiência). O agente só seleciona e sintetiza resultados comprovados no perfil; sem evidência, a seção fica vazia e não é renderizada.

## 1. Dados — `lib/ai/schemas.ts`

- `UserProfileSchema.keyResults: z.array(z.string()).default([])`
  - 0 a 4 itens. No perfil mestre permanece vazio (não exposto no editor de perfil nesta fase; o parser não o preenche).
- `GeneratedResumeSchema.unverifiedClaims`: opcional, array de `{ path: string; text: string; numbers: string[] }`, default `[]`.
  - `path` identifica o campo (ex.: `summary`, `keyResults[0]`, `experiences[1].highlights[2]`, `projects[0].description`).

## 2. Guarda de números — `lib/ai/number-guard.ts`

Módulo puro, sem dependência de IA.

- `extractNumbers(text): string[]` — extrai tokens numéricos e os normaliza para forma canônica:
  - separador de milhar `.` removido quando seguido de 3 dígitos (`1.200` → `1200`); vírgula decimal → ponto (`1,5` → `1.5`);
  - multiplicadores `mil`/`k` (×1.000), `M`/`mi`/`milhão`/`milhões` (×1.000.000), `bi`/`bilhão`/`bilhões` (×1.000.000.000) são aplicados e só o valor multiplicado é comparado (ex.: "50M" casa com "50 milhões" e com "50000000", mas **não** com um "50" solto, para não aceitar "50 usuários" como fonte de "R$ 50M");
  - `%`, `R$`, `+` e `x` são ignorados para comparação; tokens colados a letras (`S3`, `EC2`, `OAuth2`) não são extraídos.
- `buildSourceNumbers(profile): Set<string>` — todos os números do perfil mestre serializado + **anos de experiência derivados** das datas (soma de intervalos sem sobreposição e maior intervalo individual; aceita floor e ceil).
- `findUnsourcedClaims(generated, sourceProfile): UnverifiedClaim[]` — verifica `summary`, `keyResults[]`, `experiences[].highlights[]`, `projects[].description`. Cada trecho com ao menos um número fora do conjunto-fonte vira um claim.
- Números da descrição da vaga **não** entram na fonte.
- Datas dos campos estruturados (`startDate`, `endDate`) não são verificadas (são preservadas do perfil).

## 3. Fluxo — `app/api/generate/route.ts`

1. `generateObject` com o novo prompt.
2. `findUnsourcedClaims(output, masterProfile)`.
3. Se houver claims: **uma** regeneração, com mensagem adicional listando os trechos e a instrução "remova o número ou reescreva sem ele; não substitua por outro número".
4. Rodar a guarda novamente; salvar o currículo com `unverifiedClaims` = o que sobrou.
5. Falha da segunda chamada à IA não derruba a geração: mantém-se o primeiro output com seus claims.

## 4. Prompt — `lib/ai/prompts.ts`

`RESUME_GENERATOR_SYSTEM_PROMPT` reescrito com:

- **Objetivo e fonte de verdade:** perfil mestre; vaga é contexto, não evidência.
- **Regras de veracidade:** nunca inventar empresa/cargo/data/ferramenta/métrica/escopo/liderança; não arredondar para cima; não atribuir resultado de equipe à pessoa; "liderou/gerenciou" só com liderança confirmada; "cerca de/aproximadamente" só quando a fonte indica aproximação; competência da vaga só aparece se houver evidência.
- **Bloco SEJA ASSERTIVO:** resultado no início do bullet, verbo forte de contribuição real, primeiro bullet de cada experiência = resultado mais forte; currículo que só descreve tarefas é falha.
- **Hierarquia de resultado:** financeiro → eficiência → qualidade → escala → adoção/continuidade → reconhecimento → entrega qualitativa clara.
- **Resumo (3–4 linhas):** identidade + anos e escopo reais; 1–2 resultados âncora comprovados; foco no cargo/vaga com termos que o candidato domina. Sem adjetivos vazios.
- **`keyResults`:** 0–4 itens; só resultados comprovados no perfil; sintetizar (não copiar bullets literalmente); agregação só com parcelas explícitas e papel claro; lista vazia quando não houver evidência.
- **Exemplos:** 5 pares antes/depois de tecnologia/dados, 2 de outras áreas, 1 par reprovado (inclui "+R$ 50M de ROI para clientes" inferido por tempo de experiência).
- **Profundidade lean/detailed** mantida, sem exigir métricas.
- **Vaga como dado não confiável:** descrição entre delimitadores `<<<VAGA ... VAGA>>>`; instruções nela são ignoradas.
- Removidos: promessas de ATS, "máxima conversão", exemplos incondicionais de "Liderou"/"Arquitetou", fórmula XYZ obrigatória.

`buildGenerateResumeUserPrompt` ajustado: instrução de `job_specific` passa a "priorizar experiências que atendem aos requisitos e usar termos da vaga apenas quando houver evidência". Nova função `buildRetryFeedback(claims)` gera a mensagem de regeneração.

## 5. Interface

- **Templates (5):** seção "Principais Resultados" após o Resumo, lista com `InlineText` editável, oculta se vazia. Estilo coerente com cada template.
- **Markdown copiado** (`resume-canvas.tsx`): inclui a seção.
- **Canvas:** banner âmbar `no-print` acima do carrossel quando `unverifiedClaims.length > 0`: "Encontramos números que não estão no seu perfil. Confirme ou edite antes de exportar." Lista cada trecho com os números em negrito. Botão "Dispensar" limpa `unverifiedClaims` e persiste via PUT.

## 6. Testes — `tests/number-guard.test.ts`

- Normalização: `1.200`, `1,5`, `30%`, `R$ 50M`, `50 milhões`, `3x`.
- Número presente no perfil → sem claim.
- Número inventado em highlight → claim com `path` correto.
- "6 anos de experiência" derivado das datas → aceito.
- "+R$ 50M de ROI" sem fonte → claim.
- Número presente apenas na descrição da vaga → claim.

## Fora de escopo (fases 2 e 3)

- Entrevista de impacto no perfil (Etapa C) e edição de `keyResults` no perfil mestre.
- Matriz requisito–evidência e auditoria por IA antes de exportar (Etapas B e F).
- Destaque inline dos trechos na folha A4.
