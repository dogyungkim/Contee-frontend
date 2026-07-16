import { useLocalSearchParams } from 'expo-router'

import { ScreenPlaceholder } from '@/components/screen-placeholder'

export default function SharedContiScreen() {
  const { token } = useLocalSearchParams<{ token: string }>()

  return (
    <ScreenPlaceholder
      eyebrow="External Share"
      title="공유 콘티"
      description={`외부 공유 콘티를 연결할 자리입니다. token=${token ?? ''}`}
    />
  )
}
