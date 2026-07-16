import { ScreenPlaceholder } from '@/components/screen-placeholder'

export default function AuthCallbackScreen() {
  return (
    <ScreenPlaceholder
      eyebrow="Auth"
      title="인증 콜백"
      description="PKCE 기반 모바일 토큰 교환 endpoint가 준비되면 이 화면에서 처리합니다."
    />
  )
}
