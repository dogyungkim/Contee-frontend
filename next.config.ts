import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // CSS 최적화 설정
  compiler: {
    // CSS 압축 시 Safari 호환성 고려
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // 웹팩 설정으로 Safari 호환성 개선
  webpack: (config, { isServer }) => {
    // Safari에서 문제가 될 수 있는 최적화 비활성화
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }
    return config
  },
}

export default nextConfig
