import { useState } from 'react'
import { 
  SketchPicker, 
  ChromePicker, 
  BlockPicker, 
  CirclePicker, 
  CompactPicker, 
  PhotoshopPicker, 
  SwatchesPicker, 
  TwitterPicker 
} from 'react-color'
import { getColorAccessibility } from '../utils/colorContrast'
import './ColorContrastUtility.css'

const PICKER_TYPES = {
  sketch: { name: 'Sketch', component: SketchPicker },
  chrome: { name: 'Chrome', component: ChromePicker },
  block: { name: 'Block', component: BlockPicker },
  circle: { name: 'Circle', component: CirclePicker },
  compact: { name: 'Compact', component: CompactPicker },
  photoshop: { name: 'Photoshop', component: PhotoshopPicker },
  swatches: { name: 'Swatches', component: SwatchesPicker },
  twitter: { name: 'Twitter', component: TwitterPicker },
}

function ColorContrastUtility() {
  const [state, setState] = useState({
    pickerType: 'sketch',
    foreground: '#000000',
    background: '#ffffff',
    fontSize: 16,
    bold: false,
    showForegroundPicker: false,
    showBackgroundPicker: false,
  })

  const result = getColorAccessibility(state.foreground, state.background, state.fontSize, state.bold)

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'AAA':
        return '#22c55e'
      case 'AA':
        return '#3b82f6'
      case 'FAIL':
        return '#ef4444'
      default:
        return '#6b7280'
    }
  }

  const handleForegroundChange = (color) => {
    setState(prev => ({ ...prev, foreground: color.hex }))
  }

  const handleBackgroundChange = (color) => {
    setState(prev => ({ ...prev, background: color.hex }))
  }

  const PickerComponent = PICKER_TYPES[state.pickerType].component

  return (
    <div className="color-contrast-utility">
      <h1>Color Selection & Contrast Utility</h1>
      <p className="subtitle">Calculate WCAG contrast ratios and accessibility grades</p>

      <div className="picker-type-selector">
        <label htmlFor="pickerType">Color Picker Type:</label>
        <select
          id="pickerType"
          value={state.pickerType}
          onChange={(e) => setState(prev => ({ ...prev, pickerType: e.target.value }))}
        >
          {Object.entries(PICKER_TYPES).map(([key, { name }]) => (
            <option key={key} value={key}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div className="controls">
        <div className="control-group">
          <label htmlFor="foreground">Foreground Color</label>
          <div className="color-picker-wrapper">
            <div className="color-display-group">
              <div
                className="color-display"
                style={{ backgroundColor: state.foreground }}
                onClick={() => setState(prev => ({ ...prev, showForegroundPicker: !prev.showForegroundPicker }))}
              />
              <input
                type="text"
                id="foreground"
                value={state.foreground}
                onChange={(e) => setState(prev => ({ ...prev, foreground: e.target.value }))}
                placeholder="#000000"
              />
            </div>
            {state.showForegroundPicker && (
              <div className="color-picker-popup">
                <div
                  className="color-picker-overlay"
                  onClick={() => setState(prev => ({ ...prev, showForegroundPicker: false }))}
                />
                <div className="color-picker-container">
                  <PickerComponent
                    color={state.foreground}
                    onChange={handleForegroundChange}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="control-group">
          <label htmlFor="background">Background Color</label>
          <div className="color-picker-wrapper">
            <div className="color-display-group">
              <div
                className="color-display"
                style={{ backgroundColor: state.background }}
                onClick={() => setState(prev => ({ ...prev, showBackgroundPicker: !prev.showBackgroundPicker }))}
              />
              <input
                type="text"
                id="background"
                value={state.background}
                onChange={(e) => setState(prev => ({ ...prev, background: e.target.value }))}
                placeholder="#ffffff"
              />
            </div>
            {state.showBackgroundPicker && (
              <div className="color-picker-popup">
                <div
                  className="color-picker-overlay"
                  onClick={() => setState(prev => ({ ...prev, showBackgroundPicker: false }))}
                />
                <div className="color-picker-container">
                  <PickerComponent
                    color={state.background}
                    onChange={handleBackgroundChange}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="control-group">
          <label htmlFor="fontSize">Font Size (px)</label>
          <input
            type="number"
            id="fontSize"
            value={state.fontSize}
            onChange={(e) => setState(prev => ({ ...prev, fontSize: Number(e.target.value) }))}
            min="1"
            max="100"
          />
        </div>

        <div className="control-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={state.bold}
              onChange={(e) => setState(prev => ({ ...prev, bold: e.target.checked }))}
            />
            Bold text
          </label>
        </div>
      </div>

      <div className="preview" style={{ backgroundColor: state.background }}>
        <p
          style={{
            color: state.foreground,
            fontSize: `${state.fontSize}px`,
            fontWeight: state.bold ? 'bold' : 'normal',
          }}
        >
          Sample text preview
        </p>
      </div>

      <div className="results">
        <div className="result-card">
          <div className="result-label">Contrast Ratio</div>
          <div className="result-value">{result.contrastRatio.toFixed(2)}:1</div>
        </div>
        <div className="result-card">
          <div className="result-label">WCAG Grade</div>
          <div
            className="result-value grade"
            style={{ color: getGradeColor(result.wcagGrade) }}
          >
            {result.wcagGrade}
          </div>
        </div>
      </div>

      <div className="info">
        <h3>WCAG Guidelines</h3>
        <ul>
          <li>
            <strong>AAA:</strong> Normal text requires 7:1, Large text (24px+ or 18.66px+ bold) requires 4.5:1
          </li>
          <li>
            <strong>AA:</strong> Normal text requires 4.5:1, Large text requires 3:1
          </li>
          <li>
            <strong>FAIL:</strong> Does not meet minimum contrast requirements
          </li>
        </ul>
      </div>
    </div>
  )
}

export default ColorContrastUtility

