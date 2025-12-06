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

  useEffect(() => {
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
    <FabList>
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
  )
}
