import { useLocalSearchParams } from 'expo-router'

import { ScreenPlaceholder } from '@/components/screen-placeholder'

export default function ContiDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return (
    <ScreenPlaceholder
      eyebrow="Conti Detail"
      title="콘티 상세"
      description={`read-only 콘티 상세를 연결할 자리입니다. id=${id ?? ''}`}
    />
  )
}
