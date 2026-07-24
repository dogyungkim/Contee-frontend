import type { ReactNode } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import { colors, spacing, typography } from '@/theme'

export function TeamFormScreen({
  children,
  description,
  title,
}: {
  children: ReactNode
  description: string
  title: string
}) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ android: undefined, ios: 'padding' })}
      style={styles.safeArea}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text accessibilityRole="header" style={styles.title}>
            {title}
          </Text>
          <Text style={styles.description}>{description}</Text>
        </View>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export const teamFormStyles = StyleSheet.create({
  field: { gap: spacing.xs },
  label: { ...typography.label, color: colors.neutral950 },
  input: {
    ...typography.body,
    minHeight: 48,
    borderRadius: 8,
    borderColor: colors.neutral300,
    borderWidth: 1,
    backgroundColor: colors.white,
    color: colors.neutral950,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  multilineInput: { minHeight: 120, textAlignVertical: 'top' },
  helperText: { ...typography.tabLabel, color: colors.neutral500 },
  errorText: { ...typography.body, color: colors.error },
  offlineText: { ...typography.body, color: colors.neutral600 },
  submitButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.neutral950,
    paddingHorizontal: spacing.lg,
  },
  submitButtonDisabled: { opacity: 0.48 },
  submitButtonText: { ...typography.label, color: colors.white },
})

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.neutral50 },
  container: { flexGrow: 1, gap: spacing.xl, padding: spacing.xl },
  header: { gap: spacing.sm },
  title: { ...typography.title, color: colors.neutral950 },
  description: { ...typography.body, color: colors.neutral600 },
})
