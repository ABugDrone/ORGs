// ValidationService - File and URL validation
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

class ValidationService {
  private readonly MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
  private readonly SUPPORTED_VIDEO_FORMATS = ['mp4', 'webm', 'avi', 'mov'];
  private readonly SUPPORTED_DOCUMENT_FORMATS = ['pdf', 'docx', 'xlsx', 'pptx', 'txt'];
  private readonly SUPPORTED_IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'gif'];

  validateFile(file: File): ValidationResult {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds 100MB limit. Current size: ${this.formatFileSize(file.size)}`,
      };
    }

    // Check file format
    const extension = this.getFileExtension(file.name);
    const allFormats = [
      ...this.SUPPORTED_VIDEO_FORMATS,
      ...this.SUPPORTED_DOCUMENT_FORMATS,
      ...this.SUPPORTED_IMAGE_FORMATS,
    ];

    if (!allFormats.includes(extension)) {
      return {
        valid: false,
        error: `Unsupported file format: ${extension}. Supported formats: ${allFormats.join(', ')}`,
      };
    }

    return { valid: true };
  }

  validateGoogleDriveUrl(url: string): ValidationResult {
    try {
      const urlObj = new URL(url);
      
      // Check if it's a Google Drive URL
      if (!urlObj.hostname.includes('drive.google.com')) {
        return {
          valid: false,
          error: 'Only Google Drive links are supported',
        };
      }

      // Reject other video platforms
      const blockedDomains = ['youtube.com', 'facebook.com', 'tiktok.com', 'instagram.com'];
      if (blockedDomains.some(domain => urlObj.hostname.includes(domain))) {
        return {
          valid: false,
          error: 'Links from YouTube, Facebook, TikTok, and Instagram are not supported',
        };
      }

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: 'Invalid URL format',
      };
    }
  }

  getFileType(file: File): 'video' | 'document' | 'image' {
    const extension = this.getFileExtension(file.name);
    
    if (this.SUPPORTED_VIDEO_FORMATS.includes(extension)) {
      return 'video';
    }
    if (this.SUPPORTED_IMAGE_FORMATS.includes(extension)) {
      return 'image';
    }
    return 'document';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  private getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }
}

export const validationService = new ValidationService();
