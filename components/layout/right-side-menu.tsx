/**
 * Right Side Menu - Client wrapper for conditional FAB rendering
 * Allows conditional rendering of FABs based on state
 */

'use client'

import { useEffect, useState } from 'react'
import FabList, { FabListItem } from '@/components/fabs/fab-list'
import SettingsFab from '@/components/fabs/settings-fab'
import SpinFab from '@/components/fabs/spin-fab'
import FilterFab from '@/components/fabs/filter-fab'
import AddMovieFab from '@/components/fabs/add-movie-fab'
import { useUIStore } from '@/lib/stores'

interface RightSideMenuProps {
  userId?: string
  movieCount?: number
}

export default function RightSideMenu({
  userId,
  movieCount = 0,
}: RightSideMenuProps) {
  const isWheelVisible = useUIStore((state) => state.isWheelVisible)
  const [isNear, setIsNear] = useState(false)
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    // Detect if device is touch-enabled (mobile/tablet)
    const checkTouchDevice = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
          navigator.maxTouchPoints > 0 ||
          window.matchMedia('(pointer: coarse)').matches
      )
    }
    checkTouchDevice()
  }, [])

  return (
    <div
      className='fixed top-0 right-0 z-50 pt-4 pr-4 pb-10 pl-10'
      onMouseEnter={() => setIsNear(true)}
      onMouseLeave={() => setIsNear(false)}
    >
      <FabList
        style={{
          transition: 'transform 0.3s ease, opacity 0.3s ease',
          transform:
            isTouchDevice || isNear || movieCount === 0
              ? 'translateX(0)'
              : 'translateX(50%)',
          opacity: isTouchDevice || isNear || movieCount === 0 ? 1 : 0.5,
        }}
      >
        <FabListItem>
          <SettingsFab />
        </FabListItem>
        {isWheelVisible && (
          <FabListItem>
            <SpinFab />
          </FabListItem>
        )}
        <FabListItem>
          <FilterFab />
        </FabListItem>
        <FabListItem>
          <AddMovieFab userId={userId} movieCount={movieCount} />
        </FabListItem>
      </FabList>
    </div>
  )
}
