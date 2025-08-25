import axios from 'axios';

// ImgBB API key from environment variables
const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

// Enhanced configuration for optimized uploads
const UPLOAD_CONFIG = {
  maxRetries: 3,
  initialTimeout: 60000, // 60 seconds for better reliability
  retryDelay: 1000, // 1 second
  maxFileSize: 32 * 1024 * 1024, // 32MB (ImgBB limit)
  compression: {
    maxWidth: 1280, // Reduced from 1920 for faster uploads
    maxHeight: 720,  // Reduced from 1080 for faster uploads
    quality: 0.7,    // More aggressive compression
    maxSizeKB: 300   // Reduced from 500KB for faster uploads
  }
};

/**
 * Enhanced image compression with better quality control
 * @param base64Image - Base64 encoded image
 * @param maxSizeKB - Maximum size in KB
 * @returns Promise resolving to compressed base64 image
 */
export const compressImage = (base64Image: string, maxSizeKB = 500): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      img.src = base64Image;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions while maintaining aspect ratio
        const { maxWidth, maxHeight } = UPLOAD_CONFIG.compression;
        
        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;
          
          if (aspectRatio > 1) {
            // Landscape
            width = maxWidth;
            height = Math.round(maxWidth / aspectRatio);
          } else {
            // Portrait or square
            height = maxHeight;
            width = Math.round(maxHeight * aspectRatio);
          }
          
          // Ensure dimensions don't exceed limits
          width = Math.min(width, maxWidth);
          height = Math.min(height, maxHeight);
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        // Use better quality settings
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        
        // Progressive quality reduction
        let quality = UPLOAD_CONFIG.compression.quality;
        let compressed = canvas.toDataURL('image/jpeg', quality);
        
        // More aggressive compression for large files
        const targetSize = maxSizeKB * 1024 * 1.37; // Base64 overhead
        let attempts = 0;
        const maxAttempts = 5;
        
        while (compressed.length > targetSize && quality > 0.3 && attempts < maxAttempts) {
          quality = Math.max(quality - 0.15, 0.3);
          compressed = canvas.toDataURL('image/jpeg', quality);
          attempts++;
        }
        
        // If still too large, try reducing dimensions
        if (compressed.length > targetSize && attempts >= maxAttempts) {
          const scaleFactor = Math.sqrt(targetSize / compressed.length);
          const newWidth = Math.round(width * scaleFactor);
          const newHeight = Math.round(height * scaleFactor);
          
          canvas.width = newWidth;
          canvas.height = newHeight;
          ctx.drawImage(img, 0, 0, newWidth, newHeight);
          
          compressed = canvas.toDataURL('image/jpeg', 0.7);
        }
        
        resolve(compressed);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image for compression'));
      };
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Enhanced upload with retry logic and better error handling
 * @param ImageData - The image file or base64 string to upload
 * @param imageName - Optional name for the image
 * @param onProgress - Optional progress callback
 * @returns Promise resolving to the image URL
 */
