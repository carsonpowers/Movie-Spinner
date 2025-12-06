/**
 * FAB List - Fixed Action Buttons Container
 * Contains all floating action buttons in a unified list
 */

'use client'

import { ReactNode } from 'react'

interface FabListProps {
  children: ReactNode
  style?: React.CSSProperties
  className?: string
}

export default function FabList({ children, style, className }: FabListProps) {
  return (
    <ul
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        listStyle: 'none',
        margin: 0,
        padding: 0,
        ...style,
      }}
    >
      {children}
    </ul>
  )
}

export function FabListItem({ children }: { children: ReactNode }) {
  return (
    <li
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      {children}
    </li>
  )
}
