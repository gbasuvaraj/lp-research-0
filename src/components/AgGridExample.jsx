import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import 'ag-grid-enterprise'
import './AgGridExample.css'

const AgGridExample = () => {
  const gridRef = useRef(null)
  const scrollbarRef = useRef(null)
  const [state, setState] = useState({
    isGrouping: false,
    showCustomScrollbar: true,
    buttonLeft: 0,
  })
  const isDragging = useRef(false)
  const dragStartX = useRef(0)
  const dragStartLeft = useRef(0)

  // Sample data with multiple columns for horizontal scrolling
  const [rowData] = useState([
    { id: 1, department: 'Engineering', team: 'Frontend', name: 'Alice Johnson', email: 'alice.johnson@company.com', phone: '555-0101', location: 'New York', salary: 95000, bonus: 9500, experience: 5, startDate: '2019-03-15', status: 'Active', rating: 4.5, projects: 12 },
    { id: 2, department: 'Engineering', team: 'Frontend', name: 'Bob Smith', email: 'bob.smith@company.com', phone: '555-0102', location: 'San Francisco', salary: 87000, bonus: 8700, experience: 3, startDate: '2021-06-01', status: 'Active', rating: 4.2, projects: 8 },
    { id: 3, department: 'Engineering', team: 'Backend', name: 'Charlie Brown', email: 'charlie.brown@company.com', phone: '555-0103', location: 'Austin', salary: 110000, bonus: 15000, experience: 7, startDate: '2017-01-10', status: 'Active', rating: 4.8, projects: 24 },
    { id: 4, department: 'Engineering', team: 'Backend', name: 'Diana Prince', email: 'diana.prince@company.com', phone: '555-0104', location: 'Seattle', salary: 105000, bonus: 12000, experience: 6, startDate: '2018-09-20', status: 'Active', rating: 4.6, projects: 18 },
    { id: 5, department: 'Engineering', team: 'DevOps', name: 'Eve Wilson', email: 'eve.wilson@company.com', phone: '555-0105', location: 'Denver', salary: 98000, bonus: 10000, experience: 4, startDate: '2020-02-28', status: 'Active', rating: 4.3, projects: 15 },
    { id: 6, department: 'Marketing', team: 'Digital', name: 'Frank Miller', email: 'frank.miller@company.com', phone: '555-0106', location: 'Chicago', salary: 75000, bonus: 5000, experience: 2, startDate: '2022-04-11', status: 'Active', rating: 3.9, projects: 6 },
    { id: 7, department: 'Marketing', team: 'Digital', name: 'Grace Lee', email: 'grace.lee@company.com', phone: '555-0107', location: 'Boston', salary: 82000, bonus: 6500, experience: 4, startDate: '2020-07-19', status: 'Active', rating: 4.4, projects: 11 },
    { id: 8, department: 'Marketing', team: 'Content', name: 'Henry Davis', email: 'henry.davis@company.com', phone: '555-0108', location: 'Portland', salary: 70000, bonus: 4000, experience: 1, startDate: '2023-01-05', status: 'Probation', rating: 3.5, projects: 3 },
    { id: 9, department: 'Sales', team: 'Enterprise', name: 'Ivy Chen', email: 'ivy.chen@company.com', phone: '555-0109', location: 'Los Angeles', salary: 88000, bonus: 22000, experience: 3, startDate: '2021-03-22', status: 'Active', rating: 4.7, projects: 9 },
    { id: 10, department: 'Sales', team: 'Enterprise', name: 'Jack Taylor', email: 'jack.taylor@company.com', phone: '555-0110', location: 'Miami', salary: 92000, bonus: 28000, experience: 5, startDate: '2019-08-14', status: 'Active', rating: 4.9, projects: 14 },
    { id: 11, department: 'Sales', team: 'SMB', name: 'Kate Anderson', email: 'kate.anderson@company.com', phone: '555-0111', location: 'Phoenix', salary: 65000, bonus: 8000, experience: 2, startDate: '2022-11-30', status: 'Active', rating: 4.0, projects: 5 },
    { id: 12, department: 'Sales', team: 'SMB', name: 'Liam O\'Brien', email: 'liam.obrien@company.com', phone: '555-0112', location: 'Dallas', salary: 68000, bonus: 9500, experience: 2, startDate: '2022-09-08', status: 'Active', rating: 4.1, projects: 7 },
    { id: 13, department: 'HR', team: 'Recruitment', name: 'Mia Rodriguez', email: 'mia.rodriguez@company.com', phone: '555-0113', location: 'Atlanta', salary: 72000, bonus: 5500, experience: 3, startDate: '2021-05-17', status: 'Active', rating: 4.3, projects: 10 },
    { id: 14, department: 'HR', team: 'Recruitment', name: 'Noah Kim', email: 'noah.kim@company.com', phone: '555-0114', location: 'Minneapolis', salary: 75000, bonus: 6000, experience: 4, startDate: '2020-10-25', status: 'Active', rating: 4.5, projects: 13 },
    { id: 15, department: 'HR', team: 'Operations', name: 'Olivia White', email: 'olivia.white@company.com', phone: '555-0115', location: 'Detroit', salary: 78000, bonus: 7000, experience: 5, startDate: '2019-12-03', status: 'Active', rating: 4.6, projects: 16 },
    { id: 16, department: 'Engineering', team: 'Frontend', name: 'Peter Zhang', email: 'peter.zhang@company.com', phone: '555-0116', location: 'San Jose', salary: 102000, bonus: 11000, experience: 6, startDate: '2018-04-12', status: 'Active', rating: 4.7, projects: 20 },
    { id: 17, department: 'Engineering', team: 'Backend', name: 'Quinn Murphy', email: 'quinn.murphy@company.com', phone: '555-0117', location: 'Raleigh', salary: 95000, bonus: 9000, experience: 4, startDate: '2020-01-20', status: 'Active', rating: 4.4, projects: 14 },
    { id: 18, department: 'Engineering', team: 'DevOps', name: 'Rachel Green', email: 'rachel.green@company.com', phone: '555-0118', location: 'Nashville', salary: 91000, bonus: 8500, experience: 3, startDate: '2021-07-07', status: 'Active', rating: 4.2, projects: 11 },
    { id: 19, department: 'Marketing', team: 'Digital', name: 'Sam Wilson', email: 'sam.wilson@company.com', phone: '555-0119', location: 'San Diego', salary: 79000, bonus: 5800, experience: 3, startDate: '2021-02-14', status: 'Active', rating: 4.1, projects: 9 },
    { id: 20, department: 'Sales', team: 'Enterprise', name: 'Tina Foster', email: 'tina.foster@company.com', phone: '555-0120', location: 'Houston', salary: 96000, bonus: 32000, experience: 6, startDate: '2018-11-28', status: 'Active', rating: 4.8, projects: 17 },
  ])

  const columnDefs = useMemo(() => [
    { field: 'id', headerName: 'ID', width: 80, pinned: 'left' },
    {
      field: 'department',
      enableRowGroup: true,
      sortable: true,
      filter: true,
    },
    {
      field: 'team',
      enableRowGroup: true,
      sortable: true,
      filter: true,
    },
    { field: 'name', sortable: true, filter: true, width: 180 },
    { field: 'email', sortable: true, filter: true, width: 250 },
    { field: 'phone', sortable: true, filter: true, width: 120 },
    {
      field: 'location',
      enableRowGroup: true,
      sortable: true,
      filter: true,
      width: 140,
    },
    {
      field: 'salary',
      headerName: state.isGrouping ? 'Salary (avg)' : 'Salary',
      sortable: true,
      filter: 'agNumberColumnFilter',
      valueFormatter: (params) => params.value ? `$${Math.round(params.value).toLocaleString()}` : '',
      aggFunc: 'avg',
      width: 130,
    },
    {
      field: 'bonus',
      headerName: state.isGrouping ? 'Bonus (sum)' : 'Bonus',
      sortable: true,
      filter: 'agNumberColumnFilter',
      valueFormatter: (params) => params.value ? `$${Math.round(params.value).toLocaleString()}` : '',
      aggFunc: 'sum',
      width: 130,
    },
    {
      field: 'experience',
      headerName: state.isGrouping ? 'Exp yrs (avg)' : 'Exp (yrs)',
      sortable: true,
      filter: 'agNumberColumnFilter',
      valueFormatter: (params) => {
        if (params.value == null) return ''
        const num = Number(params.value)
        return Number.isInteger(num) ? num : num.toFixed(1)
      },
      aggFunc: 'avg',
      width: 120,
    },
    {
      field: 'startDate',
      headerName: 'Start Date',
      sortable: true,
      filter: 'agDateColumnFilter',
      width: 130,
    },
    {
      field: 'status',
      enableRowGroup: true,
      sortable: true,
      filter: true,
      width: 110,
    },
    {
      field: 'rating',
      headerName: state.isGrouping ? 'Rating (avg)' : 'Rating',
      sortable: true,
      filter: 'agNumberColumnFilter',
      valueFormatter: (params) => {
        if (params.value == null) return ''
        const num = Number(params.value)
        return Number.isInteger(num) ? num : num.toFixed(1)
      },
      aggFunc: 'avg',
      width: 115,
    },
    {
      field: 'projects',
      headerName: state.isGrouping ? 'Projects (sum)' : 'Projects',
      sortable: true,
      filter: 'agNumberColumnFilter',
      aggFunc: 'sum',
      width: 130,
    },
  ], [state.isGrouping])

  // External grouping controls
  const groupByDepartment = useCallback(() => {
    gridRef.current?.api.setRowGroupColumns(['department'])
  }, [])

  const groupByTeam = useCallback(() => {
    gridRef.current?.api.setRowGroupColumns(['team'])
  }, [])

  const groupByLocation = useCallback(() => {
    gridRef.current?.api.setRowGroupColumns(['location'])
  }, [])

  const clearGrouping = useCallback(() => {
    gridRef.current?.api.setRowGroupColumns([])
  }, [])

  const onColumnRowGroupChanged = useCallback((event) => {
    const rowGroupCols = event.api.getRowGroupColumns()
    setState(prev => ({ ...prev, isGrouping: rowGroupCols.length > 0 }))
  }, [])

  // External scroll controls
  const scrollLeft = useCallback(() => {
    const gridBody = document.querySelector('.ag-body-horizontal-scroll-viewport')
    if (gridBody) {
      gridBody.scrollBy({ left: -200, behavior: 'smooth' })
    }
  }, [])

  const scrollRight = useCallback(() => {
    const gridBody = document.querySelector('.ag-body-horizontal-scroll-viewport')
    if (gridBody) {
      gridBody.scrollBy({ left: 200, behavior: 'smooth' })
    }
  }, [])

  // Scrollbar drag handlers
  const scrollGridTo = useCallback((buttonPosition) => {
    const gridBody = document.querySelector('.ag-body-horizontal-scroll-viewport')
    if (!gridBody || !scrollbarRef.current) return

    const trackWidth = scrollbarRef.current.clientWidth - 60 // 60 = button width
    const scrollRatio = buttonPosition / trackWidth
    const maxScroll = gridBody.scrollWidth - gridBody.clientWidth
    gridBody.scrollLeft = scrollRatio * maxScroll
  }, [])

  const handleMouseDown = useCallback((e) => {
    isDragging.current = true
    dragStartX.current = e.clientX
    dragStartLeft.current = state.buttonLeft
    e.preventDefault()
  }, [state.buttonLeft])

  const handleMouseMove = useCallback((e) => {
    if (!isDragging.current || !scrollbarRef.current) return

    const deltaX = e.clientX - dragStartX.current
    const trackWidth = scrollbarRef.current.clientWidth - 60
    const newLeft = Math.max(0, Math.min(trackWidth, dragStartLeft.current + deltaX))

    setState(prev => ({ ...prev, buttonLeft: newLeft }))
    scrollGridTo(newLeft)
  }, [scrollGridTo])

  const handleMouseUp = useCallback(() => {
    isDragging.current = false
  }, [])

  const handleBodyScroll = useCallback((e) => {
    if (isDragging.current || !scrollbarRef.current) return
    if (e.direction !== 'horizontal') return

    const { left } = e
    const gridBody = document.querySelector('.ag-body-horizontal-scroll-viewport')
    if (!gridBody) return

    const { scrollWidth, clientWidth } = gridBody
    const maxScroll = scrollWidth - clientWidth
    if (maxScroll <= 0) return

    const scrollRatio = left / maxScroll
    const trackWidth = scrollbarRef.current.clientWidth - 60
    const newButtonLeft = scrollRatio * trackWidth

    setState(prev => ({ ...prev, buttonLeft: newButtonLeft }))
  }, [])

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  const defaultColDef = useMemo(() => ({
    resizable: true,
    sortable: true,
  }), [])

  const autoGroupColumnDef = useMemo(() => ({
    headerName: 'Group',
    minWidth: 200,
    cellRendererParams: {
      suppressCount: false,
    },
  }), [])

  return (
    <div className="ag-grid-example">
      <div className="ag-grid-header">
        <h2>AG Grid Grouping Example</h2>
        <p>Drag column headers to the row groups panel to group, or use the external controls below. Scroll horizontally to see all columns.</p>
      </div>

      <div className="external-controls">
        <span>Grouping:</span>
        <button onClick={groupByDepartment}>Group by Department</button>
        <button onClick={groupByTeam}>Group by Team</button>
        <button onClick={groupByLocation}>Group by Location</button>
        <button onClick={clearGrouping}>Clear Grouping</button>
      </div>

      {state.isGrouping && (
        <div className="aggregation-info">
          <strong>Aggregation active:</strong> Columns marked with <span className="agg-tag avg">(avg)</span> show the <em>average</em> value.
          Columns marked with <span className="agg-tag sum">(sum)</span> show the <em>total</em> value.
        </div>
      )}

      <div className="external-controls">
        <span>Scroll:</span>
        <button onClick={scrollLeft}>&larr; Scroll Left</button>
        <button onClick={scrollRight}>Scroll Right &rarr;</button>
        <label style={{ marginLeft: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={state.showCustomScrollbar}
            onChange={(e) => setState(prev => ({ ...prev, showCustomScrollbar: e.target.checked }))}
          />
          Custom Scrollbar
        </label>
      </div>

      <div className="ag-theme-alpine" style={{ height: 600, width: '100%' }}>
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          autoGroupColumnDef={autoGroupColumnDef}
          rowGroupPanelShow="always"
          groupDefaultExpanded={1}
          suppressDragLeaveHidesColumns={true}
          animateRows={true}
          onColumnRowGroupChanged={onColumnRowGroupChanged}
          onBodyScroll={handleBodyScroll}
        />
      </div>

      {state.showCustomScrollbar && (
        <div className="simple-scrollbar" ref={scrollbarRef}>
          <div
            className="simple-scrollbar-button"
            style={{ left: state.buttonLeft }}
            onMouseDown={handleMouseDown}
          />
        </div>
      )}
    </div>
  )
}

export default AgGridExample
