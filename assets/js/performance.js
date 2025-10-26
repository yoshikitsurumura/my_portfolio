// Performance optimization utilities
class PerformanceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        this.optimizeImages();
        this.setupLazyLoading();
        this.optimizeFonts();
        this.setupResourceHints();
        this.monitorPerformance();
    }

    // Image optimization and lazy loading
    optimizeImages() {
        // Convert images to WebP format when supported
        if (this.supportsWebP()) {
            this.convertImagesToWebP();
        }

        // Add loading="lazy" to images that don't have it
        document.querySelectorAll('img:not([loading])').forEach(img => {
            img.setAttribute('loading', 'lazy');
        });
    }

    supportsWebP() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }

    convertImagesToWebP() {
        // This would typically be handled server-side
        // For now, we'll just log that WebP is supported
        console.log('WebP format is supported');
    }

    // Enhanced lazy loading with Intersection Observer
    setupLazyLoading() {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // Font optimization
    optimizeFonts() {
        // Preload critical fonts
        const fontLink = document.createElement('link');
        fontLink.rel = 'preload';
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&display=swap';
        fontLink.as = 'style';
        document.head.appendChild(fontLink);
    }

    // Resource hints for better loading
    setupResourceHints() {
        const hints = [
            { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
            { rel: 'dns-prefetch', href: '//cdnjs.cloudflare.com' },
            { rel: 'preconnect', href: 'https://fonts.gstatic.com' },
            { rel: 'preconnect', href: 'https://cdnjs.cloudflare.com' }
        ];

        hints.forEach(hint => {
            const link = document.createElement('link');
            link.rel = hint.rel;
            link.href = hint.href;
            document.head.appendChild(link);
        });
    }

    // Performance monitoring
    monitorPerformance() {
        // Monitor Core Web Vitals
        if ('PerformanceObserver' in window) {
            // Largest Contentful Paint
            new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                const lastEntry = entries[entries.length - 1];
                console.log('LCP:', lastEntry.startTime);
            }).observe({ entryTypes: ['largest-contentful-paint'] });

            // First Input Delay
            new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                entries.forEach(entry => {
                    console.log('FID:', entry.processingStart - entry.startTime);
                });
            }).observe({ entryTypes: ['first-input'] });

            // Cumulative Layout Shift
            new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                entries.forEach(entry => {
                    if (!entry.hadRecentInput) {
                        console.log('CLS:', entry.value);
                    }
                });
            }).observe({ entryTypes: ['layout-shift'] });
        }
    }
}

// Initialize performance optimizations
document.addEventListener('DOMContentLoaded', () => {
    new PerformanceOptimizer();
});

