const A4_WIDTH = 595.28
const A4_HEIGHT = 841.89
const PAGE_MARGIN = 24
const METADATA_GAP = 10
const METADATA_CANVAS_WIDTH = 1600
const HEADER_CANVAS_HEIGHT = 60
const FOOTER_CANVAS_HEIGHT = 68

/**
 * @typedef {{ partOrder?: number | null, partType?: string, customPartName?: string, repeatCount?: number, barCount?: number, note?: string }} PdfSongFormPart
 * @typedef {{ title?: string, orderIndex?: number, key?: string, bpm?: number, sheetMusicUrl?: string, sheetMusicFile?: { downloadUrl?: string } | null, songForm?: PdfSongFormPart[], teamSong?: { sheetMusicUrl?: string } }} PdfContiSong
 * @typedef {{ title: string, key?: string, bpm?: number, url: string, orderNumber: number, songFormSummary: string }} PdfSheetSource
 * @typedef {{ header?: Uint8Array, footer?: Uint8Array }} PdfMetadataImages
 */

const SONG_FORM_ABBR = {
  INTRO: 'Intro',
  VERSE: 'V',
  PRE_CHORUS: 'PC',
  CHORUS: 'C',
  BRIDGE: 'B',
  INTERLUDE: 'Inter',
  OUTRO: 'Outro',
  TAG: 'Tag',
  INSTRUMENTAL: 'Inst',
  ENDING: 'Ending',
}

/**
 * @param {PdfSongFormPart[]} parts
 */
export function createSongFormSummary(parts = []) {
  if (parts.length === 0) return '등록된 곡 구성이 없습니다.'

  return parts
    .map((part, arrayIndex) => ({ part, arrayIndex }))
    .sort(
      (a, b) =>
        (a.part.partOrder ?? a.arrayIndex) -
        (b.part.partOrder ?? b.arrayIndex) ||
        a.arrayIndex - b.arrayIndex,
    )
    .map(({ part }) => {
      const customName = part.customPartName?.trim()
      let label =
        part.partType === 'CUSTOM'
          ? customName || 'Custom'
          : SONG_FORM_ABBR[part.partType] || customName || part.partType || 'Part'
      const numberedTypes = ['VERSE', 'INTERLUDE', 'TAG']
      const number = (part.note || customName || '').match(/\d+/)?.[0]

      if (numberedTypes.includes(part.partType) && number) {
        label += number
      }
      if (
        ['INTRO', 'INTERLUDE', 'INSTRUMENTAL', 'OUTRO', 'ENDING'].includes(
          part.partType,
        ) &&
        part.barCount
      ) {
        label += `(${part.barCount})`
      }
      if ((part.repeatCount ?? 1) > 1) {
        label += ` x${part.repeatCount}`
      }

      return label
    })
    .join(' → ')
}

/**
 * @param {PdfContiSong[]} songs
 * @returns {PdfSheetSource[]}
 */
export function getPdfSheetSources(songs) {
  return songs
    .map((song, arrayIndex) => ({
      title: song.title?.trim() || `곡 ${arrayIndex + 1}`,
      key: song.key?.trim(),
      bpm: song.bpm,
      orderIndex: song.orderIndex ?? arrayIndex,
      arrayIndex,
      url: (
        song.sheetMusicFile?.downloadUrl ||
        song.sheetMusicUrl ||
        song.teamSong?.sheetMusicUrl ||
        ''
      ).trim(),
      songFormSummary: createSongFormSummary(song.songForm),
    }))
    .filter((song) => song.url)
    .sort((a, b) => a.orderIndex - b.orderIndex || a.arrayIndex - b.arrayIndex)
    .map(({ title, key, bpm, url, songFormSummary }, index) => ({
      title,
      key,
      bpm,
      url,
      orderNumber: index + 1,
      songFormSummary,
    }))
}

/**
 * @param {string} title
 * @param {string} worshipDate
 */
