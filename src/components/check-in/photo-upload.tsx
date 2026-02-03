'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Camera, X, Upload } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import imageCompression from 'browser-image-compression'
import { createClient } from '@/lib/supabase/client'

interface PhotoUploadProps {
  existingUrl?: string
  onUpload: (url: string) => void
  onRemove: () => void
  maxSizeMB?: number
}

export function PhotoUpload({ existingUrl, onUpload, onRemove, maxSizeMB = 5 }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(existingUrl || null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleUpload = async (file: File) => {
    setUploading(true)
    setError(null)

    try {
      // Compress image
      const compressedFile = await imageCompression(file, {
        maxSizeMB,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      })

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Upload to Supabase Storage
      const fileName = `${user.id}/${Date.now()}.jpg`
      const { data, error: uploadError } = await supabase.storage
        .from('checkin-photos')
        .upload(fileName, compressedFile, {
          contentType: 'image/jpeg',
          upsert: false,
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('checkin-photos')
        .getPublicUrl(data.path)

      setPreview(publicUrl)
      onUpload(publicUrl)
    } catch (err: any) {
      setError(err.message || 'Failed to upload photo')
    } finally {
      setUploading(false)
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      handleUpload(acceptedFiles[0])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    },
    maxFiles: 1,
    disabled: uploading,
  })

  const handleRemove = () => {
    setPreview(null)
    onRemove()
  }

  if (preview) {
    return (
      <div className="relative w-full aspect-square rounded-4xl overflow-hidden bg-neutral-100">
        <img
          src={preview}
          alt="Check-in photo"
          className="w-full h-full object-cover"
        />
        <button
          type="button"
          onClick={handleRemove}
          className="absolute top-3 right-3 h-10 w-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-soft hover:bg-white transition-colors"
        >
          <X className="h-5 w-5 text-neutral-700" />
        </button>
      </div>
    )
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={cn(
          'w-full aspect-square rounded-4xl border-2 border-dashed transition-colors cursor-pointer',
          'flex flex-col items-center justify-center gap-3',
          'hover:border-primary-400 hover:bg-primary-50',
          isDragActive
            ? 'border-primary-500 bg-primary-100'
            : 'border-neutral-300 bg-neutral-50',
          uploading && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        <div className={cn(
          'h-16 w-16 rounded-full flex items-center justify-center',
          isDragActive ? 'bg-primary-200' : 'bg-neutral-200'
        )}>
          {uploading ? (
            <div className="animate-spin h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full" />
          ) : (
            <Camera className="h-8 w-8 text-neutral-600" />
          )}
        </div>
        <div className="text-center">
          <p className="text-base font-medium text-neutral-900">
            {uploading ? 'Uploading...' : isDragActive ? 'Drop photo here' : 'Add a photo'}
          </p>
          <p className="text-sm text-neutral-500 mt-1">
            {uploading ? 'Compressing and uploading' : 'Tap to choose or drag & drop'}
          </p>
        </div>
        <Upload className="h-5 w-5 text-neutral-400" />
      </div>
      {error && (
        <p className="text-sm text-red-500 mt-2">{error}</p>
      )}
    </div>
  )
}
