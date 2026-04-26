"use client";

import React, { useState } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label: string;
  className?: string;
}

export function ImageUpload({ value, onChange, label, className }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleSimulatedUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    // Simulation d'un upload vers un storage
    // Pour le MVP, on utilise l'URL locale de prévisualisation
    const reader = new FileReader();
    reader.onloadend = () => {
      setTimeout(() => {
        onChange(reader.result as string);
        setIsUploading(false);
      }, 1500);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={cn("space-y-2 w-full", className)}>
      <label className="text-sm font-bold text-slate-700 ml-1 uppercase text-[10px] tracking-widest">{label}</label>
      
      <div className={cn(
        "relative h-40 w-full rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center transition-all overflow-hidden group",
        value ? "border-primary/20 bg-primary/5" : "hover:border-primary/40 hover:bg-slate-100"
      )}>
        {value ? (
          <>
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button 
                onClick={() => onChange("")}
                className="p-3 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-colors shadow-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </>
        ) : (
          <>
            {isUploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-xs font-bold text-primary">Chargement de l'image...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 px-6 text-center">
                <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400 group-hover:text-primary transition-colors">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-600">Cliquez ou glissez une image</p>
                  <p className="text-[10px] text-slate-400">JPG, PNG ou WEBP (Max. 5MB)</p>
                </div>
              </div>
            )}
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              accept="image/*"
              onChange={handleSimulatedUpload}
              disabled={isUploading}
            />
          </>
        )}
      </div>
    </div>
  );
}
