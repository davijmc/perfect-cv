import fs from 'fs/promises';
import path from 'path';
import { 
  AppConfig, 
  AppConfigSchema, 
  UserProfile, 
  UserProfileSchema, 
  GeneratedResume, 
  GeneratedResumeSchema 
} from '@/lib/ai/schemas';

const DATA_DIR = path.join(process.cwd(), 'data');
const RESUMES_DIR = path.join(DATA_DIR, 'resumes');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
const PROFILE_FILE = path.join(DATA_DIR, 'profile.json');

/**
 * Garante que os diretórios locais de dados existam
 */
export async function ensureDataDirs(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(RESUMES_DIR, { recursive: true });
}

/**
 * Carrega a configuração local do aplicativo (chaves e provedores)
 */
export async function loadConfig(): Promise<AppConfig> {
  await ensureDataDirs();
  try {
    const raw = await fs.readFile(CONFIG_FILE, 'utf-8');
    const json = JSON.parse(raw);
    return AppConfigSchema.parse(json);
  } catch (error) {
    // Se o arquivo não existir ou for inválido, inicializa com a configuração padrão
    const defaultConfig = AppConfigSchema.parse({});
    await saveConfig(defaultConfig);
    return defaultConfig;
  }
}

/**
 * Salva a configuração local no disco
 */
export async function saveConfig(config: AppConfig): Promise<void> {
  await ensureDataDirs();
  const valid = AppConfigSchema.parse(config);
  await fs.writeFile(CONFIG_FILE, JSON.stringify(valid, null, 2), 'utf-8');
}

/**
 * Carrega o perfil profissional mestre do usuário
 */
export async function loadProfile(): Promise<UserProfile | null> {
  await ensureDataDirs();
  try {
    const raw = await fs.readFile(PROFILE_FILE, 'utf-8');
    const json = JSON.parse(raw);
    return UserProfileSchema.parse(json);
  } catch (error) {
    return null;
  }
}

/**
 * Salva o perfil profissional mestre no disco
 */
export async function saveProfile(profile: UserProfile): Promise<void> {
  await ensureDataDirs();
  const valid = UserProfileSchema.parse(profile);
  await fs.writeFile(PROFILE_FILE, JSON.stringify(valid, null, 2), 'utf-8');
}

/**
 * Lista todos os currículos gerados, ordenados pelo mais recente
 */
export async function listResumes(): Promise<GeneratedResume[]> {
  await ensureDataDirs();
  try {
    const files = await fs.readdir(RESUMES_DIR);
    const resumes: GeneratedResume[] = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const raw = await fs.readFile(path.join(RESUMES_DIR, file), 'utf-8');
          const parsed = GeneratedResumeSchema.parse(JSON.parse(raw));
          resumes.push(parsed);
        } catch {
          // Ignora arquivos corrompidos individuais
        }
      }
    }

    return resumes.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  } catch {
    return [];
  }
}

/**
 * Obtém um currículo específico por ID
 */
export async function getResume(id: string): Promise<GeneratedResume | null> {
  await ensureDataDirs();
  const filePath = path.join(RESUMES_DIR, `${id}.json`);
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return GeneratedResumeSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

/**
 * Salva ou atualiza um currículo gerado no disco
 */
export async function saveResume(resume: GeneratedResume): Promise<void> {
  await ensureDataDirs();
  const valid = GeneratedResumeSchema.parse(resume);
  const filePath = path.join(RESUMES_DIR, `${valid.id}.json`);
  await fs.writeFile(filePath, JSON.stringify(valid, null, 2), 'utf-8');
}

/**
 * Exclui um currículo gerado
 */
export async function deleteResume(id: string): Promise<boolean> {
  await ensureDataDirs();
  const filePath = path.join(RESUMES_DIR, `${id}.json`);
  try {
    await fs.unlink(filePath);
    return true;
  } catch {
    return false;
  }
}
