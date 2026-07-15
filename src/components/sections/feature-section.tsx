import {
  BookOpenText,
  Download,
  FileText,
  GripHorizontal,
  Link2,
  Plus,
  Search,
  Star,
  Upload,
  Youtube,
} from 'lucide-react'

const songFormComponents = [
  { label: 'Intro', color: 'border-slate-200 bg-slate-50 text-slate-700' },
  { label: 'Verse', color: 'border-blue-200 bg-blue-50 text-blue-700' },
  { label: 'Pre-chorus', color: 'border-pink-200 bg-pink-50 text-pink-700' },
  { label: 'Chorus', color: 'border-purple-200 bg-purple-50 text-purple-700' },
  { label: 'Bridge', color: 'border-amber-200 bg-amber-50 text-amber-700' },
  { label: 'Outro', color: 'border-slate-200 bg-slate-50 text-slate-700' },
]

const songFormTimeline = [
  { label: 'Intro', badge: '8 마디', color: 'border-slate-200 bg-slate-50 text-slate-700' },
  { label: 'Verse 1', badge: '16 마디', color: 'border-blue-200 bg-blue-50 text-blue-700' },
  { label: 'Chorus', badge: 'x2', color: 'border-purple-200 bg-purple-50 text-purple-700' },
  { label: 'Bridge', badge: '8 마디', color: 'border-amber-200 bg-amber-50 text-amber-700' },
  { label: 'Chorus', badge: 'x2', color: 'border-purple-200 bg-purple-50 text-purple-700' },
  { label: 'Outro', badge: '4 마디', color: 'border-slate-200 bg-slate-50 text-slate-700' },
]

const contiDetailRows = [
  {
    title: '주님을 예배하는 것',
    artist: '제이어스',
    meta: 'A Key · 72 BPM',
    memo: '오프닝 멘트 후 바로 연결',
    parts: ['Intro', 'V1', 'Chorus', 'Bridge'],
  },
  {
    title: '주 이름 찬양',
    artist: '마커스워십',
    meta: 'B Key · 128 BPM',
    memo: '드럼 카운트 2마디',
    parts: ['Intro', 'V1', 'Pre', 'Chorus'],
  },
]

const shareActions = [
  {
    icon: Link2,
    title: '팀 링크',
    description: '공개된 콘티를 팀원이 같은 화면으로 확인합니다.',
  },
  {
    icon: Link2,
    title: '외부 공유',
    description: '필요할 때만 외부 링크를 만들고 끌 수 있습니다.',
  },
  {
    icon: Download,
    title: '악보 PDF',
    description: '업로드된 악보를 콘티 순서대로 하나로 묶습니다.',
  },
  {
    icon: Youtube,
    title: '유튜브 레퍼런스',
    description: '연습 링크를 Key/BPM 포함 여부에 맞춰 복사합니다.',
  },
]

