import { useState, useMemo } from 'react'
import { generateColorScale, isValidColor } from '../utils/generateColorScale'
import './D3ColorExplorer.css'

// Preset color palettes
const presetPalettes = {
  'Sunset': {
    6: ['#ff6b6b', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3'],
    9: ['#ff6b6b', '#ff9f43', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#1dd1a1'],
  },
  'Ocean': {
    6: ['#0c2461', '#1e3799', '#4a69bd', '#6a89cc', '#82ccdd', '#b8e994'],
    9: ['#0c2461', '#1e3799', '#3c6382', '#4a69bd', '#6a89cc', '#82ccdd', '#b8e994', '#78e08f', '#38ada9'],
  },
  'Earth': {
    6: ['#6d4c41', '#8d6e63', '#a1887f', '#d7ccc8', '#8bc34a', '#558b2f'],
    9: ['#4e342e', '#6d4c41', '#8d6e63', '#a1887f', '#bcaaa4', '#d7ccc8', '#aed581', '#8bc34a', '#558b2f'],
  },
  'Neon': {
    6: ['#f72585', '#7209b7', '#3a0ca3', '#4361ee', '#4cc9f0', '#80ffdb'],
    9: ['#f72585', '#b5179e', '#7209b7', '#560bad', '#3a0ca3', '#3f37c9', '#4361ee', '#4cc9f0', '#80ffdb'],
  },
  'Pastel': {
    6: ['#ffeaa7', '#fdcb6e', '#fab1a0', '#ff7675', '#a29bfe', '#74b9ff'],
    9: ['#ffeaa7', '#fdcb6e', '#f8b739', '#fab1a0', '#ff7675', '#fd79a8', '#a29bfe', '#74b9ff', '#81ecec'],
  },
  // Colorblind-friendly palettes
  'Wong (CB)': {
    6: ['#000000', '#E69F00', '#56B4E9', '#009E73', '#F0E442', '#CC79A7'],
    9: ['#000000', '#E69F00', '#56B4E9', '#009E73', '#F0E442', '#0072B2', '#D55E00', '#CC79A7', '#999999'],
  },
  'Okabe-Ito (CB)': {
    6: ['#E69F00', '#56B4E9', '#009E73', '#0072B2', '#D55E00', '#CC79A7'],
    9: ['#E69F00', '#56B4E9', '#009E73', '#F0E442', '#0072B2', '#D55E00', '#CC79A7', '#000000', '#999999'],
  },
  'IBM (CB)': {
    6: ['#648FFF', '#785EF0', '#DC267F', '#FE6100', '#FFB000', '#22223B'],
    9: ['#648FFF', '#785EF0', '#DC267F', '#FE6100', '#FFB000', '#002D9C', '#E4E4E4', '#22223B', '#009E73'],
  },
  'Tol Bright (CB)': {
    6: ['#4477AA', '#EE6677', '#228833', '#CCBB44', '#66CCEE', '#AA3377'],
    9: ['#4477AA', '#EE6677', '#228833', '#CCBB44', '#66CCEE', '#AA3377', '#BBBBBB', '#332288', '#EE7733'],
  },
  'Tol Muted (CB)': {
    6: ['#332288', '#88CCEE', '#44AA99', '#117733', '#999933', '#CC6677'],
    9: ['#332288', '#88CCEE', '#44AA99', '#117733', '#999933', '#DDCC77', '#CC6677', '#882255', '#AA4499'],
  },
}

const D3ColorExplorer = () => {
  const [inputColors, setInputColors] = useState(presetPalettes['Sunset'][6])
  const [inputColorTexts, setInputColorTexts] = useState(presetPalettes['Sunset'][6])
  const [totalColors, setTotalColors] = useState(10)
  const [interpolation, setInterpolation] = useState('RGB')
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [backgroundColorInput, setBackgroundColorInput] = useState('#ffffff')
  const [sampleText, setSampleText] = useState('Sample')

  const applyPreset = (paletteName, colorCount) => {
    const colors = presetPalettes[paletteName][colorCount]
    setInputColors([...colors])
    setInputColorTexts([...colors])
    if (totalColors < colors.length) {
      setTotalColors(colors.length)
    }
  }

  const addColor = () => {
    const newLength = inputColors.length + 1
    setInputColors([...inputColors, '#888888'])
    setInputColorTexts([...inputColorTexts, '#888888'])
    if (totalColors < newLength) {
      setTotalColors(newLength)
    }
  }

  const removeColor = (index) => {
    if (inputColors.length > 2) {
      setInputColors(inputColors.filter((_, i) => i !== index))
      setInputColorTexts(inputColorTexts.filter((_, i) => i !== index))
    }
  }

  const updateColorFromPicker = (index, value) => {
    const newColors = [...inputColors]
    newColors[index] = value
    setInputColors(newColors)
    const newTexts = [...inputColorTexts]
    newTexts[index] = value
    setInputColorTexts(newTexts)
  }

  const updateColorFromText = (index, value) => {
    const newTexts = [...inputColorTexts]
    newTexts[index] = value
    setInputColorTexts(newTexts)
    if (isValidColor(value)) {
      const newColors = [...inputColors]
      newColors[index] = value
      setInputColors(newColors)
    }
  }

  const generatedColors = useMemo(() => {
    return generateColorScale({
      inputColors,
      totalColors,
      interpolation,
      backgroundColor,
    })
  }, [inputColors, totalColors, interpolation, backgroundColor])

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  const copyAllColors = () => {
    const colorList = generatedColors.map(c => c.color).join(', ')
    navigator.clipboard.writeText(colorList)
  }

  const failedCount = generatedColors.filter(c => c.accessibility.wcagGrade === 'FAIL').length

  return (
    <div className="d3-color-explorer">
      <div className="explorer-header">
        <h2>D3 Color Scale Explorer</h2>
        <p>Define input colors and generate interpolated color palettes using D3's color scales.</p>
      </div>

      <div className="preset-palettes">
        <h3>Preset Palettes</h3>
        <div className="palette-grid">
          {Object.entries(presetPalettes).map(([name, variants]) => (
            <div key={name} className="palette-card">
              <div className="palette-name">{name}</div>
              <div className="palette-preview">
                {variants[6].map((color, i) => (
                  <div key={i} className="preview-color" style={{ backgroundColor: color }} />
                ))}
              </div>
              <div className="palette-actions">
                <button onClick={() => applyPreset(name, 6)}>6 Colors</button>
                <button onClick={() => applyPreset(name, 9)}>9 Colors</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="explorer-controls">
        <div className="control-section">
          <h3>Input Colors</h3>
          <p className="section-desc">Add colors to define your gradient stops (minimum 2)</p>
          <div className="color-inputs">
            {inputColors.map((color, index) => (
              <div key={index} className="color-input-row">
                <span className="color-index">{index + 1}</span>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => updateColorFromPicker(index, e.target.value)}
                />
                <input
                  type="text"
                  value={inputColorTexts[index]}
                  onChange={(e) => updateColorFromText(index, e.target.value)}
                  className={`color-text ${!isValidColor(inputColorTexts[index]) ? 'invalid' : ''}`}
                />
                <button
                  onClick={() => removeColor(index)}
                  disabled={inputColors.length <= 2}
                  className="remove-btn"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button onClick={addColor} className="add-color-btn">
            + Add Color
          </button>
        </div>

        <div className="control-section">
          <h3>Generation Settings</h3>
          <div className="settings-row">
            <label>
              Total Colors to Generate:
              <div className="stepper-input">
                <button
                  className="stepper-btn"
                  onClick={() => setTotalColors(Math.max(inputColors.length, totalColors - 1))}
                  disabled={totalColors <= inputColors.length}
                >
                  -
                </button>
                <input
                  type="number"
                  min={inputColors.length}
                  max="100"
                  value={totalColors}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || inputColors.length
                    setTotalColors(Math.min(100, Math.max(inputColors.length, val)))
                  }}
                />
                <button
                  className="stepper-btn"
                  onClick={() => setTotalColors(Math.min(100, totalColors + 1))}
                  disabled={totalColors >= 100}
                >
                  +
                </button>
              </div>
            </label>
          </div>
          <div className="settings-row">
            <label>
              Interpolation Method:
              <select value={interpolation} onChange={(e) => setInterpolation(e.target.value)}>
                <option value="RGB">RGB - Standard</option>
                <option value="HSL">HSL - Hue/Saturation/Lightness</option>
                <option value="LAB">LAB - Perceptually Uniform</option>
                <option value="HCL">HCL - Cylindrical LAB</option>
              </select>
            </label>
          </div>
          <div className="settings-row">
            <label>
              Background Color (for accessibility check):
              <div className="background-color-input">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => {
                    setBackgroundColor(e.target.value)
                    setBackgroundColorInput(e.target.value)
                  }}
                />
                <input
                  type="text"
                  value={backgroundColorInput}
                  onChange={(e) => {
                    const value = e.target.value
                    setBackgroundColorInput(value)
                    if (isValidColor(value)) {
                      setBackgroundColor(value)
                    }
                  }}
                  className={`color-text ${!isValidColor(backgroundColorInput) ? 'invalid' : ''}`}
                />
              </div>
            </label>
          </div>
          <div className="settings-row">
            <label>
              Sample Text:
              <input
                type="text"
                value={sampleText}
                onChange={(e) => setSampleText(e.target.value)}
                placeholder="Sample"
                className="sample-text-input"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="results-section">
        <div className="results-header">
          <h3>Generated Colors ({generatedColors.length})</h3>
          <button onClick={copyAllColors} className="copy-all-btn">
            Copy All Colors
          </button>
        </div>

        <div className="gradient-preview">
          {generatedColors.map((item, i) => (
            <div
              key={i}
              className="gradient-segment"
              style={{ backgroundColor: item.color }}
            />
          ))}
        </div>

        {failedCount > 0 && (
          <div className="accessibility-warning">
            {failedCount} color{failedCount > 1 ? 's' : ''} fail WCAG contrast on {backgroundColor} background
          </div>
        )}

        <div className="color-swatches">
          {generatedColors.map((item, index) => {
            const isFailed = item.accessibility.wcagGrade === 'FAIL'
            return (
              <div
                key={index}
                className={`color-swatch ${isFailed ? 'failed' : ''}`}
                onClick={() => copyToClipboard(item.color)}
                title={`Click to copy | Contrast: ${item.accessibility.contrastRatio.toFixed(2)} | ${item.accessibility.wcagGrade}`}
              >
                <div
                  className="swatch-color"
                  style={{ backgroundColor: item.color }}
                />
                <div
                  className="swatch-sample"
                  style={{ backgroundColor: backgroundColor, color: item.color }}
                >
                  {sampleText || 'Sample'}
                </div>
                <span className="swatch-index">{index + 1}</span>
                <span className="swatch-value">{item.color}</span>
                <span className={`swatch-grade ${item.accessibility.wcagGrade.toLowerCase()}`}>
                  {item.accessibility.wcagGrade}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="info-section">
        <h3>About Interpolation Methods</h3>
        <ul>
          <li><strong>RGB</strong> - Linear interpolation in RGB color space. Simple but can produce muddy colors.</li>
          <li><strong>HSL</strong> - Interpolates through hue, saturation, and lightness. Better for rainbow effects.</li>
          <li><strong>LAB</strong> - Perceptually uniform color space. Colors appear evenly spaced to human vision.</li>
          <li><strong>HCL</strong> - Cylindrical version of LAB. Good for maintaining perceived brightness.</li>
        </ul>
      </div>
    </div>
  )
}

export default D3ColorExplorer
