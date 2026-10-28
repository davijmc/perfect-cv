'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Check, X, Sparkles, Move } from 'lucide-react';

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
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Dimensões do viewport de recorte (proporção exata 3x4 oficial)
  const CROP_WIDTH = 270;
  const CROP_HEIGHT = 360;

  // Carrega a imagem e obtém dimensões naturais exatas
  useEffect(() => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      imageRef.current = img;
      setImageDimensions({
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
      });
      setPosition({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
    };
  }, [imageSrc]);

  // Manipulação de Arrastar Global com Window Listener para fluidez total
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
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

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMoveWindow = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    };

    const handleMouseUpWindow = () => {
      setIsDragging(false);
    };

    const handleTouchMoveWindow = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        setPosition({
          x: e.touches[0].clientX - dragStart.x,
          y: e.touches[0].clientY - dragStart.y,
        });
      }
    };

    const handleTouchEndWindow = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMoveWindow);
    window.addEventListener('mouseup', handleMouseUpWindow);
    window.addEventListener('touchmove', handleTouchMoveWindow);
    window.addEventListener('touchend', handleTouchEndWindow);

    return () => {
      window.removeEventListener('mousemove', handleMouseMoveWindow);
      window.removeEventListener('mouseup', handleMouseUpWindow);
      window.removeEventListener('touchmove', handleTouchMoveWindow);
      window.removeEventListener('touchend', handleTouchEndWindow);
    };
  }, [isDragging, dragStart]);

  // Zoom pelo scroll do mouse
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.0015;
    setZoom((prev) => Math.min(Math.max(Number((prev + delta).toFixed(3)), 0.8), 3.5));
  };

  // Gira a imagem 90 graus e recentraliza
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
    setPosition({ x: 0, y: 0 });
  };

  // Recentraliza posição e zoom
  const handleReset = () => {
    setPosition({ x: 0, y: 0 });
    setZoom(1);
  };

  // Cálculo de escala base (cover) considerando rotação
  const isSideways = rotation === 90 || rotation === 270;
  const naturalWidth = imageDimensions?.width || CROP_WIDTH;
  const naturalHeight = imageDimensions?.height || CROP_HEIGHT;

  const effectiveWidth = isSideways ? naturalHeight : naturalWidth;
  const effectiveHeight = isSideways ? naturalWidth : naturalHeight;

  // Escala para a imagem cobrir 100% da janela 3x4 no zoom padrão 1.0
  const baseScale = Math.max(CROP_WIDTH / effectiveWidth, CROP_HEIGHT / effectiveHeight);

  const displayWidth = naturalWidth * baseScale;
  const displayHeight = naturalHeight * baseScale;

  // Renderiza o recorte final com fidelidade matemática 1:1 em resolução HD 3x4 (600x800px)
  const handleConfirm = () => {
    const img = imageRef.current;
    if (!img || !imageDimensions) return;

    setIsProcessing(true);

    const canvas = document.createElement('canvas');
    // Resolução nítida para impressão e PDF: 600 x 800 (proporção 3x4)
    const OUTPUT_WIDTH = 600;
    const OUTPUT_HEIGHT = 800;
    canvas.width = OUTPUT_WIDTH;
    canvas.height = OUTPUT_HEIGHT;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsProcessing(false);
      return;
    }

    // Fundo branco limpo
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);

    // Fator de escala exato do viewport de tela (270x360) para o canvas (600x800)
    const scaleFactor = OUTPUT_WIDTH / CROP_WIDTH;

    ctx.save();
    // 1. Desloca a origem para o centro exato do canvas (centro do recorte)
    ctx.translate(OUTPUT_WIDTH / 2, OUTPUT_HEIGHT / 2);

    // 2. Aplica o deslocamento do usuário na tela escalado para o canvas
    ctx.translate(position.x * scaleFactor, position.y * scaleFactor);

    // 3. Aplica a rotação da imagem ao redor de seu centro
    ctx.rotate((rotation * Math.PI) / 180);

    // 4. Desenha a imagem com o tamanho exato correspondente ao que o usuário vê
    const drawWidth = naturalWidth * baseScale * zoom * scaleFactor;
    const drawHeight = naturalHeight * baseScale * zoom * scaleFactor;

    ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
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
          <span>Arraste e ajuste o zoom para enquadrar perfeitamente seu rosto.</span>
          <span className="font-semibold font-mono text-[11px] bg-blue-100 px-2 py-0.5 rounded-full shrink-0">
            3x4 Oficial
          </span>
        </div>

        {/* Área Central Interativa de Recorte */}
        <div
          ref={containerRef}
          onWheel={handleWheel}
          className="relative w-full h-[420px] bg-slate-950 overflow-hidden select-none cursor-grab active:cursor-grabbing flex items-center justify-center"
        >
          {/* Camada da Imagem Manipulável (Ancorada exatamente no centro 50%, 50%) */}
          {imageDimensions && (
            <div
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: `${displayWidth}px`,
                height: `${displayHeight}px`,
                marginLeft: `${-displayWidth / 2}px`,
                marginTop: `${-displayHeight / 2}px`,
                transform: `translate3d(${position.x}px, ${position.y}px, 0px) rotate(${rotation}deg) scale(${zoom})`,
                transformOrigin: 'center center',
                zIndex: 5,
                transition: isDragging ? 'none' : 'transform 0.08s ease-out',
              }}
              className="pointer-events-auto"
            >
              <img
                src={imageSrc}
                alt="Pré-visualização"
                className="w-full h-full object-fill pointer-events-none select-none max-w-none"
                draggable={false}
              />
            </div>
          )}

          {/* Máscara de Recorte 3x4 com Cantos Arredondados e Grade (Ancorada exatamente em 50%, 50%) */}
          <div
            className="pointer-events-none absolute rounded-2xl shadow-[0_0_0_9999px_rgba(15,23,42,0.85)] border-2 border-white ring-2 ring-blue-500/70"
            style={{
              width: `${CROP_WIDTH}px`,
              height: `${CROP_HEIGHT}px`,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
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
              <div className="border-r border-b border-white/60" />
              <div className="border-r border-b border-white/60" />
              <div />
            </div>

            {/* Marcador de Proporção */}
            <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-[10px] text-white px-2 py-0.5 rounded font-mono">
              3x4 Oficial
            </div>
          </div>
        </div>

        {/* Controles de Zoom, Centralização e Rotação */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(Number((z - 0.1).toFixed(2)), 0.8))}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs"
              title="Diminuir Zoom"
            >
              <ZoomOut className="h-4 w-4" />
            </button>

            <input
              type="range"
              min="0.8"
              max="3.5"
              step="0.02"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />

            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(Number((z + 0.1).toFixed(2)), 3.5))}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs"
              title="Aumentar Zoom"
            >
              <ZoomIn className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 shadow-xs"
              title="Centralizar posição e zoom"
            >
              <Move className="h-3.5 w-3.5 text-slate-500" />
              <span>Centrar</span>
            </button>

            <button
              type="button"
              onClick={handleRotate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 shadow-xs"
              title="Girar 90 graus"
            >
              <RotateCw className="h-3.5 w-3.5 text-blue-600" />
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
            disabled={isProcessing || !imageDimensions}
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
