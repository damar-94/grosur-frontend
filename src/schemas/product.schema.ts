import { z } from "zod";

// ─── Image validation constants (mirror backend upload.middleware.ts) ─────────
export const IMAGE_CONSTRAINTS = {
  /** Max size in bytes: 1 MB */
  MAX_FILE_SIZE: 1024 * 1024,
  /** Max total images (existing + new) */
  MAX_IMAGES: 5,
  /** Allowed MIME types — must match backend fileFilter */
  ALLOWED_TYPES: ["image/jpeg", "image/jpg", "image/png", "image/gif"] as const,
  /** Human-readable label for error messages */
  ALLOWED_EXTENSIONS: ".jpg, .jpeg, .png, .gif",
} as const;

// ─── Product form schema (used by Create & Edit pages) ───────────────────────
export const productFormSchema = z.object({
  name: z
    .string()
    .min(2, "Nama produk minimal 2 karakter")
    .max(100, "Nama produk maksimal 100 karakter"),

  price: z.coerce
    .number({ message: "Harga harus berupa angka" })
    .positive("Harga harus lebih dari 0")
    .int("Harga harus berupa bilangan bulat"),

  categoryId: z
    .string()
    .uuid("Pilih kategori yang valid")
    .min(1, "Kategori wajib dipilih"),

  description: z.string().max(1000, "Deskripsi maksimal 1000 karakter").optional(),

  isActive: z.boolean(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Validate a File object before adding to the upload queue */
export function validateImageFile(
  file: File,
  currentCount: number,
  existingFileNames: string[],
): string | null {
  if (!IMAGE_CONSTRAINTS.ALLOWED_TYPES.includes(file.type as never)) {
    return `"${file.name}" — format tidak didukung. Gunakan ${IMAGE_CONSTRAINTS.ALLOWED_EXTENSIONS}`;
  }
  if (file.size > IMAGE_CONSTRAINTS.MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return `"${file.name}" — ukuran ${sizeMB}MB melebihi batas 1MB`;
  }
  if (currentCount >= IMAGE_CONSTRAINTS.MAX_IMAGES) {
    return `Maksimal ${IMAGE_CONSTRAINTS.MAX_IMAGES} gambar yang dapat diunggah`;
  }
  if (existingFileNames.includes(file.name)) {
    return `"${file.name}" sudah ada dalam antrian`;
  }
  return null;
}
