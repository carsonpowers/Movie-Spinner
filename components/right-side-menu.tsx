/**
 * Right Side Menu - Client wrapper for conditional FAB rendering
 * Allows conditional rendering of FABs based on state
 */

'use client'

import { useEffect, useState } from 'react'
import FabList, { FabListItem } from '@/components/fab-list'
import SettingsFab from '@/components/settings-fab'
import SpinFab from '@/components/spin-fab'
import FilterFab from '@/components/filter-fab'
import AddMovieFab from '@/components/add-movie-fab'

interface RightSideMenuProps {
  userId?: string
}

export default function RightSideMenu({ userId }: RightSideMenuProps) {
  const [isWheelVisible, setIsWheelVisible] = useState(false)
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

    const handleWheelVisibility = (event: CustomEvent) => {
      setIsWheelVisible(event.detail === 'wheel')
    }

    window.addEventListener(
      'wheelVisibilityChange',
      handleWheelVisibility as EventListener
    )

    return () => {
      window.removeEventListener(
        'wheelVisibilityChange',
        handleWheelVisibility as EventListener
      )
    }
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
            isTouchDevice || isNear ? 'translateX(0)' : 'translateX(50%)',
          opacity: isTouchDevice || isNear ? 1 : 0.5,
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
          <AddMovieFab userId={userId} />
        </FabListItem>
      </FabList>
    </div>
  )
}
