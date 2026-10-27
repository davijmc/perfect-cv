# Perfect CV

Aplicação web local para criação, adaptação inteligente e gestão de currículos de alta conversão (ATS-friendly) com IA multi-provedor (Gemini, OpenAI, Claude, Groq, Ollama e OmniRoute), auto-preenchimento via upload de currículo antigo e carrossel de 5 estilos visuais.

---

## ⚡ Como Rodar Localmente

### Pré-requisitos
* [Node.js 18+](https://nodejs.org/) instalado.

### 1. Instalar Dependências e Iniciar
Abra o terminal na pasta do projeto e execute:

```bash
npm install
npm run dev
```

Acesse **`http://localhost:3000`** no seu navegador.

---

## 🚀 Como Começar em 3 Passos

1. **Configurar IA**: Acesse a aba **Configurações**, escolha seu provedor (ex: [chave gratuita do Google Gemini](https://aistudio.google.com/app/apikey)), teste a conexão e salve.
2. **Preencher Perfil**: Acesse a aba **Meu Perfil** e suba seu currículo atual (PDF ou Word) para a IA preencher seus dados automaticamente.
3. **Gerar e Exportar**: Acesse a aba **Gerador de CV**, informe a vaga alvo, escolha o nível de detalhe (Enxuto vs. Detalhado), alterne entre os 5 estilos no carrossel e clique em **Exportar PDF**.

---

## 🔒 Privacidade e Armazenamento Local

* Todas as chaves de API, perfil mestre e currículos gerados ficam salvos exclusivamente no seu computador na pasta local `data/`.
* A pasta `data/` está estritamente protegida no `.gitignore` para garantir que seus dados pessoais e credenciais nunca sejam expostos no Git.

---

## 📚 Documentação Adicional

* [Arquitetura Técnica Detalhada](docs/architecture.md)
* [Guia do Usuário Completo](docs/user-guide.md)
* [Especificação de Design](docs/superpowers/specs/2026-10-27-perfect-cv-architecture.md)
