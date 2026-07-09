import assert from 'node:assert/strict'
import test from 'node:test'

import { PDFDocument } from 'pdf-lib'

import {
  buildContiSheetMusicPdf,
  createContiPdfFilename,
  createSongFormSummary,
  getPdfSheetSources,
} from '../src/domains/conti/utils/conti-pdf.js'

test('collects only songs with sheet music in conti order', () => {
  assert.deepEqual(
    getPdfSheetSources([
      { title: '두 번째 곡', orderIndex: 1, sheetMusicUrl: ' https://example.com/2.pdf ' },
      { title: '악보 없음', orderIndex: 2 },
      {
        title: '업로드 악보',
        orderIndex: 3,
        sheetMusicUrl: 'https://example.com/legacy.pdf',
        sheetMusicFile: { downloadUrl: ' /api/v1/contis/1/songs/3/sheet-music ' },
      },
      {
        title: '첫 번째 곡',
        orderIndex: 0,
        key: 'A',
        bpm: 72,
        teamSong: { sheetMusicUrl: 'https://example.com/1.pdf' },
        songForm: [
          { partOrder: 0, partType: 'INTRO', barCount: 4, repeatCount: 1 },
          { partOrder: 1, partType: 'VERSE', note: 'Verse 1', repeatCount: 1 },
          { partOrder: 2, partType: 'CHORUS', repeatCount: 2 },
        ],
      },
    ]),
    [
      {
        title: '첫 번째 곡',
        key: 'A',
        bpm: 72,
        url: 'https://example.com/1.pdf',
        orderNumber: 1,
        songFormSummary: 'Intro(4) → V1 → C x2',
      },
      {
        title: '두 번째 곡',
        key: undefined,
        bpm: undefined,
        url: 'https://example.com/2.pdf',
        orderNumber: 2,
        songFormSummary: '등록된 곡 구성이 없습니다.',
      },
      {
        title: '업로드 악보',
        key: undefined,
        bpm: undefined,
        url: '/api/v1/contis/1/songs/3/sheet-music',
        orderNumber: 3,
        songFormSummary: '등록된 곡 구성이 없습니다.',
      },
    ],
  )
})

test('summarizes song form in its configured order', () => {
  assert.equal(
    createSongFormSummary([
      { partOrder: 2, partType: 'CHORUS', repeatCount: 2 },
      { partOrder: 0, partType: 'CUSTOM', customPartName: '기도' },
      { partOrder: 1, partType: 'INTERLUDE', note: 'Interlude 1', barCount: 8 },
    ]),
    '기도 → Inter1(8) → C x2',
  )
})

test('creates a safe and descriptive PDF filename', () => {
  assert.equal(
    createContiPdfFilename('주일 / 2부: 예배', '2026-07-05'),
    '2026-07-05_주일 2부 예배_악보.pdf',
  )
})

test('merges PDF sources and keeps going when one source fails', async () => {
  const first = await PDFDocument.create()
  first.addPage()
  const firstBytes = await first.save()
  const second = await PDFDocument.create()
  second.addPage()
  second.addPage()
  const secondBytes = await second.save()
  const files = new Map([
    ['https://example.com/first.pdf', firstBytes],
    ['https://example.com/second.pdf', secondBytes],
  ])

  const result = await buildContiSheetMusicPdf(
    [
      { title: '첫 곡', url: 'https://example.com/first.pdf' },
      { title: '실패 곡', url: 'https://example.com/missing.pdf' },
      { title: '둘째 곡', url: 'https://example.com/second.pdf' },
    ],
    {
      fetcher: async (url) => {
        const body = files.get(url)
        return new Response(body, { status: body ? 200 : 404 })
      },
    },
  )

  const merged = await PDFDocument.load(result.bytes)
  assert.equal(merged.getPageCount(), 3)
  assert.deepEqual(merged.getPage(0).getSize(), {
    width: 595.28,
    height: 841.89,
  })
  assert.equal(result.mergedCount, 2)
  assert.deepEqual(result.failures.map((failure) => failure.title), ['실패 곡'])
})

test('stops waiting for an unresponsive sheet source', async () => {
  await assert.rejects(
    buildContiSheetMusicPdf(
      [{ title: '응답 없는 곡', url: 'https://example.com/hanging.pdf' }],
      {
        fetcher: async (_url, { signal }) =>
          new Promise((_resolve, reject) => {
            signal.addEventListener('abort', () => reject(signal.reason))
          }),
        timeoutMs: 5,
      },
    ),
    (error) => {
      assert.deepEqual(error.failures, [
        {
          title: '응답 없는 곡',
          message: '악보 응답 시간이 초과되었습니다.',
        },
      ])
      return true
    },
  )
})
