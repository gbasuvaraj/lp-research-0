import { Routes, Route, NavLink, Navigate } from 'react-router-dom'
import AgGridExample from './components/AgGridExample'
import ColorContrastUtility from './components/ColorContrastUtility'
import D3ColorExplorer from './components/D3ColorExplorer'
import HighchartsColorExperiment from './components/HighchartsColorExperiment'
import './App.css'

function App() {
  return (
    <div className="app">
      <div className="container">
        <nav className="tabs">
          <NavLink
            to="/contrast"
            className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}
          >
            Color Contrast
          </NavLink>
          <NavLink
            to="/grid"
            className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}
          >
            AG Grid (Grouping)
          </NavLink>
          <NavLink
            to="/d3-colors"
            className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}
          >
            Color Scale
          </NavLink>
          <NavLink
            to="/highcharts"
            className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}
          >
            Highcharts Colors
          </NavLink>
        </nav>

        <div className="tab-content">
          <Routes>
            <Route path="/" element={<Navigate to="/contrast" replace />} />
            <Route path="/contrast" element={<ColorContrastUtility />} />
            <Route path="/grid" element={<AgGridExample />} />
            <Route path="/d3-colors" element={<D3ColorExplorer />} />
            <Route path="/highcharts" element={<HighchartsColorExperiment />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default App
