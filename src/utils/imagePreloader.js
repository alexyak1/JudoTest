// Simple image preloading utility for faster loading
class ImagePreloader {
  constructor() {
    this.cache = new Map();
    this.loading = new Set();
  }

  // Preload an image
  preload(src) {
    if (this.cache.has(src) || this.loading.has(src)) {
      return Promise.resolve(this.cache.get(src));
    }

    this.loading.add(src);
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.cache.set(src, img);
        this.loading.delete(src);
        resolve(img);
      };
      img.onerror = () => {
        this.loading.delete(src);
        reject(new Error(`Failed to load image: ${src}`));
      };
      img.src = src;
    });
  }

  // Preload multiple images
  preloadBatch(srcs) {
    return Promise.allSettled(srcs.map(src => this.preload(src)));
  }

  // Check if image is cached
  isCached(src) {
    return this.cache.has(src);
  }
}

// Global instance
window.imagePreloader = new ImagePreloader();
