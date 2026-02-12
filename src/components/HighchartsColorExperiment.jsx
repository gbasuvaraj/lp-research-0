import { useState, useCallback, useMemo } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import './HighchartsColorExperiment.css'

const DEFAULT_COLORS = ['#7cb5ec', '#434348', '#90ed7d', '#f7a35c']

const PRESETS = {
  '4 Colors (Default)': ['#7cb5ec', '#434348', '#90ed7d', '#f7a35c'],
  '3 Colors': ['#e74c3c', '#2ecc71', '#3498db'],
  '2 Colors': ['#ff6384', '#36a2eb'],
  '5 Colors': ['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51'],
}

function generateSeriesData(count) {
  const names = [
    'Revenue', 'Expenses', 'Profit', 'Users', 'Sessions',
    'Conversions', 'Bounce Rate', 'Retention', 'Growth', 'Churn',
  ]
  const series = []
  for (let i = 0; i < count; i++) {
    const base = 20 + Math.random() * 60
    series.push({
      name: names[i] || `Metric ${i + 1}`,
      data: Array.from({ length: 6 }, (_, j) =>
        Math.round(base + Math.sin(j + i) * 15 + Math.random() * 10)
      ),
    })
  }
  return series
}

const CHART_TYPES = ['line', 'column', 'bar', 'area', 'spline']

function HighchartsColorExperiment() {
  const [colors, setColors] = useState(DEFAULT_COLORS)
  const [seriesCount, setSeriesCount] = useState(7)
  const [chartType, setChartType] = useState('line')
  const [colorInput, setColorInput] = useState('')

  const seriesData = useMemo(() => generateSeriesData(seriesCount), [seriesCount])

  const chartOptions = useMemo(() => ({
    colors: colors,
    chart: { type: chartType, height: 450 },
    title: { text: `${colors.length} Colors vs ${seriesCount} Series` },
    subtitle: {
      text: `Highcharts will cycle through the ${colors.length} provided colors`,
    },
    xAxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    },
    yAxis: { title: { text: 'Value' } },
    series: seriesData,
    legend: { enabled: true },
    credits: { enabled: false },
    plotOptions: {
      series: {
        lineWidth: 2,
        marker: { radius: 4 },
      },
    },
  }), [colors, seriesCount, chartType, seriesData])

  // Build a map showing which series got which color
  const colorAssignments = useMemo(() => {
    return seriesData.map((s, i) => ({
      name: s.name,
      color: colors[i % colors.length],
      colorIndex: i % colors.length,
      isDuplicate: i >= colors.length,
    }))
  }, [seriesData, colors])

  const handleAddColor = useCallback(() => {
    const val = colorInput.trim()
    if (/^#[0-9a-fA-F]{3,6}$/.test(val)) {
      setColors(prev => [...prev, val])
      setColorInput('')
    }
  }, [colorInput])

  const handleRemoveColor = useCallback((index) => {
    setColors(prev => prev.length > 1 ? prev.filter((_, i) => i !== index) : prev)
  }, [])

  const handleColorChange = useCallback((index, value) => {
    setColors(prev => prev.map((c, i) => i === index ? value : c))
  }, [])

  const handlePreset = useCallback((key) => {
    setColors([...PRESETS[key]])
  }, [])

  const regenerate = useCallback(() => {
    // force new data by bumping count and resetting
    setSeriesCount(prev => {
      const next = prev
      return 0
    })
    setTimeout(() => setSeriesCount(seriesCount), 0)
  }, [seriesCount])

  return (
    <div className="hc-experiment">
      <h2>Highcharts Color Cycling Experiment</h2>
      <p className="hc-description">
        When you provide fewer colors than series, Highcharts <strong>cycles</strong> through
        the color array. Series 5 gets the same color as Series 1, Series 6 matches Series 2, etc.
        Experiment below to see this in action.
      </p>

      <div className="hc-controls">
        <div className="hc-control-group">
          <label>Color Palette ({colors.length} colors)</label>
          <div className="hc-color-list">
            {colors.map((c, i) => (
              <div key={i} className="hc-color-item">
                <input
                  type="color"
                  value={c}
                  onChange={(e) => handleColorChange(i, e.target.value)}
                />
                <span className="hc-color-hex">{c}</span>
                <button
                  className="hc-remove-btn"
                  onClick={() => handleRemoveColor(i)}
                  title="Remove color"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
          <div className="hc-add-color">
            <input
              type="text"
              value={colorInput}
              onChange={(e) => setColorInput(e.target.value)}
              placeholder="#hex"
              maxLength={7}
            />
            <button onClick={handleAddColor}>Add</button>
          </div>
        </div>

        <div className="hc-control-group">
          <label>Presets</label>
          <div className="hc-presets">
            {Object.keys(PRESETS).map(key => (
              <button
                key={key}
                className="hc-preset-btn"
                onClick={() => handlePreset(key)}
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        <div className="hc-control-group">
          <label>Number of Series: {seriesCount}</label>
          <input
            type="range"
            min={1}
            max={10}
            value={seriesCount}
            onChange={(e) => setSeriesCount(Number(e.target.value))}
          />
        </div>

        <div className="hc-control-group">
          <label>Chart Type</label>
          <div className="hc-chart-types">
            {CHART_TYPES.map(type => (
              <button
                key={type}
                className={`hc-type-btn ${chartType === type ? 'active' : ''}`}
                onClick={() => setChartType(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="hc-chart-container">
        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
      </div>

      <div className="hc-assignments">
        <h3>Color Assignments</h3>
        <div className="hc-assignment-grid">
          {colorAssignments.map((a, i) => (
            <div
              key={i}
              className={`hc-assignment-card ${a.isDuplicate ? 'duplicate' : ''}`}
            >
              <div
                className="hc-assignment-swatch"
                style={{ backgroundColor: a.color }}
              />
              <div className="hc-assignment-info">
                <span className="hc-assignment-name">{a.name}</span>
                <span className="hc-assignment-detail">
                  {a.color} (index {a.colorIndex})
                </span>
                {a.isDuplicate && (
                  <span className="hc-assignment-warn">Reused color</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="hc-info">
        <h3>How Highcharts Handles Color Overflow</h3>
        <ul>
          <li>
            Highcharts uses a <code>colors</code> array (default has 10 colors).
          </li>
          <li>
            Each series is assigned <code>colors[seriesIndex % colors.length]</code>.
          </li>
          <li>
            If you provide 4 colors and plot 7 series, series 5-7 will reuse colors 1-3.
          </li>
          <li>
            This can cause visual confusion when two series share the same color. The legend
            still shows distinct entries, but the chart lines/bars become indistinguishable.
          </li>
          <li>
            To avoid this, either provide enough colors for all series, or use
            <code>series[n].color</code> to assign colors individually.
          </li>
        </ul>
      </div>
    </div>
  )
}

export default HighchartsColorExperiment