export function createContiPdfFilename(title, worshipDate) {
  const safeTitle =
    title
      .replace(/[<>:"/\\|?*\u0000-\u001F]/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/[. ]+$/g, '')
      .trim() || '콘티'
  const datePrefix = worshipDate ? `${worshipDate}_` : ''

  return `${datePrefix}${safeTitle}_악보.pdf`
}

/**
 * @param {Uint8Array} bytes
 */
function getFileKind(bytes) {
  if (
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46
  ) {
    return 'pdf'
  }
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return 'png'
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    return 'jpg'
  }

  return 'unknown'
}

/**
 * @param {CanvasRenderingContext2D} context
 * @param {string} text
 * @param {number} maxWidth
 * @param {number} preferredSize
 * @param {number} minimumSize
 * @param {number} weight
 */
function fitCanvasText(
  context,
  text,
  maxWidth,
  preferredSize,
  minimumSize,
  weight,
) {
  let fontSize = preferredSize

  while (fontSize > minimumSize) {
    context.font = `${weight} ${fontSize}px Pretendard, "Noto Sans KR", sans-serif`
    if (context.measureText(text).width <= maxWidth) break
    fontSize -= 1
  }

  return fontSize
}

/**
 * @param {HTMLCanvasElement} canvas
 */
async function canvasToPngBytes(canvas) {
  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((value) => {
      if (value) resolve(value)
      else reject(new Error('PDF 메타데이터 이미지를 만들지 못했습니다.'))
    }, 'image/png')
  })

  return new Uint8Array(await blob.arrayBuffer())
}

/**
 * @param {CanvasRenderingContext2D} context
 * @param {string} summary
 */
function getSummaryLines(context, summary) {
  const maxWidth = METADATA_CANVAS_WIDTH - 80
  const parts = summary.split(' → ')
  const lines = []
  let currentLine = ''

  for (const part of parts) {
    const candidate = currentLine ? `${currentLine} → ${part}` : part
    if (context.measureText(candidate).width <= maxWidth) {
      currentLine = candidate
      continue
    }

    if (currentLine) lines.push(currentLine)
    currentLine = part
    if (lines.length === 2) break
  }
  if (currentLine && lines.length < 2) lines.push(currentLine)

  const joinedLength = lines.join(' → ').replace(/ → → /g, ' → ').length
  if (joinedLength < summary.length && lines.length > 0) {
    let lastLine = lines[lines.length - 1]
    while (
      lastLine.length > 1 &&
      context.measureText(`${lastLine}...`).width > maxWidth
    ) {
      lastLine = lastLine.slice(0, -1)
    }
    lines[lines.length - 1] = `${lastLine}...`
  }

  return lines
}

/**
 * @param {PdfSheetSource} source
 * @returns {Promise<PdfMetadataImages>}
 */
async function renderMetadataImages(source) {
  if (typeof document === 'undefined') return {}

  const headerCanvas = document.createElement('canvas')
  headerCanvas.width = METADATA_CANVAS_WIDTH
  headerCanvas.height = HEADER_CANVAS_HEIGHT
  const headerContext = headerCanvas.getContext('2d')
  if (!headerContext) throw new Error('PDF 제목 영역을 만들지 못했습니다.')

  headerContext.fillStyle = '#ffffff'
  headerContext.fillRect(0, 0, headerCanvas.width, headerCanvas.height)
  headerContext.fillStyle = '#171717'
  const musicalInfo = [source.key, source.bpm].filter(
    (value) => value !== undefined && value !== null && value !== '',
  )
  const title = `${source.orderNumber}. ${source.title}${musicalInfo.length > 0 ? ` - ${musicalInfo.join(' : ')}` : ''
    }`
  const titleSize = fitCanvasText(
    headerContext,
    title,
    METADATA_CANVAS_WIDTH - 20,
    44,
    28,
    700,
  )
  headerContext.font = `700 ${titleSize}px Pretendard, "Noto Sans KR", sans-serif`
  headerContext.textBaseline = 'middle'
  headerContext.fillText(title, 10, HEADER_CANVAS_HEIGHT / 2)
  headerContext.strokeStyle = '#d4d4d4'
  headerContext.lineWidth = 2
  headerContext.beginPath()
  headerContext.moveTo(10, HEADER_CANVAS_HEIGHT - 2)
  headerContext.lineTo(METADATA_CANVAS_WIDTH - 10, HEADER_CANVAS_HEIGHT - 2)
  headerContext.stroke()

  const footerCanvas = document.createElement('canvas')
  footerCanvas.width = METADATA_CANVAS_WIDTH
  footerCanvas.height = FOOTER_CANVAS_HEIGHT
  const footerContext = footerCanvas.getContext('2d')
  if (!footerContext) throw new Error('PDF 곡 구성 영역을 만들지 못했습니다.')

  footerContext.fillStyle = '#ffffff'
  footerContext.fillRect(0, 0, footerCanvas.width, footerCanvas.height)
  footerContext.fillStyle = '#171717'
  const summarySize = fitCanvasText(
    footerContext,
    source.songFormSummary,
    METADATA_CANVAS_WIDTH - 80,
    44,
    28,
    700,
  )
  footerContext.font = `700 ${summarySize}px Pretendard, "Noto Sans KR", sans-serif`
  footerContext.textAlign = 'center'
  footerContext.textBaseline = 'middle'
  const summaryLines = getSummaryLines(footerContext, source.songFormSummary)
  const lineHeight = summarySize * 1.35
  const firstLineY =
    FOOTER_CANVAS_HEIGHT / 2 - ((summaryLines.length - 1) * lineHeight) / 2
  summaryLines.forEach((line, index) => {
    footerContext.fillText(
      line,
      METADATA_CANVAS_WIDTH / 2,
      firstLineY + index * lineHeight,
    )
  })

  return {
    header: await canvasToPngBytes(headerCanvas),
    footer: await canvasToPngBytes(footerCanvas),
  }
}

