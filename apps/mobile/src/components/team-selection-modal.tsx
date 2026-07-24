import { ChevronDown, Check, X } from 'lucide-react-native'
import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { getApiErrorMessage } from '@contee/api-client'
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native'

import { useTeamSelection } from '@/lib/team-selection'
import { colors } from '@/theme'
import { TeamSetupActions } from './team-setup-actions'
import { styles } from './team-selection-modal.styles'

type TeamSelectionOverlayContextValue = Readonly<{
  isOpen: boolean
  open: () => void
  close: () => void
}>

const TeamSelectionOverlayContext = createContext<
  TeamSelectionOverlayContextValue | undefined
>(undefined)

export function TeamSelectionOverlayProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <TeamSelectionOverlayContext.Provider
      value={{
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
      }}
    >
      {children}
    </TeamSelectionOverlayContext.Provider>
  )
}

function useTeamSelectionOverlay() {
  const context = useContext(TeamSelectionOverlayContext)
  if (!context) {
    throw new Error(
      'TeamSelectionTrigger must be inside TeamSelectionOverlayProvider'
    )
  }
  return context
}

export function TeamSelectionTrigger() {
  const { isOpen, open } = useTeamSelectionOverlay()
  const { selectedTeam, selectedTeamId } = useTeamSelection()

  return (
    <>
      <Pressable
        accessibilityLabel={
          selectedTeam ? `현재 팀 ${selectedTeam.name}` : '팀 선택'
        }
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        onPress={open}
        style={({ pressed }) => [
          styles.trigger,
          pressed ? styles.triggerPressed : undefined,
        ]}
      >
        <Text numberOfLines={1} style={styles.triggerText}>
          {selectedTeam?.name ?? (selectedTeamId ? '선택한 팀' : '팀 선택')}
        </Text>
        <ChevronDown color={colors.neutral600} size={18} />
      </Pressable>
    </>
  )
}

export function TeamSelectionOverlayHost() {
  const { isOpen, close } = useTeamSelectionOverlay()
  return <TeamSelectionModal isOpen={isOpen} onClose={close} />
}

export function TeamSelectionModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const {
    error,
    isError,
    isLoading,
    isRefreshing,
    refreshTeams,
    selectTeam,
    selectedTeamId,
    teams,
  } = useTeamSelection()
  const { height, width } = useWindowDimensions()

  const handleSelect = async (id: string) => {
    await selectTeam(id)
    onClose()
  }

  if (!isOpen) {
    return null
  }

  return (
    <View accessibilityViewIsModal style={[styles.overlay, { height, width }]}>
      <Pressable
        accessibilityLabel="팀 선택 닫기"
        accessibilityRole="button"
        onPress={onClose}
        style={styles.backdrop}
      />
      <SafeAreaView style={styles.sheet}>
        <View style={styles.sheetInner}>
          <View style={styles.sheetHeader}>
            <View style={styles.sheetHeaderCopy}>
              <Text style={styles.sheetTitle}>팀 선택</Text>
              <Text style={styles.sheetDescription}>
                작업할 팀을 선택하세요.
              </Text>
            </View>
            <Pressable
              accessibilityLabel="닫기"
              accessibilityRole="button"
              onPress={onClose}
              style={styles.iconButton}
            >
              <X color={colors.neutral800} size={22} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.sheetContent}
            showsVerticalScrollIndicator={false}
          >
            {isLoading ? (
              <Text style={styles.stateText}>팀 목록을 불러오는 중입니다.</Text>
            ) : isError ? (
              <View style={styles.stateBlock}>
                <Text style={styles.errorText}>
                  {getApiErrorMessage(error)}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => void refreshTeams()}
                  style={styles.secondaryButton}
                >
                  <Text style={styles.secondaryButtonText}>
                    {isRefreshing ? '다시 시도 중...' : '다시 시도'}
                  </Text>
                </Pressable>
              </View>
            ) : teams.length === 0 ? (
              <View style={styles.stateBlock}>
                <Text style={styles.stateText}>
                  참여 중인 팀이 없습니다. 새 팀을 만들거나 초대 코드로
                  참여하세요.
                </Text>
                <TeamSetupActions onNavigate={onClose} />
              </View>
            ) : (
              <View style={styles.teamList}>
                {teams.map((team) => {
                  const isSelected = team.id === selectedTeamId
                  return (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      key={team.id}
                      onPress={() => void handleSelect(team.id)}
                      style={({ pressed }) => [
                        styles.teamRow,
                        isSelected ? styles.selectedTeamRow : undefined,
                        pressed ? styles.teamRowPressed : undefined,
                      ]}
                    >
                      <View style={styles.teamCopy}>
                        <Text
                          style={[
                            styles.teamName,
                            isSelected ? styles.selectedTeamText : undefined,
                          ]}
                        >
                          {team.name}
                        </Text>
                        {team.shortCode ? (
                          <Text
                            style={[
                              styles.teamCode,
                              isSelected ? styles.selectedTeamText : undefined,
                            ]}
                          >
                            {team.shortCode}
                          </Text>
                        ) : null}
                      </View>
                      {isSelected ? (
                        <Check color={colors.white} size={20} />
                      ) : null}
                    </Pressable>
                  )
                })}
              </View>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  )
}
