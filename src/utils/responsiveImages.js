/**
 * Responsive Image Utility - Similar to imgix functionality
 * Generates optimized image URLs based on device capabilities
 */

// Device breakpoints and corresponding image sizes
const DEVICE_CONFIGS = {
  mobile: {
    maxWidth: 768,
    imageWidth: 300,
    quality: 70,
    suffix: '_mobile'
  },
  tablet: {
    maxWidth: 1024,
    imageWidth: 500,
    quality: 80,
    suffix: '_tablet'
  },
  desktop: {
    maxWidth: Infinity,
    imageWidth: 800,
    quality: 90,
    suffix: '_desktop'
  }
};

/**
 * Detect device type based on screen width and user agent
 * @returns {string} Device type: 'mobile', 'tablet', or 'desktop'
 */
export const detectDeviceType = () => {
  const width = window.innerWidth;
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Check for mobile devices first
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) || width <= DEVICE_CONFIGS.mobile.maxWidth;
  
  if (isMobile) return 'mobile';
  if (width <= DEVICE_CONFIGS.tablet.maxWidth) return 'tablet';
  return 'desktop';
};

/**
 * Generate responsive image URL with device-specific optimization
 * @param {string} originalSrc - Original image source
 * @param {string} deviceType - Device type ('mobile', 'tablet', 'desktop')
 * @param {object} options - Additional options
 * @returns {string} Optimized image URL
 */
export const generateResponsiveImageUrl = (originalSrc, deviceType = 'desktop', options = {}) => {
  if (!originalSrc) return originalSrc;
  
  const config = DEVICE_CONFIGS[deviceType] || DEVICE_CONFIGS.desktop;
  const { width = config.imageWidth, quality = config.quality, format = 'webp' } = options;
  
  // For now, we'll use the original images but add query parameters for future optimization
  // In a real implementation, you'd have a service that generates thumbnails
  const url = new URL(originalSrc, window.location.origin);
  
  // Add optimization parameters
  url.searchParams.set('w', width.toString());
  url.searchParams.set('q', quality.toString());
  url.searchParams.set('f', format);
  url.searchParams.set('device', deviceType);
  
  return url.toString();
};

/**
 * Generate multiple image sources for responsive loading
 * @param {string} originalSrc - Original image source
 * @returns {object} Object with different image sources
 */
export const generateImageSources = (originalSrc) => {
  if (!originalSrc) return { mobile: originalSrc, tablet: originalSrc, desktop: originalSrc };
  
  return {
    mobile: generateResponsiveImageUrl(originalSrc, 'mobile'),
    tablet: generateResponsiveImageUrl(originalSrc, 'tablet'),
    desktop: generateResponsiveImageUrl(originalSrc, 'desktop')
  };
};

/**
 * Get the best image source for current device
 * @param {string} originalSrc - Original image source
 * @param {string} deviceType - Device type (optional, will auto-detect if not provided)
 * @returns {string} Optimized image URL for current device
 */
export const getBestImageSource = (originalSrc, deviceType = null) => {
  if (!originalSrc) return originalSrc;
  
  const currentDevice = deviceType || detectDeviceType();
  return generateResponsiveImageUrl(originalSrc, currentDevice);
};

/**
 * Check if WebP is supported by the browser
 * @returns {Promise<boolean>} Promise that resolves to WebP support status
 */
export const isWebPSupported = () => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

/**
 * Get optimized image format based on browser support
 * @param {string} originalSrc - Original image source
 * @param {string} deviceType - Device type
 * @returns {Promise<string>} Promise that resolves to optimized image URL
 */
export const getOptimizedImageSource = async (originalSrc, deviceType = null) => {
  if (!originalSrc) return originalSrc;
  
  const currentDevice = deviceType || detectDeviceType();
  const supportsWebP = await isWebPSupported();
  
  return generateResponsiveImageUrl(originalSrc, currentDevice, {
    format: supportsWebP ? 'webp' : 'gif'
  });
};

/**
 * Preload responsive images for better performance
 * @param {string} originalSrc - Original image source
 * @param {string} deviceType - Device type (optional)
 */
export const preloadResponsiveImage = async (originalSrc, deviceType = null) => {
  if (!originalSrc) return;
  
  const optimizedSrc = await getOptimizedImageSource(originalSrc, deviceType);
  
  // Preload the image
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = optimizedSrc;
  document.head.appendChild(link);
  
  return optimizedSrc;
};

/**
 * Batch preload multiple responsive images
 * @param {Array<string>} imageSources - Array of original image sources
 * @param {string} deviceType - Device type (optional)
 */
export const preloadResponsiveImages = async (imageSources, deviceType = null) => {
  if (!imageSources || imageSources.length === 0) return [];
  
  const promises = imageSources.map(src => preloadResponsiveImage(src, deviceType));
  return Promise.allSettled(promises);
};