/**
 * @param {import('pdf-lib').PDFDocument} outputDocument
 * @param {import('pdf-lib').PDFPage} outputPage
 * @param {PdfMetadataImages} metadata
 * @param {boolean} showHeader
 * @param {boolean} showFooter
 */
async function drawMetadata(
  outputDocument,
  outputPage,
  metadata,
  showHeader,
  showFooter,
) {
  let headerHeight = 0
  let footerHeight = 0

  if (showHeader && metadata.header) {
    const header = await outputDocument.embedPng(metadata.header)
    headerHeight =
      (A4_WIDTH - PAGE_MARGIN * 2) * (header.height / header.width)
    outputPage.drawImage(header, {
      x: PAGE_MARGIN,
      y: A4_HEIGHT - PAGE_MARGIN - headerHeight,
      width: A4_WIDTH - PAGE_MARGIN * 2,
      height: headerHeight,
    })
  }

  if (showFooter && metadata.footer) {
    const footer = await outputDocument.embedPng(metadata.footer)
    footerHeight =
      (A4_WIDTH - PAGE_MARGIN * 2) * (footer.height / footer.width)
    outputPage.drawImage(footer, {
      x: PAGE_MARGIN,
      y: PAGE_MARGIN,
      width: A4_WIDTH - PAGE_MARGIN * 2,
      height: footerHeight,
    })
  }

  return {
    top:
      A4_HEIGHT -
      PAGE_MARGIN -
      (headerHeight > 0 ? headerHeight + METADATA_GAP : 0),
    bottom:
      PAGE_MARGIN + (footerHeight > 0 ? footerHeight + METADATA_GAP : 0),
  }
}

/**
 * @param {import('pdf-lib').PDFDocument} outputDocument
 * @param {import('pdf-lib').PDFPage} outputPage
 * @param {{ width: number, height: number }} content
 * @param {{ top: number, bottom: number }} bounds
 */
function getContentPlacement(outputPage, content, bounds) {
  const availableWidth = outputPage.getWidth() - PAGE_MARGIN * 2
  const availableHeight = bounds.top - bounds.bottom
  const scale = Math.min(
    availableWidth / content.width,
    availableHeight / content.height,
  )
  const width = content.width * scale
  const height = content.height * scale

  return {
    x: (outputPage.getWidth() - width) / 2,
    y: bounds.bottom + (availableHeight - height) / 2,
    width,
    height,
  }
}

/**
 * @param {import('pdf-lib').PDFDocument} outputDocument
 * @param {Uint8Array} bytes
 * @param {typeof import('pdf-lib').PDFDocument} PdfDocument
 * @param {PdfMetadataImages} metadata
 */
