'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Key, 
  Cpu, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Save, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Zap, 
  Globe
} from 'lucide-react';
import { PROVIDERS_META, ProviderMeta } from '@/components/settings/provider-data';
import { AIProvider, AppConfig } from '@/lib/ai/schemas';

export default function SettingsPage() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('gemini');
  const [showKey, setShowKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Carrega configurações locais ao montar
  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch('/api/config');
        const data = await res.json();
        if (data.success && data.config) {
          setConfig(data.config);
          setSelectedProvider(data.config.activeProvider || 'gemini');
        }
      } catch (err) {
        console.error('Erro ao carregar configurações:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchConfig();
  }, []);

  const currentMeta: ProviderMeta = 
    PROVIDERS_META.find((p) => p.id === selectedProvider) || PROVIDERS_META[0];

  const currentProviderConfig = config?.providers?.[selectedProvider] || {
    apiKey: '',
    model: currentMeta.popularModels[0] || '',
    baseUrl: currentMeta.defaultBaseUrl || '',
  };

  const handleFieldChange = (field: 'apiKey' | 'model' | 'baseUrl', value: string) => {
    if (!config) return;
    setConfig({
      ...config,
      providers: {
        ...config.providers,
        [selectedProvider]: {
          ...currentProviderConfig,
          [field]: value,
        },
      },
    });
    setTestResult(null);
  };

  const handleSetActive = (providerId: AIProvider) => {
    if (!config) return;
    setConfig({
      ...config,
      activeProvider: providerId,
    });
  };

  const handleSave = async () => {
    if (!config) return;
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.success) {
        setSaveMessage('Configurações salvas localmente com sucesso!');
        setTimeout(() => setSaveMessage(null), 4000);
      } else {
        alert(data.message || 'Erro ao salvar.');
      }
    } catch (err: any) {
      alert('Falha na comunicação: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/config/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedProvider,
          apiKey: currentProviderConfig.apiKey,
          model: currentProviderConfig.model || currentMeta.popularModels[0],
          baseUrl: currentProviderConfig.baseUrl,
        }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: 'Erro ao conectar: ' + err.message,
      });
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const isActiveProvider = config?.activeProvider === selectedProvider;

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            <Settings className="h-8 w-8 text-blue-600" />
            <span>Configurações de IA</span>
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Gerencie seus provedores de LLM e chaves de API. Tudo fica salvo localmente em <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-mono text-xs">data/config.json</code>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>Salvar Alterações</span>
          </button>
        </div>
      </div>

      {saveMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm font-medium text-emerald-800 animate-fadeIn">
          <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Grid: Lista de Provedores à Esquerda & Configuração à Direita */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Coluna Esquerda: Seletor de Provedores */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-1">
            Provedores Disponíveis
          </h2>
          <div className="space-y-2">
            {PROVIDERS_META.map((provider) => {
              const isSelected = selectedProvider === provider.id;
              const isPrimary = config?.activeProvider === provider.id;

              return (
                <button
                  key={provider.id}
                  onClick={() => {
                    setSelectedProvider(provider.id);
                    setTestResult(null);
                  }}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{provider.name}</span>
                      {isPrimary && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          ATIVO
                        </span>
                      )}
                    </div>
                    {provider.badge && (
                      <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full border ${provider.badgeColor}`}>
                        {provider.badge}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 flex items-start gap-2.5">
            <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Suas chaves são salvas apenas no seu computador e estão protegidas contra commits pelo <strong>.gitignore</strong>.
            </span>
          </div>
        </div>

        {/* Coluna Direita: Formulário do Provedor Selecionado */}
        <div className="lg:col-span-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            {/* Header do Provedor */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-bold text-slate-900">{currentMeta.name}</h3>
                  {isActiveProvider ? (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Provedor Ativo do Sistema
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSetActive(currentMeta.id)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline"
                    >
                      Definir como Provedor Ativo
                    </button>
                  )}
                </div>
                <p className="mt-1 text-sm text-slate-600">{currentMeta.description}</p>
              </div>
            </div>

            {/* Campo Chave de API */}
            {currentMeta.requiresApiKey && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <Key className="h-4 w-4 text-slate-500" />
                    <span>Chave de API ({currentMeta.name})</span>
                  </label>
                  {currentMeta.apiKeyHelpUrl && (
                    <a
                      href={currentMeta.apiKeyHelpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
                    >
                      <span>{currentMeta.apiKeyHelpText}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>

                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={currentProviderConfig.apiKey || ''}
                    onChange={(e) => handleFieldChange('apiKey', e.target.value)}
                    placeholder={`Cole sua chave aqui (ex: ${currentMeta.id === 'gemini' ? 'AIzaSy...' : 'sk-...'})`}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 text-sm font-mono text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Campo Modelo */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Cpu className="h-4 w-4 text-slate-500" />
                <span>Modelo a Utilizar</span>
              </label>

              <input
                type="text"
                value={currentProviderConfig.model || ''}
                onChange={(e) => handleFieldChange('model', e.target.value)}
                placeholder={currentMeta.popularModels[0]}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-mono text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              />

              {/* Chips de Modelos Populares */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs text-slate-500">Sugestões:</span>
                {currentMeta.popularModels.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleFieldChange('model', m)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-mono transition-all ${
                      currentProviderConfig.model === m
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Campo Base URL (se suportado) */}
            {currentMeta.supportsBaseUrl && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <Globe className="h-4 w-4 text-slate-500" />
                    <span>Base URL (Endpoint da API)</span>
                  </label>
                  {currentMeta.defaultBaseUrl && (
                    <button
                      type="button"
                      onClick={() => handleFieldChange('baseUrl', currentMeta.defaultBaseUrl || '')}
                      className="text-xs text-slate-500 hover:text-blue-600 underline"
                    >
                      Restaurar padrão ({currentMeta.defaultBaseUrl})
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  value={currentProviderConfig.baseUrl || ''}
                  onChange={(e) => handleFieldChange('baseUrl', e.target.value)}
                  placeholder={currentMeta.defaultBaseUrl || 'https://api...'}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-mono text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            )}

            {/* Resultado do Teste de Conexão */}
            {testResult && (
              <div
                className={`flex items-start gap-3 rounded-2xl p-4 text-sm font-medium ${
                  testResult.success
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold">
                    {testResult.success ? 'Conexão Estabelecida!' : 'Falha na Validação'}
                  </div>
                  <div className="text-xs mt-0.5 opacity-90">{testResult.message}</div>
                </div>
              </div>
            )}

            {/* Ações Inferiores */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 active:scale-95 transition-all disabled:opacity-50"
              >
                {isTesting ? (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                ) : (
                  <Zap className="h-4 w-4 text-amber-500" />
                )}
                <span>Testar Conexão</span>
              </button>

              <div className="flex items-center gap-3">
                {!isActiveProvider && (
                  <button
                    type="button"
                    onClick={() => handleSetActive(currentMeta.id)}
                    className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-all"
                  >
                    Usar este como Provedor Ativo
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  <span>Salvar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
