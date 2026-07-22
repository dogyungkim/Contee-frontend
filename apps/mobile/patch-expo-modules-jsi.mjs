import { readFileSync, writeFileSync } from 'node:fs'

const packageUrl = new URL(
  './node_modules/expo-modules-jsi/package.json',
  import.meta.url
)
const sourceUrl = new URL(
  './node_modules/expo-modules-jsi/apple/Sources/ExpoModulesJSI/Coding/JavaScriptCodable+Date.swift',
  import.meta.url
)
const { version } = JSON.parse(readFileSync(packageUrl, 'utf8'))

if (version === '57.0.3') {
  const source = readFileSync(sourceUrl, 'utf8')
  const broken = 'abs(milliseconds) <= maxJavaScriptDateMilliseconds'
  const fixed = 'milliseconds.magnitude <= maxJavaScriptDateMilliseconds'

  if (!source.includes(fixed)) {
    if (!source.includes(broken)) {
      throw new Error('expo-modules-jsi 57.0.3 source does not match')
    }
    writeFileSync(sourceUrl, source.replace(broken, fixed))
  }
}
