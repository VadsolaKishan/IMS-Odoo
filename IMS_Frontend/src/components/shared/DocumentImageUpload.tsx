import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DocumentImageUploadProps {
  currentImage?: string | null
  onUpload: (file: File) => void
  onRemove?: () => void
  disabled?: boolean
  label?: string
}

export function DocumentImageUpload({
  currentImage,
  onUpload,
  onRemove,
  disabled,
  label = "Document Attachment"
}: DocumentImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return
    
    setIsUploading(true)
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
      onUpload(file)
      setIsUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (disabled) return
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-text-secondary">{label}</label>
      
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative rounded-xl border-2 border-dashed transition-all duration-200 overflow-hidden min-h-[160px] flex flex-col items-center justify-center p-4 ${
          isDragging ? 'border-primary bg-primary/5' : 'border-border bg-surface-tertiary/30'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-surface-tertiary/50'}`}
        onClick={() => !disabled && document.getElementById('image-upload')?.click()}
      >
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          disabled={disabled}
        />

        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full aspect-video sm:aspect-[21/9] rounded-lg overflow-hidden group"
            >
              <img src={preview} alt="Attachment" className="w-full h-full object-cover" />
              {!disabled && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-8 gap-1.5"
                    onClick={(e) => {
                      e.stopPropagation()
                      setPreview(null)
                      onRemove?.()
                    }}
                  >
                    <X className="w-4 h-4" /> Remove
                  </Button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center text-center gap-2"
            >
              <div className="p-3 rounded-full bg-surface-tertiary text-text-muted">
                {isUploading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Upload className="w-6 h-6" />
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-text-primary">
                  {isDragging ? "Drop to upload" : "Click or drag image to upload"}
                </p>
                <p className="text-xs text-text-muted">
                  PNG, JPG or WebP up to 10MB
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
