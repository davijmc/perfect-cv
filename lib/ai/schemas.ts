import { z } from 'zod';

// Provedores de LLM suportados
export const AIProviderEnum = z.enum([
  'gemini',
  'openai',
  'anthropic',
  'groq',
  'ollama',
  'omniRoute',
]);
export type AIProvider = z.infer<typeof AIProviderEnum>;

// Configuração individual de cada provedor
export const ProviderConfigSchema = z.object({
  apiKey: z.string().optional().default(''),
  model: z.string().optional().default(''),
  baseUrl: z.string().optional().default(''),
});
export type ProviderConfig = z.infer<typeof ProviderConfigSchema>;

export const ProvidersMapSchema = z.object({
  gemini: ProviderConfigSchema.default({ apiKey: '', model: 'gemini-1.5-flash', baseUrl: '' }),
  openai: ProviderConfigSchema.default({ apiKey: '', model: 'gpt-4o', baseUrl: '' }),
  anthropic: ProviderConfigSchema.default({ apiKey: '', model: 'claude-3-5-sonnet-latest', baseUrl: '' }),
  groq: ProviderConfigSchema.default({ apiKey: '', model: 'llama-3.3-70b-versatile', baseUrl: 'https://api.groq.com/openai/v1' }),
  ollama: ProviderConfigSchema.default({ apiKey: '', model: 'llama3.2', baseUrl: 'http://localhost:11434/v1' }),
  omniRoute: ProviderConfigSchema.default({ apiKey: '', model: '', baseUrl: 'https://openrouter.ai/api/v1' }),
}).default({
  gemini: { apiKey: '', model: 'gemini-1.5-flash', baseUrl: '' },
  openai: { apiKey: '', model: 'gpt-4o', baseUrl: '' },
  anthropic: { apiKey: '', model: 'claude-3-5-sonnet-latest', baseUrl: '' },
  groq: { apiKey: '', model: 'llama-3.3-70b-versatile', baseUrl: 'https://api.groq.com/openai/v1' },
  ollama: { apiKey: '', model: 'llama3.2', baseUrl: 'http://localhost:11434/v1' },
  omniRoute: { apiKey: '', model: '', baseUrl: 'https://openrouter.ai/api/v1' },
});

// Configuração Geral da Aplicação (salva em data/config.json)
export const AppConfigSchema = z.object({
  activeProvider: AIProviderEnum.default('gemini'),
  providers: ProvidersMapSchema,
});
export type AppConfig = z.infer<typeof AppConfigSchema>;

// Dados Pessoais do Usuário
export const PersonalInfoSchema = z.object({
  fullName: z.string().default(''),
  title: z.string().default(''),
  email: z.string().default(''),
  phone: z.string().default(''),
  location: z.string().default(''),
  linkedinUrl: z.string().optional().default(''),
  githubUrl: z.string().optional().default(''),
  portfolioUrl: z.string().optional().default(''),
  photoUrl: z.string().optional().default(''),
});
export type PersonalInfo = z.infer<typeof PersonalInfoSchema>;

// Experiência Profissional
export const ExperienceItemSchema = z.object({
  id: z.string().default(() => Math.random().toString(36).substring(2, 9)),
  company: z.string().default(''),
  role: z.string().default(''),
  startDate: z.string().default(''),
  endDate: z.string().default(''),
  isCurrent: z.boolean().default(false),
  location: z.string().default(''),
  highlights: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
});
export type ExperienceItem = z.infer<typeof ExperienceItemSchema>;

// Formação Acadêmica
export const EducationItemSchema = z.object({
  id: z.string().default(() => Math.random().toString(36).substring(2, 9)),
  institution: z.string().default(''),
  degree: z.string().default(''),
  fieldOfStudy: z.string().default(''),
  startDate: z.string().default(''),
  endDate: z.string().default(''),
});
export type EducationItem = z.infer<typeof EducationItemSchema>;

// Competências e Habilidades
export const SkillsSchema = z.object({
  technical: z.array(z.string()).default([]),
  toolsAndCloud: z.array(z.string()).default([]),
  softSkills: z.array(z.string()).default([]),
});
export type Skills = z.infer<typeof SkillsSchema>;

// Projetos Relevantes
export const ProjectItemSchema = z.object({
  id: z.string().default(() => Math.random().toString(36).substring(2, 9)),
  name: z.string().default(''),
  description: z.string().default(''),
  technologies: z.array(z.string()).default([]),
  link: z.string().optional().default(''),
});
export type ProjectItem = z.infer<typeof ProjectItemSchema>;

// Certificações
export const CertificationItemSchema = z.object({
  id: z.string().default(() => Math.random().toString(36).substring(2, 9)),
  name: z.string().default(''),
  issuer: z.string().default(''),
  date: z.string().default(''),
});
export type CertificationItem = z.infer<typeof CertificationItemSchema>;

