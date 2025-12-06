/**
 * FAB List - Fixed Action Buttons Container
 * Contains all floating action buttons in a unified list
 */

'use client'

import { ReactNode } from 'react'

interface FabListProps {
  children: ReactNode
}

export default function FabList({ children }: FabListProps) {
  return (
    <ul
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        listStyle: 'none',
        margin: 0,
        padding: 0,
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
