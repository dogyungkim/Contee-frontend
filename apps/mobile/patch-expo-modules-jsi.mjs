import { readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

const require = createRequire(import.meta.url)
const packagePath = require.resolve('expo-modules-jsi/package.json')
const sourcePath = join(
  dirname(packagePath),
  'apple/Sources/ExpoModulesJSI/Coding/JavaScriptCodable+Date.swift'
)
const { version } = JSON.parse(readFileSync(packagePath, 'utf8'))

if (['57.0.3', '57.0.4'].includes(version)) {
  const source = readFileSync(sourcePath, 'utf8')
  const broken = 'abs(milliseconds) <= maxJavaScriptDateMilliseconds'
  const fixed = 'milliseconds.magnitude <= maxJavaScriptDateMilliseconds'

  if (!source.includes(fixed)) {
    if (!source.includes(broken)) {
      throw new Error(`expo-modules-jsi ${version} source does not match`)
    }
    writeFileSync(sourcePath, source.replace(broken, fixed))
  }
}
