'use client';

import React, { useState, useEffect, useRef } from 'react';

interface InlineTextProps {
  value: string;
  onChange?: (val: string) => void;
  isEditable?: boolean;
  className?: string;
  placeholder?: string;
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'p' | 'div';
}

export function InlineText({
  value,
  onChange,
  isEditable = true,
  className = '',
  placeholder = 'Clique para editar...',
  as: Component = 'span',
}: InlineTextProps) {
  const [text, setText] = useState(value);
  const [isEditing, setIsEditing] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setText(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && elementRef.current) {
      elementRef.current.focus();
    }
  }, [isEditing]);

  if (!isEditable || !onChange) {
    return <Component className={className}>{value || placeholder}</Component>;
  }

  const commitChange = (rawText: string) => {
    const cleaned = rawText.replace(/\r?\n/g, ' ').trim();
    setText(cleaned);
    setIsEditing(false);
    if (cleaned !== value) {
      onChange(cleaned);
    }
  };

  if (!isEditing) {
    return (
      <Component
        onClick={() => {
          const selection =
            typeof window !== 'undefined' ? window.getSelection()?.toString() : '';
          if (selection && selection.length > 0) return;
          setIsEditing(true);
        }}
        title="Clique para editar este texto"
        className={`cursor-text rounded-xs transition-colors hover:bg-blue-50/70 ${className}`}
      >
        {text || placeholder}
      </Component>
    );
  }

  return (
    <Component
      ref={elementRef as any}
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => {
        commitChange(e.currentTarget.textContent || '');
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          setText(value);
          setIsEditing(false);
        } else if (e.key === 'Enter' && Component !== 'p' && Component !== 'div') {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
      className={`outline-none bg-blue-50 ring-1 ring-blue-400 rounded-xs ${className}`}
    >
      {text || placeholder}
    </Component>
  );
}