const FeatureSection = () => {
  return (
    <section id="app-screens" className="text-keep border-b border-border bg-[#f7f7f7]">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
          <div>
            <div className="text-caption-upper text-muted-foreground">Product screens</div>
            <h2 className="mt-4 text-3xl font-semibold tracking-normal text-foreground sm:text-5xl">
              Contee 주요 기능
            </h2>
          </div>
        </div>

        <div className="mt-10 grid gap-6">
          <article className="overflow-hidden rounded-md border border-border bg-white">
            <div className="grid gap-0 lg:grid-cols-[0.34fr_0.66fr]">
              <div className="border-b border-border p-5 sm:p-7 lg:border-b-0 lg:border-r">
                <div className="text-caption-upper text-muted-foreground">Conti detail</div>
                <h3 className="mt-3 text-2xl font-semibold tracking-normal text-foreground">
                  콘티 상세 화면
                </h3>
                <p className="type-body mt-3 text-muted-foreground">
                  예배 정보, 말씀과 나눔, 곡별 Key/BPM, 송폼, 악보와 유튜브 링크가 한 화면에 모입니다.
                </p>
                <div className="mt-5 grid gap-2">
                  {['공개 상태', '외부 공유', 'PDF 내보내기', '말씀 & 나눔'].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span className="whitespace-nowrap">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#f4f4f4] p-3 sm:p-5">
                <div className="rounded-md border border-border bg-background px-4 py-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="type-badge flex flex-wrap items-center gap-2 uppercase tracking-widest text-muted-foreground">
                        <FileText className="h-3 w-3" />
                        Service Continuity
                        <span className="whitespace-nowrap rounded border border-[#cdded1] bg-[#f0faf3] px-1.5 py-0 text-[#257a3e]">공개</span>
                        <span className="whitespace-nowrap rounded border border-[#d8deeb] bg-[#f4f6fa] px-1.5 py-0 text-primary">외부 공유</span>
                      </div>
                      <h4 className="type-section-title mt-2">7월 셋째 주일 2부 예배</h4>
                      <p className="type-body-sm mt-1 text-muted-foreground">2026. 07. 19 · 오전 11:00 · 총 3곡</p>
                    </div>
                    <div className="grid min-w-0 grid-cols-1 gap-2 sm:flex">
                      <div className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border bg-white px-3 text-sm whitespace-nowrap">
                        <Download className="h-4 w-4" />
                        내보내기
                      </div>
                      <div className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border bg-white px-3 text-sm whitespace-nowrap">
                        <Link2 className="h-4 w-4" />
                        링크 관리
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 xl:grid-cols-[0.42fr_0.58fr]">
                  <div className="grid gap-4">
                    <div className="rounded-md border border-neutral-200 bg-white p-4">
                      <p className="type-label mb-2 text-amber-600">특이사항</p>
                      <p className="type-body-sm text-neutral-600">2번 곡 후 바로 기도 인도. 마지막 곡은 후렴 2회 반복.</p>
                    </div>
                    <div className="rounded-md border border-neutral-200 bg-white p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-200 bg-neutral-50">
                          <BookOpenText className="h-4 w-4 text-neutral-600" />
                        </div>
                        <h4 className="type-card-title">말씀 & 나눔</h4>
                      </div>
                      <div className="mt-3 rounded-md border border-neutral-200 bg-neutral-50/40 p-3">
                        <p className="type-label mb-1 text-neutral-700">본문</p>
                        <p className="type-body-sm font-semibold text-neutral-900">시편 103:1-5</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {contiDetailRows.map((song, index) => (
                      <div key={song.title} className="overflow-hidden rounded-md border border-neutral-200 bg-white shadow-sm">
                        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-neutral-100 bg-neutral-50/50 px-3 py-3">
                          <span className="type-label flex h-6 w-6 items-center justify-center rounded bg-neutral-200 text-neutral-600">
                            {index + 1}
                          </span>
                          <div className="min-w-0">
                            <h4 className="type-emphasis truncate">{song.title}</h4>
                            <div className="type-body-sm mt-1 text-neutral-500">{song.artist}</div>
                          </div>
                          <span className="type-badge hidden whitespace-nowrap rounded border border-border bg-white px-2 py-1 text-muted-foreground sm:inline-flex">
                            {song.meta}
                          </span>
                        </div>
                        <div className="space-y-3 px-3 py-3">
                          <p className="type-body-sm rounded-md border bg-muted/20 px-3 py-2 text-foreground">{song.memo}</p>
                          <div className="flex flex-wrap items-center gap-2">
                            {song.parts.map((part, partIndex) => (
                              <div key={`${song.title}-${part}-${partIndex}`} className="flex items-center gap-1.5">
                                <span className="type-badge whitespace-nowrap rounded border border-blue-100 bg-blue-50 px-2 py-1 text-blue-700">{part}</span>
                                {partIndex < song.parts.length - 1 && <span className="type-badge text-slate-300">→</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </article>

          <article id="song-form" className="overflow-hidden rounded-md border border-[#1a1a1a] bg-[#3B4663] text-white">
            <div className="grid gap-0 lg:grid-cols-[0.36fr_0.64fr]">
              <div className="border-b border-white/10 p-5 sm:p-7 lg:border-b-0 lg:border-r">
                <div className="text-caption-upper text-white/55">Song-form editor</div>
                <h3 className="mt-3 text-2xl font-semibold tracking-normal text-white">
                  곡 흐름을 부품처럼 조립합니다.
                </h3>
                <p className="type-body mt-3 text-white/72">
                  실제 송폼 편집 화면처럼 왼쪽에서 섹션을 추가하고, 오른쪽 타임라인에서 순서와 마디 수를 정리합니다.
                </p>
              </div>

              <div className="bg-[#303A52] p-3 sm:p-5">
                <div className="grid min-h-[460px] gap-4 lg:grid-cols-[0.32fr_0.68fr]">
                  <aside className="flex min-h-0 flex-col overflow-hidden rounded-md border border-white/10 bg-white text-foreground">
                    <div className="border-b border-gray-100 p-4">
                      <h4 className="type-panel-title">송폼 컴포넌트</h4>
                      <p className="type-badge mt-1 text-gray-500">클릭하여 송폼에 추가</p>
                    </div>
                    <div className="grid flex-1 grid-cols-2 gap-2 overflow-hidden p-3 lg:flex lg:flex-col">
                      {songFormComponents.map((part) => (
                        <div key={part.label} className="flex min-w-0 items-center gap-2 rounded-md border border-gray-200 bg-white p-2.5">
                          <Plus className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                          <span className={`h-5 w-1 shrink-0 rounded-full ${part.color.split(' ')[1]}`} />
                          <span className="type-control truncate text-gray-700">{part.label}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-100 p-3">
                      <div className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-border bg-white text-sm whitespace-nowrap">
                        <Plus className="h-3.5 w-3.5" />
                        커스텀 추가
                      </div>
                    </div>
                  </aside>

                  <div className="flex min-h-0 flex-col overflow-hidden rounded-md border border-white/10 bg-white text-foreground">
                    <div className="flex flex-col gap-2 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <h4 className="type-panel-title">송폼</h4>
                      <div className="flex items-center gap-2">
                        <span className="type-badge whitespace-nowrap rounded-full bg-gray-100 px-3 py-1 text-gray-600">6 Parts</span>
                        <span className="type-badge whitespace-nowrap rounded border border-border px-2 py-1 text-gray-600">전체 삭제</span>
                      </div>
                    </div>

                    <div className="flex-1 overflow-hidden p-4 sm:p-6">
                      <div className="grid gap-3 min-[420px]:grid-cols-2 xl:flex xl:flex-wrap">
                        {songFormTimeline.map((part) => (
                          <div key={`${part.label}-${part.badge}`} className="group relative flex min-w-0 flex-col items-center gap-3 xl:w-36">
                            <div className={`relative flex h-20 w-full min-w-0 flex-col justify-between rounded-md border-x border-b border-t-4 p-3 shadow-sm ${part.color}`}>
                              <div className="flex items-center justify-between gap-2">
                                <span className="type-badge truncate uppercase tracking-wider">{part.label}</span>
                                <span className="type-badge shrink-0 whitespace-nowrap rounded border border-black/10 bg-white/60 px-1.5 py-0.5">{part.badge}</span>
                              </div>
                              <div className="flex items-end justify-between">
                                <span className="type-badge whitespace-nowrap text-gray-500">마디</span>
                                <GripHorizontal className="h-4 w-4 text-gray-400" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col gap-2 border-t border-gray-100 bg-gray-50 px-4 py-3 sm:flex-row sm:items-center">
                      <span className="type-badge shrink-0 whitespace-nowrap uppercase tracking-widest text-gray-400">송폼 요약</span>
                      <div className="type-body-sm flex flex-wrap items-center gap-2 font-mono font-medium text-gray-600">
                        {['Intro(8)', 'V1(16)', 'Ch x2', 'Br(8)', 'Ch x2', 'Outro(4)'].map((part, index, items) => (
                          <div key={part} className="flex items-center gap-2">
                            <span className={part.includes('Ch') ? 'whitespace-nowrap font-bold text-primary' : 'whitespace-nowrap text-slate-600'}>{part}</span>
                            {index < items.length - 1 && <span className="text-gray-300">→</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>

          <article id="share-preview" className="rounded-md border border-border bg-white p-5 sm:p-7">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-xl">
                <div className="text-caption-upper text-muted-foreground">Share and export</div>
                <h3 className="mt-3 text-2xl font-semibold tracking-normal text-foreground">
                  공유와 내보내기도 실제 메뉴 이름 그대로 보여줍니다.
                </h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:w-[680px]">
                {shareActions.map((action) => {
                  const Icon = action.icon

                  return (
                    <div key={action.title} className="rounded-md border border-border bg-[#fafafa] p-4">
                      <Icon className={action.title === '유튜브 레퍼런스' ? 'h-5 w-5 text-red-500' : 'h-5 w-5 text-foreground'} />
                      <h4 className="mt-4 text-base font-semibold tracking-normal text-foreground">{action.title}</h4>
                      <p className="type-body-sm mt-2 text-muted-foreground">{action.description}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </article>

          <article className="rounded-md border border-border bg-white p-5 sm:p-7">
            <div className="grid gap-5 lg:grid-cols-[0.34fr_0.66fr] lg:items-start">
              <div>
                <div className="text-caption-upper text-muted-foreground">Song library</div>
                <h3 className="mt-3 text-2xl font-semibold tracking-normal text-foreground">
                  곡 라이브러리 화면도 제품 맥락에 맞게 짧게 노출합니다.
                </h3>
              </div>
              <div className="rounded-md border border-border bg-[#fafafa]">
                <div className="flex flex-col gap-3 border-b border-border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="type-card-title">팀 레퍼토리</h4>
                    <p className="type-body-sm mt-1 text-muted-foreground">총 128곡 중 24곡을 표시합니다.</p>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-[220px_auto]">
                    <div className="inline-flex h-10 min-w-0 items-center gap-2 rounded-md border border-border bg-white px-3 text-sm text-muted-foreground">
                      <Search className="h-4 w-4" />
                      <span className="truncate">곡명, 아티스트, Key, BPM 검색</span>
                    </div>
                    <div className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-white px-3 text-sm whitespace-nowrap">
                      <Star className="h-4 w-4 text-amber-500" />
                      즐겨찾기
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-border bg-white">
                  {[
                    ['주의 은혜라', '손경민', 'A Key', '72 BPM'],
                    ['주 이름 찬양', '마커스워십', 'B Key', '128 BPM'],
                    ['예수 우리 왕이여', '어노인팅', 'G Key', '74 BPM'],
                  ].map(([title, artist, key, bpm]) => (
                    <div key={title} className="grid gap-3 px-4 py-4 md:grid-cols-[minmax(0,1fr)_120px_120px_80px] md:items-center">
                      <div className="min-w-0">
                        <div className="flex min-w-0 items-center gap-2">
                          <p className="truncate text-sm font-medium text-foreground">{title}</p>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{artist}</p>
                      </div>
                      <span className="font-mono text-xs text-muted-foreground">{key}</span>
                      <span className="font-mono text-xs text-muted-foreground">{bpm}</span>
                      <Upload className="hidden h-4 w-4 text-muted-foreground md:block" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}

export default FeatureSection
