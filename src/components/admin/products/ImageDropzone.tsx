"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud, X, ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  IMAGE_CONSTRAINTS,
  validateImageFile,
} from "@/schemas/product.schema";
import type { ProductImage } from "@/services/productService";

interface ImageDropzoneProps {
  /** New files selected by the user (not yet uploaded) */
  pendingFiles: File[];
  onPendingFilesChange: (files: File[]) => void;
  /** Already-uploaded images from the server (Edit mode) */
  existingImages?: ProductImage[];
  onRemoveExisting?: (imageId: string) => void;
  /** True while an upload request is in progress */
  isUploading?: boolean;
  disabled?: boolean;
}

export function ImageDropzone({
  pendingFiles,
  onPendingFilesChange,
  existingImages = [],
  onRemoveExisting,
  isUploading = false,
  disabled = false,
}: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const totalCount = existingImages.length + pendingFiles.length;

  const processFiles = useCallback(
    (incoming: FileList | File[]) => {
      const files = Array.from(incoming);
      const existingNames = pendingFiles.map((f) => f.name);

      const accepted: File[] = [];
      files.forEach((file) => {
        const currentTotal = totalCount + accepted.length;
        const allNames = [...existingNames, ...accepted.map((f) => f.name)];
        const error = validateImageFile(file, currentTotal, allNames);
        if (error) {
          toast.warning(error);
        } else {
          accepted.push(file);
        }
      });

      if (accepted.length > 0) {
        onPendingFilesChange([...pendingFiles, ...accepted]);
      }
    },
    [pendingFiles, totalCount, onPendingFilesChange],
  );

  // ── Drag handlers ────────────────────────────────────────────────────────────
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    processFiles(e.dataTransfer.files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files);
    // Reset input so same file can be re-selected after removal
    e.target.value = "";
  };

  const removePending = (index: number) => {
    onPendingFilesChange(pendingFiles.filter((_, i) => i !== index));
  };

  const canAdd = totalCount < IMAGE_CONSTRAINTS.MAX_IMAGES && !disabled;

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      {canAdd && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-colors cursor-pointer select-none",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/30 bg-muted/30 hover:border-primary/50 hover:bg-primary/5",
            disabled && "pointer-events-none opacity-50",
          )}
        >
          <UploadCloud className="h-10 w-10 text-muted-foreground" />
          <div className="text-center">
            <p className="text-sm font-medium">
              Klik atau seret gambar ke sini
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {IMAGE_CONSTRAINTS.ALLOWED_EXTENSIONS.toUpperCase()} — maks.{" "}
              {IMAGE_CONSTRAINTS.MAX_FILE_SIZE / (1024 * 1024)}MB per file,{" "}
              {IMAGE_CONSTRAINTS.MAX_IMAGES} gambar total
            </p>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={IMAGE_CONSTRAINTS.ALLOWED_TYPES.join(",")}
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled}
      />

      {/* Thumbnails grid */}
      {(existingImages.length > 0 || pendingFiles.length > 0) && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {/* Existing images (from server) */}
          {existingImages.map((img) => (
            <div
              key={img.id}
              className="group relative aspect-square rounded-lg overflow-hidden border bg-muted"
            >
              <Image
                src={img.url}
                alt="product image"
                fill
                className="object-cover"
                sizes="120px"
              />
              {/* Upload in-progress overlay */}
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                </div>
              )}
              {/* Remove button */}
              {onRemoveExisting && !disabled && !isUploading && (
                <button
                  type="button"
                  onClick={() => onRemoveExisting(img.id)}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-white opacity-0 transition-opacity group-hover:opacity-100"
                  title="Hapus gambar"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}

          {/* Pending (local preview) files */}
          {pendingFiles.map((file, idx) => {
            const previewUrl = URL.createObjectURL(file);
            return (
              <div
                key={`${file.name}-${idx}`}
                className="group relative aspect-square rounded-lg overflow-hidden border-2 border-dashed border-primary/40 bg-muted"
              >
                <Image
                  src={previewUrl}
                  alt={file.name}
                  fill
                  className="object-cover"
                  sizes="120px"
                  onLoad={() => URL.revokeObjectURL(previewUrl)}
                />
                {/* Upload spinner overlay */}
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  </div>
                )}
                {/* Badge: "Baru" */}
                {!isUploading && (
                  <span className="absolute bottom-1 left-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                    Baru
                  </span>
                )}
                {/* Remove button */}
                {!disabled && !isUploading && (
                  <button
                    type="button"
                    onClick={() => removePending(idx)}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-white opacity-0 transition-opacity group-hover:opacity-100"
                    title="Hapus gambar"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            );
          })}

          {/* Counter chip */}
          {totalCount > 0 && (
            <div className="flex aspect-square items-center justify-center rounded-lg border bg-muted/50 text-muted-foreground">
              <div className="text-center">
                <ImageIcon className="mx-auto h-5 w-5 mb-0.5" />
                <p className="text-xs font-medium">
                  {totalCount}/{IMAGE_CONSTRAINTS.MAX_IMAGES}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hint when limit reached */}
      {totalCount >= IMAGE_CONSTRAINTS.MAX_IMAGES && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
          Batas maksimal {IMAGE_CONSTRAINTS.MAX_IMAGES} gambar sudah tercapai.
        </p>
      )}
    </div>
  );
}
