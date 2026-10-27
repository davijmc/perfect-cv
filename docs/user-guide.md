# Guia do Usuário: Perfect CV

Este guia orienta você em todos os recursos do **Perfect CV** para acelerar suas candidaturas e criar currículos profissionais otimizados para triagem automatizada (ATS).

---

## 1. Configurando sua IA

Acesse a aba **Configurações** no menu superior:

1. **Escolha o Provedor**:
   * **Google Gemini (Recomendado)**: Oferece cota gratuita muito generosa no [Google AI Studio](https://aistudio.google.com/app/apikey).
   * **OpenAI**: Para quem já possui saldo ou chave na plataforma da OpenAI.
   * **Anthropic Claude**: Ideal para estilo executivo refinado.
   * **Groq**: Gera em milissegundos usando modelos abertos Llama 3.
   * **Ollama (Local)**: Para quem prefere rodar 100% offline e sem custos na GPU/CPU local (`http://localhost:11434/v1`).
   * **OmniRoute / OpenRouter**: Para quem utiliza um gateway unificado de modelos.
2. **Insira a Chave de API** e clique em **"Testar Conexão"**.
3. Quando a mensagem de confirmação verde aparecer, clique em **"Salvar Alterações"**.

> **Privacidade Garantida**: Suas chaves de API ficam salvas exclusivamente no arquivo local `data/config.json`, que está protegido no `.gitignore`. Nenhuma informação é enviada a servidores além da própria API que você configurou.

---

## 2. Preenchendo seu Perfil Mestre

Acesse a aba **Meu Perfil**:

* **Importação Rápida**: Arraste um currículo existente em **PDF**, **DOCX** ou **TXT** para a caixa de upload. A IA lerá o documento e preencherá automaticamente todos os campos de dados pessoais, experiências, educação, tecnologias e habilidades.
* **Revisão**: Você pode adicionar, editar ou remover experiências, ajustar períodos e listar tecnologias usadas.
* Ao finalizar, clique em **"Salvar Perfil no Disco"** (os dados ficam salvos em `data/profile.json`).

---

## 3. Gerando Currículos Sob Medida

Acesse a aba **Gerador de CV**:

### Passo 1: Escolha o Objetivo
* **Específico para uma Vaga**: Cole o link da vaga (ou cole a descrição do cargo). A IA alinhará suas experiências e palavras-chave diretamente com os requisitos pedidos pelo recrutador.
* **Por Cargo / Área Alvo**: Informe um cargo geral (ex: *Tech Lead*, *Product Manager*) para dar destaque aos pontos fortes relevantes.
* **Versão Geral Equilibrada**: Cria uma versão polida do seu perfil mestre completo.

### Passo 2: Nível de Profundidade
* **Simples & Enxuto (1 Página)**: 2 a 3 bullet points objetivos por cargo, formato "Ação + Resultado", ideal para leitura dinâmica de recrutadores.
* **Detalhado & Profundo (Sênior / 2 Páginas)**: 4 a 6 bullet points ricos, contextualizando ferramentas, arquitetura, liderança e métricas de impacto de negócio.

### Passo 3: Escolha o Estilo Inicial
Selecione um dos 5 estilos no carrossel e clique em **"Gerar Currículo com IA"**.

---

## 4. O Editor e o Carrossel de 5 Estilos

Após a geração, você verá a **folha A4** interativa:

* **Carrossel de Estilos**: Localizado logo acima da folha A4. Clique nos cards ou use as setas para alternar instantaneamente entre os 5 estilos visuais:
  1. 🏛️ **Modern Minimal**: Branco puro, divisores sutis e alta legibilidade em qualquer robô ATS.
  2. 💼 **Executive Slate**: Duas colunas com barra lateral em cinza suave e detalhes em azul-marinho.
  3. 💻 **Tech Charcoal**: Cabeçalho moderno em grafite/carvão escuro com tags técnicas em destaque.
  4. 📜 **Classic Serif**: Tipografia tradicional de prestígio (estilo Ivy League / Wall Street).
  5. 🌿 **Nordic Warm**: Estética escandinava contemporânea em tom areia aconchegante (`#fdfbf7`).
* **Edição Inline Direta**: Clique em qualquer texto, título ou bullet point na folha A4 para editar na hora.
* **Exportação**:
  * **Exportar PDF**: Abre o diálogo nativo do navegador pronto para salvar em PDF vetorial A4 de alta definição.
  * **Markdown**: Copia o texto estruturado para colar em portfólios ou formulários de vagas.
  * **JSON**: Baixa o arquivo com os dados do currículo.

---

## 5. Biblioteca e Gestão de Versões

Na aba **Biblioteca**, você pode visualizar todos os currículos gerados, duplicar versões para ajustar para diferentes empresas, reabrir no editor a qualquer momento ou excluir versões antigas.