export const uploadImageToImgBB = async (
  ImageData: File | string,
  imageName: string = 'suilens_image',
  onProgress?: (progress: number) => void
): Promise<string> => {
  // Validate API key
  if (!IMGBB_API_KEY) {
    throw new Error(
      'ImgBB API key not configured. Please add NEXT_PUBLIC_IMGBB_API_KEY to your .env.local file'
    );
  }

  let lastError: Error | null = null;

  // Retry logic with exponential backoff
  for (let attempt = 1; attempt <= UPLOAD_CONFIG.maxRetries; attempt++) {
    try {
      // Compress and prepare image data
      const processedData = await prepareImageData(ImageData);
      
      // Create form data
      const formData = new FormData();
      formData.append('key', IMGBB_API_KEY);
      formData.append('image', processedData);
      formData.append('name', imageName);
      formData.append('expiration', '2592000'); // 30 days

      // Upload with progress tracking
      const response = await uploadWithProgress(formData, onProgress);
      
      if (response.data?.success && response.data.data?.url) {
        return response.data.data.url;
      }
      
      throw new Error(response.data?.error?.message || 'Upload failed');
      
    } catch (error: any) {
      lastError = error;
      
      // Handle specific error types
      if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
        if (attempt < UPLOAD_CONFIG.maxRetries) {
          console.warn(`Upload timeout, retrying... (${attempt}/${UPLOAD_CONFIG.maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, UPLOAD_CONFIG.retryDelay * attempt));
          continue;
        }
      }
      
      if (error.response?.status === 413) {
        throw new Error('Image too large. Please use a smaller image (max 32MB).');
      }
      
      if (error.response?.status === 400) {
        throw new Error('Invalid image format. Please use JPG, PNG, GIF, or WebP.');
      }
      
      if (error.response?.status === 401) {
        throw new Error('Invalid ImgBB API key. Please check your configuration.');
      }
      
      // Network errors - retry
      if (!error.response && attempt < UPLOAD_CONFIG.maxRetries) {
        console.warn(`Network error, retrying... (${attempt}/${UPLOAD_CONFIG.maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, UPLOAD_CONFIG.retryDelay * attempt));
        continue;
      }
      
      // Final attempt failed
      if (attempt === UPLOAD_CONFIG.maxRetries) {
        break;
      }
    }
  }

  // All retries exhausted
  throw new Error(
    lastError?.message || 
    'Failed to upload image after multiple attempts. Please check your connection and try again.'
  );
};

/**
 * Prepare image data for upload
 */
async function prepareImageData(ImageData: File | string): Promise<string> {
  let processedImageData = ImageData;

  // Handle base64 strings
  if (typeof ImageData === 'string' && ImageData.startsWith('data:image')) {
    try {
      processedImageData = await compressImage(ImageData);
    } catch (error) {
      console.warn('Image compression failed, using original:', error);
    }
  }

  // Convert to base64
  if (processedImageData instanceof File) {
    const base64 = await fileToBase64(processedImageData);
    return base64.split(',')[1];
  }

  if (typeof processedImageData === 'string' && processedImageData.startsWith('data:image')) {
    return processedImageData.split(',')[1];
  }

  throw new Error('Invalid image data format');
}

/**
 * Upload with progress tracking
 */
async function uploadWithProgress(
  formData: FormData,
  onProgress?: (progress: number) => void
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPLOAD_CONFIG.initialTimeout);

  const config: any = {
    signal: controller.signal,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent: any) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    }
  };

  try {

    // Check if we have an API key
    if (!IMGBB_API_KEY) {
      throw new Error('ImgBB API key not configured. Please add NEXT_PUBLIC_IMGBB_API_KEY to your .env.local file');
    }

    // Compress the image if it's a base64 string
    let processedImageData = ImageData;
    if (typeof ImageData === 'string' && ImageData.startsWith('data:image')) {
      try {
        processedImageData = await compressImage(ImageData);
      } catch (error) {
        console.warn('Image compression failed, using original:', error);
      }
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('key', IMGBB_API_KEY);
    
    // Handle different image data types
    if (typeof processedImageData === 'string' && processedImageData.startsWith('data:image')) {
      // Extract base64 part
      const base64Data = processedImageData.split(',')[1];
      formData.append('image', base64Data);
    } else if (processedImageData instanceof File) {
      // Convert File to base64 for ImgBB
      const base64 = await fileToBase64(processedImageData);
      const base64Data = base64.split(',')[1];
      formData.append('image', base64Data);
    } else {
      throw new Error('Invalid image data format');
    }
    
    formData.append('name', imageName);

    // Make API request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const response = await axios.post('https://api.imgbb.com/1/upload', formData, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });

    clearTimeout(timeoutId);

    // Check if upload was successful
    if (response.data?.success) {
      return response.data.data.url;
    } else {
      throw new Error('Image upload failed');
    }
    const response = await axios.post('https://api.imgbb.com/1/upload', formData, config);
    clearTimeout(timeout);
    return response;
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}

/**
 * Fallback upload using local storage (for development/testing)
 */
export const uploadToLocalStorage = async (
  ImageData: File | string,
  imageName: string = 'suilens_image'
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      if (typeof ImageData === 'string') {
        resolve(ImageData);
      } else {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(ImageData);
      }
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Check if ImgBB is properly configured
 */
export const isImgBBConfigured = (): boolean => {
  return !!IMGBB_API_KEY && IMGBB_API_KEY.length > 10;
};

/**
 * Get upload service status
 */
export const getUploadServiceStatus = () => {
  return {
    imgbbConfigured: isImgBBConfigured(),
    maxFileSize: UPLOAD_CONFIG.maxFileSize,
    compressionEnabled: true,
    retryEnabled: true,
  };
};

/**
 * Convert File to base64 string
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Validate image file
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Please upload an image file (JPEG, PNG, etc.)' };
  }
  
  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: 'Image must be smaller than 10MB' };
  }
  
  return { valid: true };
};

/**
 * Process and upload multiple images
 */
export const uploadMultipleImages = async (
  images: { file: File | string; name: string }[]
): Promise<string[]> => {
  const uploadPromises = images.map(({ file, name }) => 
    uploadImageToImgBB(file, name)
  );
  
  return Promise.all(uploadPromises);
};