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

/**
 * Obtém um currículo específico por ID
 */
export async function getResume(id: string): Promise<GeneratedResume | null> {
  await ensureDataDirs();
  const filePath = path.join(getResumesDir(), `${id}.json`);
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
  const filePath = path.join(getResumesDir(), `${valid.id}.json`);
  await fs.writeFile(filePath, JSON.stringify(valid, null, 2), 'utf-8');
}

/**
 * Exclui um currículo gerado
 */
export async function deleteResume(id: string): Promise<boolean> {
  await ensureDataDirs();
  const filePath = path.join(getResumesDir(), `${id}.json`);
  try {
    await fs.unlink(filePath);
    return true;
  } catch {
    return false;
  }
}

const PHOTO_PREFIX = 'profile-photo';

/**
 * Salva a foto de perfil facultativa do usuário na pasta data/
 */
export async function saveProfilePhoto(buffer: Buffer, mimeType: string): Promise<string> {
  await ensureDataDirs();
  // Limpa arquivos de fotos anteriores com outras extensões
  try {
    const existing = await fs.readdir(getDataDir());
    for (const f of existing) {
      if (f.startsWith(PHOTO_PREFIX)) {
        await fs.unlink(path.join(getDataDir(), f));
      }
    }
  } catch {
    // Ignora se não conseguir ler diretório
  }

  let ext = '.png';
  if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = '.jpg';
  else if (mimeType.includes('webp')) ext = '.webp';
  else if (mimeType.includes('gif')) ext = '.gif';

  const fileName = `${PHOTO_PREFIX}${ext}`;
  const filePath = path.join(getDataDir(), fileName);
  await fs.writeFile(filePath, buffer);
  return `/api/profile/photo?t=${Date.now()}`;
}

/**
 * Obtém os dados binários e mimeType da foto de perfil salva em data/
 */
export async function getProfilePhoto(): Promise<{ buffer: Buffer; mimeType: string } | null> {
  await ensureDataDirs();
  try {
    const existing = await fs.readdir(getDataDir());
    const photoFile = existing.find((f) => f.startsWith(PHOTO_PREFIX));
    if (!photoFile) return null;

    const filePath = path.join(getDataDir(), photoFile);
    const buffer = await fs.readFile(filePath);

    let mimeType = 'image/png';
    if (photoFile.endsWith('.jpg') || photoFile.endsWith('.jpeg')) mimeType = 'image/jpeg';
    else if (photoFile.endsWith('.webp')) mimeType = 'image/webp';
    else if (photoFile.endsWith('.gif')) mimeType = 'image/gif';

    return { buffer, mimeType };
  } catch {
    return null;
  }
}

/**
 * Exclui a foto de perfil da pasta data/
 */
export async function deleteProfilePhoto(): Promise<void> {
  await ensureDataDirs();
  try {
    const existing = await fs.readdir(getDataDir());
    for (const f of existing) {
      if (f.startsWith(PHOTO_PREFIX)) {
        await fs.unlink(path.join(getDataDir(), f));
      }
    }
  } catch {
    // Ignora erro se não existir
  }
}

