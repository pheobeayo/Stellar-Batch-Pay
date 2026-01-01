'use client';

import React from "react"

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  onFileSelect: (file: File, format: 'json' | 'csv') => void;
  disabled?: boolean;
}

export function FileUpload({ onFileSelect, disabled }: FileUploadProps) {
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const ext = file.name.toLowerCase().split('.').pop();
    if (!['json', 'csv'].includes(ext || '')) {
      alert('Please select a JSON or CSV file');
      return;
    }

    setFileName(file.name);
    onFileSelect(file, (ext as 'json' | 'csv'));
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    const ext = file.name.toLowerCase().split('.').pop();
    if (!['json', 'csv'].includes(ext || '')) {
      alert('Please select a JSON or CSV file');
      return;
    }

    setFileName(file.name);
    onFileSelect(file, (ext as 'json' | 'csv'));
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.csv"
        onChange={handleFileChange}
        className="hidden"
      />

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        <p className="text-foreground mb-2">
          {fileName ? (
            <>
              <span className="font-semibold">{fileName}</span>
              <br />
              <span className="text-sm text-muted-foreground">Click to change</span>
            </>
          ) : (
            <>
              <span>Drag and drop your file here</span>
              <br />
              <span className="text-sm text-muted-foreground">or click to browse</span>
            </>
          )}
        </p>
        <p className="text-xs text-muted-foreground mt-2">Supported: JSON or CSV</p>
      </div>

      <div className="mt-4">
        <details className="bg-card p-3 rounded-lg border border-border text-sm">
          <summary className="cursor-pointer font-semibold text-foreground">
            File Format Requirements
          </summary>
          <div className="mt-3 space-y-2 text-muted-foreground">
            <div>
              <p className="font-mono text-xs bg-background p-2 rounded my-1 overflow-x-auto">
                JSON: [{"{"}"address": "G...", "amount": "100", "asset": "XLM"{"}"}]
              </p>
            </div>
            <div>
              <p className="font-mono text-xs bg-background p-2 rounded my-1">
                CSV: address,amount,asset
              </p>
            </div>
            <p>• address: Stellar public key (starts with G)</p>
            <p>• amount: Positive number (as string)</p>
            <p>• asset: 'XLM' or 'CODE:ISSUER' format</p>
          </div>
        </details>
      </div>
    </div>
  );
}
