/**
 * Lightweight QA for trusted Partner Concierge package resolution.
 * Run with: npx tsx lib/os/partnerConcierge/verifyPackages.ts
 */

import { resolvePartnerPackage } from './packages'

const cases = [
  { id: 'single', cents: 42500, label: '$425' },
  { id: 'five-pack', cents: 175000, label: '$1,750' },
  { id: 'ten-pack', cents: 340000, label: '$3,400' },
] as const

let failed = 0

for (const test of cases) {
  const pkg = resolvePartnerPackage(test.id)
  if (!pkg) {
    console.error(`FAIL: ${test.id} did not resolve`)
    failed += 1
    continue
  }
  if (pkg.priceCents !== test.cents) {
    console.error(
      `FAIL: ${test.id} expected ${test.cents} cents, got ${pkg.priceCents}`,
    )
    failed += 1
    continue
  }
  if (pkg.priceLabel !== test.label) {
    console.error(
      `FAIL: ${test.id} expected label ${test.label}, got ${pkg.priceLabel}`,
    )
    failed += 1
    continue
  }
  console.log(`OK: ${test.id} -> ${pkg.priceLabel} (${pkg.priceCents} cents)`)
}

const spoof = resolvePartnerPackage('custom-price')
if (spoof !== null) {
  console.error('FAIL: arbitrary package id should not resolve')
  failed += 1
} else {
  console.log('OK: arbitrary package id rejected')
}

if (failed > 0) {
  process.exit(1)
}

console.log('All package resolution checks passed.')
