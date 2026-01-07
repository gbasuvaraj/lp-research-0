import chroma from 'chroma-js'

/**
 * Get contrast ratio and WCAG grading for two colors
 * @param {string} foreground - Text/foreground color (hex, rgb, etc.)
 * @param {string} background - Background color (hex, rgb, etc.)
 * @param {number} fontSize - Font size in px (default: 16 for normal text rules)
 * @param {boolean} bold - Whether text is bold (default: false)
 * @returns {{ contrastRatio: number, wcagGrade: 'AAA' | 'AA' | 'FAIL' }}
 */
export function getColorAccessibility(foreground, background, fontSize = 16, bold = false) {
  const contrastRatio = chroma.contrast(foreground, background)

  let wcagGrade
  const isLargeText = fontSize >= 24 || (fontSize >= 18.66 && bold)

  if (isLargeText) {
    // Large text thresholds
    if (contrastRatio >= 4.5) wcagGrade = 'AAA'
    else if (contrastRatio >= 3) wcagGrade = 'AA'
    else wcagGrade = 'FAIL'
  } else {
    // Normal text thresholds
    if (contrastRatio >= 7) wcagGrade = 'AAA'
    else if (contrastRatio >= 4.5) wcagGrade = 'AA'
    else wcagGrade = 'FAIL'
  }

  return { contrastRatio, wcagGrade }
}

export default getColorAccessibility
