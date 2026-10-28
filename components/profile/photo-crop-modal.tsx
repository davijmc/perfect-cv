'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Check, X, Move, Sparkles } from 'lucide-react';

interface PhotoCropModalProps {
  imageSrc: string;
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

export function PhotoCropModal({ imageSrc, onCropComplete, onCancel }: PhotoCropModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);

  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Dimensões do viewport de recorte (proporção exata 3x4)
  const CROP_WIDTH = 270;
  const CROP_HEIGHT = 360;

  // Carrega e inicializa o posicionamento centralizado
  useEffect(() => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      imageRef.current = img;
      setPosition({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
    };
  }, [imageSrc]);

  // Manipulação de Arrastar (Mouse e Touch)
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    },
    [isDragging, dragStart]
  );

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Zoom pelo scroll do mouse
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.002;
    setZoom((prev) => Math.min(Math.max(prev + delta, 0.8), 3.5));
  };

  // Gira a imagem 90 graus
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Renderiza o recorte final em resolução HD 3x4 (600x800px)
  const handleConfirm = () => {
    const img = imageRef.current;
    if (!img) return;

    setIsProcessing(true);

    const canvas = document.createElement('canvas');
    // Resolução nítida para impressão e PDF: 600 x 800 (proporção 3x4)
    const OUTPUT_WIDTH = 600;
    const OUTPUT_HEIGHT = 800;
    canvas.width = OUTPUT_WIDTH;
    canvas.height = OUTPUT_HEIGHT;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fundo branco limpo
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);

    // Fator de escala do viewport de tela para o canvas de saída
    const scaleFactor = OUTPUT_WIDTH / CROP_WIDTH;

    ctx.save();
    // Move para o centro do canvas
    ctx.translate(OUTPUT_WIDTH / 2, OUTPUT_HEIGHT / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    // Ajusta tamanho da imagem base
    const baseScale = Math.max(CROP_WIDTH / img.width, CROP_HEIGHT / img.height);
    const finalScale = baseScale * zoom * scaleFactor;

    const drawWidth = img.width * finalScale;
    const drawHeight = img.height * finalScale;

    // Desenha com o deslocamento do usuário
    const drawX = position.x * scaleFactor - drawWidth / 2;
    const drawY = position.y * scaleFactor - drawHeight / 2;

    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    ctx.restore();

    canvas.toBlob(
      (blob) => {
        setIsProcessing(false);
        if (blob) {
          onCropComplete(blob);
        }
      },
      'image/jpeg',
      0.95
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header do Modal */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Enquadramento da Foto (3x4)</h3>
          </div>
          <button
            onClick={onCancel}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Instruções */}
        <div className="bg-blue-50/50 px-6 py-2.5 text-xs text-blue-800 border-b border-blue-100 flex items-center justify-between">
          <span>Enquadre seu rosto na moldura 3x4. A foto manterá os cantos arredondados no currículo.</span>
          <span className="font-semibold font-mono text-[11px] bg-blue-100 px-2 py-0.5 rounded-full shrink-0">
            3x4 Arredondado
          </span>
        </div>

        {/* Área Central Interativa de Recorte */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
          className="relative flex items-center justify-center bg-slate-900 overflow-hidden select-none py-8 cursor-grab active:cursor-grabbing"
          style={{ height: '420px' }}
        >
          {/* Imagem a ser manipulada */}
          <div
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            }}
            className="absolute pointer-events-auto"
          >
            <img
              src={imageSrc}
              alt="Pré-visualização"
              className="max-w-none pointer-events-none"
              style={{
                width: CROP_WIDTH * 1.5,
                height: 'auto',
              }}
            />
          </div>

          {/* Máscara de Recorte 3x4 com Cantos Arredondados */}
          <div
            className="pointer-events-none relative rounded-2xl shadow-[0_0_0_9999px_rgba(15,23,42,0.85)] border-2 border-white ring-2 ring-blue-500/70"
            style={{
              width: `${CROP_WIDTH}px`,
              height: `${CROP_HEIGHT}px`,
            }}
          >
            {/* Grade dos Terços (Guia Fotográfica) */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
              <div className="border-r border-b border-white/60" />
              <div className="border-r border-b border-white/60" />
              <div className="border-b border-white/60" />
              <div className="border-r border-b border-white/60" />
              <div className="border-r border-b border-white/60" />
              <div className="border-b border-white/60" />
              <div className="border-r border-white/60" />
              <div className="border-r border-white/60" />
              <div />
            </div>

            {/* Marcador de Proporção */}
            <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-[10px] text-white px-2 py-0.5 rounded font-mono">
              3x4 Oficial
            </div>
          </div>
        </div>

        {/* Controles de Zoom e Rotação */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(z - 0.15, 0.8))}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
              title="Diminuir Zoom"
            >
              <ZoomOut className="h-4 w-4" />
            </button>

            <input
              type="range"
              min="0.8"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />

            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(z + 0.15, 3))}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
              title="Aumentar Zoom"
            >
              <ZoomIn className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={handleRotate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              title="Girar 90 graus"
            >
              <RotateCw className="h-3.5 w-3.5" />
              <span>Girar</span>
            </button>
          </div>
        </div>

        {/* Ações Inferiores */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-white">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-all disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isProcessing}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            <span>{isProcessing ? 'Processando...' : 'Aplicar Recorte e Salvar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
