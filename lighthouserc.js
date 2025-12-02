/**
 * Lighthouse CI Configuration
 */

const config = {
  ci: {
    collect: {
      numberOfRuns: 3,
      startServerCommand: 'bun run start',
      startServerReadyPattern: 'ready on',
      url: ['http://localhost:3000'],
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 3000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        'speed-index': ['error', { maxNumericValue: 3000 }],
        'uses-http2': 'error',
        'uses-responsive-images': 'warn',
        'unminified-css': 'error',
        'unminified-javascript': 'error',
        'uses-text-compression': 'error',
        'modern-image-formats': 'warn',
        'categories:performance': ['error', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.8 }],
        'categories:seo': ['error', { minScore: 0.8 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}

export default config
