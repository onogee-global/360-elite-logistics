"use client";

import { useCallback, useRef, useState } from "react";
import { uploadImageToStorage } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageIcon, UploadCloud, X } from "lucide-react";
import Image from "next/image";

interface ImageDropzoneProps {
  folder: "products" | "categories";
  label?: string;
  value?: string;
  onChange?: (url: string | undefined) => void;
}

export default function ImageDropzone({
  folder,
  label = "Slika",
  value,
  onChange,
}: ImageDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(value);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = useCallback(
    async (file: File) => {
      try {
        setUploading(true);
        const { publicUrl } = await uploadImageToStorage(file, folder);
        setPreviewUrl(publicUrl);
        onChange?.(publicUrl);
      } catch (e) {
        console.error(e);
        alert(
          "Greška pri upload-u slike. Proverite konfiguraciju storage bucket-a."
        );
      } finally {
        setUploading(false);
      }
    },
    [folder, onChange]
  );

  const onDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) {
        await handleFiles(file);
      }
    },
    [handleFiles]
  );

  const onSelectFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        await handleFiles(file);
      }
    },
    [handleFiles]
  );

  const clearImage = useCallback(() => {
    setPreviewUrl(undefined);
    onChange?.(undefined);
    if (inputRef.current) inputRef.current.value = "";
  }, [onChange]);

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">{label}</div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
        }}
        onDrop={onDrop}
        className={[
          "relative border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/30",
        ].join(" ")}
      >
        {previewUrl ? (
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 rounded overflow-hidden bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <Image
                src={previewUrl}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm">Slika je učitana</div>
              <div className="text-xs text-muted-foreground break-all">
                {previewUrl}
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={clearImage}
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-6">
            <UploadCloud className="h-8 w-8 text-muted-foreground" />
            <div className="text-sm">Prevucite sliku ovde ili</div>
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                {uploading ? "Upload u toku..." : "Izaberite fajl"}
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              PNG, JPG ili WEBP
            </div>
          </div>
        )}
        <Input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={onSelectFile}
          className="hidden"
        />
      </div>
    </div>
  );
}
