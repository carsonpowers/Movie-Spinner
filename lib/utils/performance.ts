/**
 * Performance Monitoring Utilities
 * Web Vitals and custom metrics tracking
 */

'use client'

import { useEffect } from 'react'
import { useReportWebVitals } from 'next/web-vitals'

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Send to analytics endpoint
    const body = JSON.stringify(metric)
    const url = '/api/analytics'

    // Use `navigator.sendBeacon()` if available, falling back to `fetch()`
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, body)
    } else {
      fetch(url, {
        body,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        keepalive: true,
      })
    }
  })

  return null
}

/**
 * Custom performance mark
 */
export function performanceMark(name: string) {
  if (typeof window !== 'undefined' && window.performance) {
    performance.mark(name)
  }
}

/**
 * Measure performance between two marks
 */
export function performanceMeasure(
  name: string,
  startMark: string,
  endMark: string
) {
  if (typeof window !== 'undefined' && window.performance) {
    try {
      performance.measure(name, startMark, endMark)
      const measure = performance.getEntriesByName(name)[0]
      return measure.duration
    } catch (error) {
      console.error('Performance measurement failed:', error)
      return null
    }
  }
  return null
}

/**
 * Track custom metric
 */
export function trackMetric(name: string, value: number, unit = 'ms') {
  if (typeof window !== 'undefined') {
    // Send to analytics
    fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        value,
        unit,
        timestamp: Date.now(),
      }),
      keepalive: true,
    }).catch(console.error)
  }
}
