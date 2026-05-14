/**
 * useCamera.ts — Camera capture hook using file input (most reliable cross-device).
 * Uses <input type="file" capture="environment"> for native camera delegation.
 */
import { useState, useCallback, useRef, useEffect } from 'react';

export interface UseCameraReturn {
  isSupported: boolean;
  capturedImage: Blob | null;
  thumbnail: string | null;
  isCapturing: boolean;
  error: string | null;
  captureFromCamera: () => void;
  captureFromGallery: () => void;
  clearImage: () => void;
}

const MAX_BLOB_SIZE = 10 * 1024 * 1024; // 10MB

function createThumbnail(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxWidth = 300;
      const scale = Math.min(1, maxWidth / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas context unavailable')); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.6));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')); };
    img.src = url;
  });
}

export function useCamera(): UseCameraReturn {
  const [capturedImage, setCapturedImage] = useState<Blob | null>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const isSupported = typeof document !== 'undefined';

  // Create hidden file inputs on mount
  useEffect(() => {
    if (!isSupported) return;

    const cameraInput = document.createElement('input');
    cameraInput.type = 'file';
    cameraInput.accept = 'image/*';
    cameraInput.capture = 'environment';
    cameraInput.style.display = 'none';
    document.body.appendChild(cameraInput);
    cameraInputRef.current = cameraInput;

    const galleryInput = document.createElement('input');
    galleryInput.type = 'file';
    galleryInput.accept = 'image/*';
    galleryInput.style.display = 'none';
    document.body.appendChild(galleryInput);
    galleryInputRef.current = galleryInput;

    const handleFile = async (e: Event) => {
      const input = e.target as HTMLInputElement;
      const file = input.files?.[0];
      if (!file) { setIsCapturing(false); return; }
      if (file.size > MAX_BLOB_SIZE) {
        setError('Image too large (max 10MB)');
        setIsCapturing(false);
        input.value = '';
        return;
      }
      try {
        setError(null);
        setCapturedImage(file);
        const thumb = await createThumbnail(file);
        setThumbnail(thumb);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Image processing failed');
      }
      setIsCapturing(false);
      input.value = '';
    };

    cameraInput.addEventListener('change', handleFile);
    galleryInput.addEventListener('change', handleFile);

    return () => {
      cameraInput.removeEventListener('change', handleFile);
      galleryInput.removeEventListener('change', handleFile);
      cameraInput.remove();
      galleryInput.remove();
    };
  }, [isSupported]);

  const captureFromCamera = useCallback(() => {
    if (!cameraInputRef.current) return;
    setError(null);
    setIsCapturing(true);
    cameraInputRef.current.click();
  }, []);

  const captureFromGallery = useCallback(() => {
    if (!galleryInputRef.current) return;
    setError(null);
    setIsCapturing(true);
    galleryInputRef.current.click();
  }, []);

  const clearImage = useCallback(() => {
    setCapturedImage(null);
    setThumbnail(null);
    setError(null);
  }, []);

  return { isSupported, capturedImage, thumbnail, isCapturing, error, captureFromCamera, captureFromGallery, clearImage };
}
