import { getColorAccessibility } from './index.js'

// Test cases
const tests = [
  { fg: '#000000', bg: '#ffffff', expected: 'AAA' },
  { fg: '#777777', bg: '#ffffff', expected: 'FAIL' },
  { fg: '#aaaaaa', bg: '#ffffff', expected: 'FAIL' },
  { fg: '#ffffff', bg: '#0000ff', expected: 'AAA' },
]

console.log('Color Contrast Utility - Test Results\n')

tests.forEach(({ fg, bg, expected }) => {
  const result = getColorAccessibility(fg, bg)
  const status = result.wcagGrade === expected ? '✓' : '✗'
  console.log(`${status} ${fg} on ${bg}`)
  console.log(`  Contrast Ratio: ${result.contrastRatio.toFixed(2)}:1`)
  console.log(`  WCAG Grade: ${result.wcagGrade}`)
  console.log()
})

// Example with large text
console.log('Large text example (24px):')
const largeText = getColorAccessibility('#777777', '#ffffff', 24)
console.log(`  #777777 on #ffffff`)
console.log(`  Contrast Ratio: ${largeText.contrastRatio.toFixed(2)}:1`)
console.log(`  WCAG Grade: ${largeText.wcagGrade}`)
