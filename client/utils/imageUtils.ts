import axios from 'axios';

// ImgBB API key from environment variables
const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

/**
 * Compresses an image to reduce file size
 * @param base64Image - Base64 encoded image
 * @param maxSizeKB - Maximum size in KB (default: 800KB)
 * @returns Promise resolving to compressed base64 image
 */
export const compressImage = (base64Image: string, maxSizeKB = 800): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      img.src = base64Image;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions while maintaining aspect ratio
        const maxDimension = 1200;
        if (width > height && width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Start with high quality
        let quality = 0.9;
        let compressed = canvas.toDataURL('image/jpeg', quality);
        
        // Reduce quality until image is under max size
        while (compressed.length > maxSizeKB * 1024 * 1.37 && quality > 0.3) {
          quality -= 0.1;
          compressed = canvas.toDataURL('image/jpeg', quality);
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
 * Uploads an image to ImgBB and returns the URL
 * @param imageData - The image file or base64 string to upload
 * @param imageName - Optional name for the image
 * @returns Promise resolving to the image URL
 */
export const uploadImageToImgBB = async (
  imageData: File | string,
  imageName: string = 'suilens_image'
): Promise<string> => {
  try {
    // Check if we have an API key
    if (!IMGBB_API_KEY) {
      throw new Error('ImgBB API key not configured. Please add NEXT_PUBLIC_IMGBB_API_KEY to your .env.local file');
    }

    // Compress the image if it's a base64 string
    let processedImageData = imageData;
    if (typeof imageData === 'string' && imageData.startsWith('data:image')) {
      try {
        processedImageData = await compressImage(imageData);
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
  } catch (error) {
    console.error('Error uploading image to ImgBB:', error);
    throw error;
  }
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