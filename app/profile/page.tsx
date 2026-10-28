'use client';

import React, { useState, useEffect } from 'react';
import { User, FileText, CheckCircle2, Loader2, Save } from 'lucide-react';
import { FileDropzone } from '@/components/profile/file-dropzone';
import { ProfileForm } from '@/components/profile/profile-form';
import { UserProfile, UserProfileSchema } from '@/lib/ai/schemas';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileVersion, setProfileVersion] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Carrega perfil inicial do disco sem cache
  useEffect(() => {
    async function loadInitialProfile() {
      try {
        const res = await fetch('/api/profile', { cache: 'no-store' });
        const data = await res.json();
        if (data.success && data.profile) {
          setProfile(data.profile);
        } else {
          setProfile(UserProfileSchema.parse({}));
        }
      } catch (err) {
        console.error('Erro ao carregar perfil:', err);
        setProfile(UserProfileSchema.parse({}));
      } finally {
        setIsLoading(false);
      }
    }
    loadInitialProfile();
  }, []);

  const handleSave = async (updatedProfile: UserProfile) => {
    setIsSaving(true);
    setSuccessBanner(null);
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProfile),
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.profile);
        setSuccessBanner('Perfil mestre salvo com sucesso em data/profile.json!');
        setTimeout(() => setSuccessBanner(null), 5000);
      } else {
        alert(data.message || 'Erro ao salvar perfil.');
      }
    } catch (err: any) {
      alert('Falha na conexão: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfileExtracted = (extracted: UserProfile) => {
    setProfile(extracted);
    setProfileVersion((prev) => prev + 1);
    setSuccessBanner('Currículo lido com sucesso e dados salvos no seu perfil!');
    setTimeout(() => setSuccessBanner(null), 5000);
  };

  if (isLoading || !profile) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            <User className="h-8 w-8 text-blue-600" />
            <span>Meu Perfil Profissional</span>
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Mantenha seu histórico completo aqui. A IA usará esses dados como a fonte da verdade para gerar e adaptar seus currículos.
          </p>
        </div>
      </div>

      {successBanner && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-sm font-semibold text-emerald-800 animate-fadeIn">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Dropzone de Currículo Existente para Auto-preenchimento */}
      <section>
        <FileDropzone onProfileExtracted={handleProfileExtracted} />
      </section>

      {/* Formulário Modular Completo */}
      <section>
        <ProfileForm key={profileVersion} initialProfile={profile} onSave={handleSave} isSaving={isSaving} />
      </section>
    </div>
  );
}