async function appendSource(outputDocument, bytes, PdfDocument, metadata) {
  const fileKind = getFileKind(bytes)

  if (fileKind === 'pdf') {
    const sourceDocument = await PdfDocument.load(bytes)
    const sourcePages = sourceDocument.getPages()

    for (const [index, sourcePage] of sourcePages.entries()) {
      // pdf-lib cannot embed a page without a content stream, so add an
      // invisible mark to keep genuinely blank score pages valid.
      sourcePage.drawRectangle({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        opacity: 0,
      })
      const embeddedPage = await outputDocument.embedPage(sourcePage)
      const outputPage = outputDocument.addPage([A4_WIDTH, A4_HEIGHT])
      const bounds = await drawMetadata(
        outputDocument,
        outputPage,
        metadata,
        index === 0,
        index === sourcePages.length - 1,
      )
      const placement = getContentPlacement(
        outputPage,
        embeddedPage,
        bounds,
      )
      outputPage.drawPage(embeddedPage, placement)
    }

    return sourcePages.length
  }

  if (fileKind === 'png' || fileKind === 'jpg') {
    const image =
      fileKind === 'png'
        ? await outputDocument.embedPng(bytes)
        : await outputDocument.embedJpg(bytes)
    const page = outputDocument.addPage([A4_WIDTH, A4_HEIGHT])
    const bounds = await drawMetadata(
      outputDocument,
      page,
      metadata,
      true,
      true,
    )
    const placement = getContentPlacement(page, image, bounds)

    page.drawImage(image, placement)
    return 1
  }

  throw new Error('지원하지 않는 악보 파일 형식입니다.')
}

/**
 * @param {PdfSheetSource} source
 * @param {typeof fetch} fetcher
 * @param {number} timeoutMs
 * @param {((url: string, signal: AbortSignal) => Promise<Uint8Array>) | undefined} sourceLoader
 */
async function fetchSource(source, fetcher, timeoutMs, sourceLoader) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    if (sourceLoader) {
      return await sourceLoader(source.url, controller.signal)
    }

    const response = await fetcher(source.url, { signal: controller.signal })
    if (!response.ok) {
      throw new Error(`악보를 불러오지 못했습니다. (${response.status})`)
    }

    return new Uint8Array(await response.arrayBuffer())
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error('악보 응답 시간이 초과되었습니다.')
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * @param {PdfSheetSource[]} sources
 * @param {{ fetcher?: typeof fetch, sourceLoader?: (url: string, signal: AbortSignal) => Promise<Uint8Array>, metadataRenderer?: (source: PdfSheetSource) => Promise<PdfMetadataImages>, onProgress?: (current: number, total: number, title: string) => void, timeoutMs?: number }} [options]
 */
export async function buildContiSheetMusicPdf(sources, options = {}) {
  const { PDFDocument } = await import('pdf-lib')
  const outputDocument = await PDFDocument.create()
  const failures = []
  let mergedCount = 0
  const fetcher = options.fetcher ?? fetch
  const sourceLoader = options.sourceLoader
  const metadataRenderer = options.metadataRenderer ?? renderMetadataImages
  const timeoutMs = options.timeoutMs ?? 15_000
  const fetchedSources = await Promise.all(
    sources.map(async (source) => {
      try {
        const [bytes, metadata] = await Promise.all([
          fetchSource(source, fetcher, timeoutMs, sourceLoader),
          metadataRenderer(source),
        ])
        return {
          source,
          bytes,
          metadata,
        }
      } catch (error) {
        return { source, error }
      }
    }),
  )

  for (const [index, fetchedSource] of fetchedSources.entries()) {
    const { source } = fetchedSource
    options.onProgress?.(index + 1, sources.length, source.title)

    try {
      if ('error' in fetchedSource) {
        throw fetchedSource.error
      }
      const addedPageCount = await appendSource(
        outputDocument,
        fetchedSource.bytes,
        PDFDocument,
        fetchedSource.metadata,
      )
      if (addedPageCount === 0) {
        throw new Error('페이지가 없는 PDF입니다.')
      }
      mergedCount += 1
    } catch (error) {
      failures.push({
        title: source.title,
        message:
          error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      })
    }
  }

  if (mergedCount === 0) {
    const error = new Error('병합할 수 있는 악보가 없습니다.')
    error.failures = failures
    throw error
  }

  return {
    bytes: await outputDocument.save(),
    mergedCount,
    failures,
  }
}

/**
 * @param {Uint8Array} bytes
 * @param {string} filename
 */
export function downloadPdf(bytes, filename) {
  const blob = new Blob([bytes], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}
