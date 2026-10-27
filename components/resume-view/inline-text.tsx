'use client';

import React, { useState, useEffect } from 'react';

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

  useEffect(() => {
    setText(value);
  }, [value]);

  if (!isEditable || !onChange) {
    return <Component className={className}>{value || placeholder}</Component>;
  }

  return (
    <Component
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => {
        const newText = e.currentTarget.textContent || '';
        setText(newText);
        if (newText !== value) {
          onChange(newText);
        }
      }}
      className={`outline-none transition-colors hover:bg-blue-50/50 focus:bg-blue-50 focus:ring-1 focus:ring-blue-300 rounded px-0.5 ${className}`}
    >
      {text || placeholder}
    </Component>
  );
}
