import { Link } from 'expo-router'

import { ScreenPlaceholder } from '@/components/screen-placeholder'

export default function NotFoundScreen() {
  return (
    <ScreenPlaceholder
      eyebrow="404"
      title="화면을 찾을 수 없습니다."
      description="요청한 경로가 없거나 아직 모바일 앱에 구현되지 않았습니다."
      action={<Link href="/contis">콘티로 돌아가기</Link>}
    />
  )
}
