import { useState, useMemo, useEffect, useCallback } from 'react'
import { generateColorScale, isValidColor } from '../utils/generateColorScale'
import './D3ColorExplorer.css'

const STORAGE_KEY = 'colorExplorer_editedPalette'
const CUSTOM_PALETTES_KEY = 'colorExplorer_customPalettes'

function loadSavedState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

function loadCustomPalettes() {
  try {
    const saved = localStorage.getItem(CUSTOM_PALETTES_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

function arraysEqual(a, b) {
  if (a.length !== b.length) return false
  return a.every((v, i) => v.toLowerCase() === b[i].toLowerCase())
}

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
  const saved = useMemo(() => loadSavedState(), [])
  const loadedCustomPalettes = useMemo(() => loadCustomPalettes(), [])
  const [inputColors, setInputColors] = useState(saved?.inputColors || presetPalettes['Sunset'][6])
  const [inputColorTexts, setInputColorTexts] = useState(saved?.inputColors || presetPalettes['Sunset'][6])
  const [totalColors, setTotalColors] = useState(saved?.totalColors || 10)
  const [interpolation, setInterpolation] = useState(saved?.interpolation || 'RGB')
  const [backgroundColor, setBackgroundColor] = useState(saved?.backgroundColor || '#ffffff')
  const [backgroundColorInput, setBackgroundColorInput] = useState(saved?.backgroundColor || '#ffffff')
  const [sampleText, setSampleText] = useState(saved?.sampleText || 'Sample')
  const [activePalette, setActivePalette] = useState(saved?.activePalette || { name: 'Sunset', count: 6 })
  const [customPalettes, setCustomPalettes] = useState(loadedCustomPalettes)
  const [showSavePaletteForm, setShowSavePaletteForm] = useState(false)
  const [savePaletteName, setSavePaletteName] = useState('')
  const [savePaletteError, setSavePaletteError] = useState('')
  const [confirmingDelete, setConfirmingDelete] = useState(null)

  useEffect(() => {
    try {
      localStorage.setItem(CUSTOM_PALETTES_KEY, JSON.stringify(customPalettes))
    } catch { /* storage full or unavailable */ }
  }, [customPalettes])

  const isEdited = useMemo(() => {
    const { name, count, custom } = activePalette
    if (custom) {
      const cp = customPalettes.find(p => p.name === name)
      if (!cp) return true
      return !arraysEqual(inputColors, cp.colors)
    }
    const original = presetPalettes[name]?.[count]
    if (!original) return true
    return !arraysEqual(inputColors, original)
  }, [inputColors, activePalette, customPalettes])

  const saveState = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        inputColors,
        totalColors,
        interpolation,
        backgroundColor,
        sampleText,
        activePalette,
      }))
    } catch { /* storage full or unavailable */ }
  }, [inputColors, totalColors, interpolation, backgroundColor, sampleText, activePalette])

  useEffect(() => {
    saveState()
  }, [saveState])

  const applyPreset = (paletteName, colorCount) => {
    const colors = presetPalettes[paletteName][colorCount]
    setInputColors([...colors])
    setInputColorTexts([...colors])
    setActivePalette({ name: paletteName, count: colorCount })
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

  const saveAsCustomPalette = () => {
    const name = savePaletteName.trim()
    if (!name) {
      setSavePaletteError('Name is required')
      return
    }
    if (customPalettes.some(p => p.name === name)) {
      setSavePaletteError('A custom palette with this name already exists')
      return
    }
    const newPalette = { name, colors: [...inputColors] }
    setCustomPalettes([...customPalettes, newPalette])
    setActivePalette({ name, count: inputColors.length, custom: true })
    setShowSavePaletteForm(false)
    setSavePaletteName('')
    setSavePaletteError('')
  }

  const updateCustomPalette = () => {
    const name = activePalette.name
    setCustomPalettes(customPalettes.map(p =>
      p.name === name ? { ...p, colors: [...inputColors] } : p
    ))
    setActivePalette({ name, count: inputColors.length, custom: true })
  }

  const deleteCustomPalette = (name) => {
    setCustomPalettes(customPalettes.filter(p => p.name !== name))
    if (activePalette.custom && activePalette.name === name) {
      setActivePalette({ name: 'Sunset', count: 6 })
    }
  }

  const applyCustomPalette = (palette) => {
    const colors = [...palette.colors]
    setInputColors(colors)
    setInputColorTexts(colors)
    setActivePalette({ name: palette.name, count: colors.length, custom: true })
    if (totalColors < colors.length) {
      setTotalColors(colors.length)
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
        <h3>Palettes</h3>
        <div className="storage-notice">
          <span className="storage-notice-icon">i</span>
          Custom palettes and edits are saved in this browser only.
        </div>
        <div className="palette-grid">
          {Object.entries(presetPalettes).map(([name, variants]) => (
            <div key={name} className={`palette-card ${activePalette.name === name && !activePalette.custom ? 'active' : ''}`}>
              <div className="palette-name">
                {name}
                {activePalette.name === name && !activePalette.custom && isEdited && (
                  <span className="edited-badge">Edited</span>
                )}
              </div>
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
          {customPalettes.map((palette) => (
            <div key={`custom-${palette.name}`} className={`palette-card custom ${activePalette.custom && activePalette.name === palette.name ? 'active' : ''}`}>
              <div className="palette-name">
                {palette.name}
                <span className="custom-badge">Custom</span>
                {activePalette.custom && activePalette.name === palette.name && isEdited && (
                  <span className="edited-badge">Edited</span>
                )}
              </div>
              <div className="palette-preview">
                {palette.colors.map((color, i) => (
                  <div key={i} className="preview-color" style={{ backgroundColor: color }} />
                ))}
              </div>
              <div className="palette-actions">
                <button onClick={() => applyCustomPalette(palette)}>Apply</button>
                {confirmingDelete === palette.name ? (
                  <>
                    <button className="delete-confirm-btn" onClick={() => { deleteCustomPalette(palette.name); setConfirmingDelete(null) }}>Confirm</button>
                    <button className="delete-cancel-btn" onClick={() => setConfirmingDelete(null)}>Cancel</button>
                  </>
                ) : (
                  <button className="delete-palette-btn" onClick={() => setConfirmingDelete(palette.name)}>Delete</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="explorer-controls">
        <div className="control-section">
          <div className="section-header">
            <h3>Input Colors</h3>
            {isEdited && (
              <div className="section-header-actions">
                <button
                  className="reset-btn"
                  onClick={() => {
                    if (activePalette.custom) {
                      applyCustomPalette(customPalettes.find(p => p.name === activePalette.name))
                    } else {
                      applyPreset(activePalette.name, activePalette.count)
                    }
                  }}
                  title="Reset to original palette"
                >
                  Reset
                </button>
                {activePalette.custom ? (
                  <button
                    className="update-palette-btn"
                    onClick={updateCustomPalette}
                    title="Save changes to this custom palette"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    className="save-palette-btn"
                    onClick={() => { setShowSavePaletteForm(true); setSavePaletteError('') }}
                    title="Save as a new custom palette"
                  >
                    Save as New Palette
                  </button>
                )}
              </div>
            )}
          </div>
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
          {showSavePaletteForm && (
            <div className="save-palette-form">
              <input
                type="text"
                value={savePaletteName}
                onChange={(e) => { setSavePaletteName(e.target.value); setSavePaletteError('') }}
                placeholder="Palette name"
                autoFocus
                onKeyDown={(e) => { if (e.key === 'Enter') saveAsCustomPalette(); if (e.key === 'Escape') { setShowSavePaletteForm(false); setSavePaletteName(''); setSavePaletteError('') } }}
              />
              <button onClick={saveAsCustomPalette} className="save-palette-confirm">Save</button>
              <button onClick={() => { setShowSavePaletteForm(false); setSavePaletteName(''); setSavePaletteError('') }} className="save-palette-cancel">Cancel</button>
              {savePaletteError && <span className="save-palette-error">{savePaletteError}</span>}
            </div>
          )}
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