// Idiomas
export const LanguageItemSchema = z.object({
  id: z.string().default(() => Math.random().toString(36).substring(2, 9)),
  language: z.string().default(''),
  level: z.string().default('Intermediário'),
});
export type LanguageItem = z.infer<typeof LanguageItemSchema>;

export const UserProfileSchema = z.object({
  personalInfo: PersonalInfoSchema.default({
    fullName: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    photoUrl: '',
  }),
  summary: z.string().default(''),
  keyResults: z.array(z.string()).default([]),
  experiences: z.array(ExperienceItemSchema).default([]),
  education: z.array(EducationItemSchema).default([]),
  skills: SkillsSchema.default({
    technical: [],
    toolsAndCloud: [],
    softSkills: [],
  }),
  projects: z.array(ProjectItemSchema).default([]),
  certifications: z.array(CertificationItemSchema).default([]),
  languages: z.array(LanguageItemSchema).default([]),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

// Trecho gerado com número que não foi encontrado no perfil mestre
export const UnverifiedClaimSchema = z.object({
  path: z.string(),
  text: z.string(),
  numbers: z.array(z.string()).default([]),
});
export type UnverifiedClaim = z.infer<typeof UnverifiedClaimSchema>;

// Os 5 IDs de Template do Carrossel Visual
export const TemplateIdEnum = z.enum([
  'modern-minimal',
  'executive-slate',
  'tech-charcoal',
  'classic-serif',
  'nordic-warm',
]);
export type TemplateId = z.infer<typeof TemplateIdEnum>;

// Status de comprovação de requisitos da vaga contra o perfil
export const RequirementStatusEnum = z.enum(['supported', 'partial', 'not_supported']);
export type RequirementStatus = z.infer<typeof RequirementStatusEnum>;

export const JobRequirementItemSchema = z.object({
  text: z.string(),
  category: z.enum(['tech', 'experience', 'soft_skill', 'education', 'general']).default('general'),
  importance: z.enum(['required', 'desired']).default('required'),
  status: RequirementStatusEnum,
  evidence: z.string().optional().default(''),
});
export type JobRequirementItem = z.infer<typeof JobRequirementItemSchema>;

export const JobAnalysisResultSchema = z.object({
  jobTitle: z.string().default(''),
  company: z.string().optional(),
  summary: z.string().default(''),
  requirements: z.array(JobRequirementItemSchema).default([]),
  matchPercentage: z.number().min(0).max(100).default(0),
});
export type JobAnalysisResult = z.infer<typeof JobAnalysisResultSchema>;

// Modelo de Currículo Gerado (salvo em data/resumes/[id].json)
export const GeneratedResumeSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  title: z.string(),
  assistantLevel: z.enum(['simple', 'advanced']).default('simple'),
  mode: z.enum(['generic', 'job_specific', 'from_scratch']).default('generic'),
  depth: z.enum(['lean', 'detailed']).default('lean'),
  templateId: TemplateIdEnum.default('modern-minimal'),
  targetRole: z.string().optional(),
  targetJobDetails: z
    .object({
      company: z.string().optional(),
      jobTitle: z.string().optional(),
      url: z.string().optional(),
      rawDescription: z.string().optional(),
    })
    .optional(),
  jobAnalysis: JobAnalysisResultSchema.optional(),
  content: UserProfileSchema,
  unverifiedClaims: z.array(UnverifiedClaimSchema).default([]),
});
export type GeneratedResume = z.infer<typeof GeneratedResumeSchema>;

// ==========================================
// Copiloto de Sugestões de Edição do Perfil
// ==========================================
export const SuggestionTypeEnum = z.enum([
  'grammar_style',
  'add_skill',
  'remove_skill',
  'improve_highlight',
  'improve_summary',
]);
export type SuggestionType = z.infer<typeof SuggestionTypeEnum>;

export const ProfileSuggestionItemSchema = z.object({
  id: z.string(),
  type: SuggestionTypeEnum,
  title: z.string(),
  reason: z.string(),
  targetField: z.string(),
  targetIndex: z.number().optional(),
  subIndex: z.number().optional(),
  originalValue: z.string().optional().default(''),
  suggestedValue: z.string(),
  skillCategory: z.enum(['technical', 'toolsAndCloud', 'softSkills']).optional(),
  status: z.enum(['pending', 'accepted', 'rejected']).default('pending'),
});
export type ProfileSuggestionItem = z.infer<typeof ProfileSuggestionItemSchema>;

export const ProfileSuggestionsResponseSchema = z.object({
  overallSummary: z.string().default(''),
  suggestions: z.array(ProfileSuggestionItemSchema).default([]),
});
export type ProfileSuggestionsResponse = z.infer<typeof ProfileSuggestionsResponseSchema>;
