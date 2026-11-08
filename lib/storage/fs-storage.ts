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

function getDataDir(): string {
  return process.env.PERFECT_CV_DATA_DIR || path.join(process.cwd(), 'data');
}

function getResumesDir(): string {
  return path.join(getDataDir(), 'resumes');
}

function getConfigFile(): string {
  return path.join(getDataDir(), 'config.json');
}

function getProfileFile(): string {
  return path.join(getDataDir(), 'profile.json');
}

/**
 * Garante que os diretórios locais de dados existam
 */
export async function ensureDataDirs(): Promise<void> {
  await fs.mkdir(getDataDir(), { recursive: true });
  await fs.mkdir(getResumesDir(), { recursive: true });
}

/**
 * Carrega a configuração local do aplicativo (chaves e provedores)
 */
export async function loadConfig(): Promise<AppConfig> {
  await ensureDataDirs();
  try {
    const raw = await fs.readFile(getConfigFile(), 'utf-8');
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
  await fs.writeFile(getConfigFile(), JSON.stringify(valid, null, 2), 'utf-8');
}

/**
 * Carrega o perfil profissional mestre do usuário
 */
export async function loadProfile(): Promise<UserProfile | null> {
  await ensureDataDirs();
  try {
    const raw = await fs.readFile(getProfileFile(), 'utf-8');
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
  await fs.writeFile(getProfileFile(), JSON.stringify(valid, null, 2), 'utf-8');
}

/**
 * Lista todos os currículos gerados, ordenados pelo mais recente
 */
export async function listResumes(): Promise<GeneratedResume[]> {
  await ensureDataDirs();
  try {
    const files = await fs.readdir(getResumesDir());
    const resumes: GeneratedResume[] = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const raw = await fs.readFile(path.join(getResumesDir(), file), 'utf-8');
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

function sanitizeResumeId(id: string): string {
  return path.basename(String(id || '')).replace(/[^a-zA-Z0-9_-]/g, '');
}

/**
 * Obtém um currículo específico por ID
 */
export async function getResume(id: string): Promise<GeneratedResume | null> {
  await ensureDataDirs();
  const safeId = sanitizeResumeId(id);
  if (!safeId) return null;
  const filePath = path.join(getResumesDir(), `${safeId}.json`);
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
  const safeId = sanitizeResumeId(valid.id);
  if (!safeId) throw new Error('ID de currículo inválido.');
  const filePath = path.join(getResumesDir(), `${safeId}.json`);
  await fs.writeFile(filePath, JSON.stringify(valid, null, 2), 'utf-8');
}

/**
 * Exclui um currículo gerado
 */
export async function deleteResume(id: string): Promise<boolean> {
  await ensureDataDirs();
  const safeId = sanitizeResumeId(id);
  if (!safeId) return false;
  const filePath = path.join(getResumesDir(), `${safeId}.json`);
  try {
    await fs.unlink(filePath);
    return true;
  } catch {
    return false;
  }
}

const PHOTO_PREFIX = 'profile-photo';
const PHOTO_EXTENSIONS: { ext: string; mime: string }[] = [
  { ext: '.png', mime: 'image/png' },
  { ext: '.jpg', mime: 'image/jpeg' },
  { ext: '.jpeg', mime: 'image/jpeg' },
  { ext: '.webp', mime: 'image/webp' },
  { ext: '.gif', mime: 'image/gif' },
];

/**
 * Salva a foto de perfil facultativa do usuário na pasta data/
 */
export async function saveProfilePhoto(buffer: Buffer, mimeType: string): Promise<string> {
  await ensureDataDirs();
  await deleteProfilePhoto();

  let ext = '.png';
  if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = '.jpg';
  else if (mimeType.includes('webp')) ext = '.webp';
  else if (mimeType.includes('gif')) ext = '.gif';

  const filePath = path.join(getDataDir(), `${PHOTO_PREFIX}${ext}`);
  await fs.writeFile(filePath, buffer);
  return `/api/profile/photo?t=${Date.now()}`;
}

/**
 * Obtém os dados binários e mimeType da foto de perfil salva em data/
 */
export async function getProfilePhoto(): Promise<{ buffer: Buffer; mimeType: string } | null> {
  await ensureDataDirs();
  for (const item of PHOTO_EXTENSIONS) {
    try {
      const filePath = path.join(getDataDir(), `${PHOTO_PREFIX}${item.ext}`);
      const buffer = await fs.readFile(filePath);
      return { buffer, mimeType: item.mime };
    } catch {
      // Tenta próxima extensão
    }
  }
  return null;
}

/**
 * Exclui a foto de perfil da pasta data/
 */
export async function deleteProfilePhoto(): Promise<void> {
  await ensureDataDirs();
  for (const item of PHOTO_EXTENSIONS) {
    try {
      await fs.unlink(path.join(getDataDir(), `${PHOTO_PREFIX}${item.ext}`));
    } catch {
      // Ignora se arquivo não existir
    }
  }
}

