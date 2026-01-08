import { scaleLinear } from 'd3-scale'
import { interpolateRgb, interpolateHsl, interpolateLab, interpolateHcl } from 'd3-interpolate'
import chroma from 'chroma-js'
import { getColorAccessibility } from './colorContrast'

const interpolators = {
  RGB: interpolateRgb,
  HSL: interpolateHsl,
  LAB: interpolateLab,
  HCL: interpolateHcl,
}

/**
 * Check if a color string is valid
 * @param {string} color - Color string to validate
 * @returns {boolean}
 */
export function isValidColor(color) {
  try {
    chroma(color)
    return true
  } catch {
    return false
  }
}

/**
 * Generate interpolated colors from input colors
 * @param {Object} options - Generation options
 * @param {string[]} options.inputColors - Array of color strings (minimum 2)
 * @param {number} options.totalColors - Number of colors to generate (minimum 2)
 * @param {'RGB'|'HSL'|'LAB'|'HCL'} [options.interpolation='RGB'] - Interpolation method
 * @param {string} [options.backgroundColor] - Background color for accessibility check (optional)
 * @returns {Array<{color: string, accessibility?: {contrastRatio: number, wcagGrade: string}}>}
 */
export function generateColorScale({
  inputColors,
  totalColors,
  interpolation = 'RGB',
  backgroundColor = null,
}) {
  if (!inputColors || inputColors.length < 2 || totalColors < 2) {
    return []
  }

  const interpolate = interpolators[interpolation] || interpolateRgb

  // Create a scale that maps [0, 1] to our input colors
  const domain = inputColors.map((_, i) => i / (inputColors.length - 1))
  const colorScale = scaleLinear()
    .domain(domain)
    .range(inputColors)
    .interpolate(interpolate)

  // Generate the requested number of colors
  const colors = []
  for (let i = 0; i < totalColors; i++) {
    const t = i / (totalColors - 1)
    const color = colorScale(t)

    const result = { color }

    // Add accessibility info if background color is provided
    if (backgroundColor && isValidColor(backgroundColor)) {
      result.accessibility = getColorAccessibility(color, backgroundColor)
    }

    colors.push(result)
  }

  return colors
}

/**
 * Generate interpolated colors (simple version - just returns color strings)
 * @param {string[]} inputColors - Array of color strings (minimum 2)
 * @param {number} totalColors - Number of colors to generate (minimum 2)
 * @param {'RGB'|'HSL'|'LAB'|'HCL'} [interpolation='RGB'] - Interpolation method
 * @returns {string[]} Array of color strings
 */
export function generateColors(inputColors, totalColors, interpolation = 'RGB') {
  const result = generateColorScale({ inputColors, totalColors, interpolation })
  return result.map(item => item.color)
}

export default generateColorScale
