import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import 'ag-grid-enterprise'
import './AgGridExample.css'

const SCROLLBAR_BUTTON_WIDTH = 120

// Custom Group Inner Renderers (used with innerRenderer to preserve expand/collapse)
const DefaultInnerRenderer = (props) => {
  const { node, value } = props
  if (!node.group) return null
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span>{value}</span>
      <span style={{ color: '#666', fontSize: '0.85em' }}>({node.allChildrenCount})</span>
    </span>
  )
}

const BadgeInnerRenderer = (props) => {
  const { node, value } = props
  if (!node.group) return null
  const colors = {
    Engineering: { bg: '#e3f2fd', text: '#1565c0' },
    Marketing: { bg: '#fce4ec', text: '#c2185b' },
    Sales: { bg: '#e8f5e9', text: '#2e7d32' },
    HR: { bg: '#fff3e0', text: '#ef6c00' },
  }
  const color = colors[value] || { bg: '#f5f5f5', text: '#333' }
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{
        background: color.bg,
        color: color.text,
        padding: '2px 10px',
        borderRadius: '12px',
        fontWeight: 500,
      }}>
        {value}
      </span>
      <span style={{
        background: '#333',
        color: '#fff',
        padding: '2px 8px',
        borderRadius: '10px',
        fontSize: '0.75em',
      }}>
        {node.allChildrenCount}
      </span>
    </span>
  )
}

const ProgressInnerRenderer = (props) => {
  const { node, value } = props
  if (!node.group) return null
  // Calculate aggregate for progress visualization
  const allLeafChildren = node.allLeafChildren || []
  const totalProjects = allLeafChildren.reduce((sum, child) => sum + (child.data?.projects || 0), 0)
  const maxProjects = 100
  const progress = Math.min((totalProjects / maxProjects) * 100, 100)
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
      <span style={{ minWidth: '80px' }}>{value}</span>
      <span style={{
        flex: 1,
        maxWidth: '120px',
        height: '8px',
        background: '#e0e0e0',
        borderRadius: '4px',
        overflow: 'hidden',
      }}>
        <span style={{
          display: 'block',
          width: `${progress}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #4caf50, #8bc34a)',
          borderRadius: '4px',
        }} />
      </span>
      <span style={{ fontSize: '0.8em', color: '#666' }}>{totalProjects} projects</span>
    </span>
  )
}

const IconInnerRenderer = (props) => {
  const { node, value } = props
  if (!node.group) return null
  const icons = {
    Engineering: '⚙️',
    Marketing: '📢',
    Sales: '💰',
    HR: '👥',
    Frontend: '🎨',
    Backend: '🔧',
    DevOps: '🚀',
    Digital: '📱',
    Content: '✍️',
    Enterprise: '🏢',
    SMB: '🏪',
    Recruitment: '🔍',
    Operations: '📋',
  }
  const icon = icons[value] || '📁'
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ fontSize: '1.2em' }}>{icon}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
      <span style={{ color: '#888', fontSize: '0.85em' }}>• {node.allChildrenCount} items</span>
    </span>
  )
}

const AgGridExample = () => {
  const gridRef = useRef(null)
  const scrollbarRef = useRef(null)
  const [state, setState] = useState({
    isGrouping: true,
    showCustomScrollbar: true,
    buttonLeft: 0,
    groupRendererStyle: 'default', // 'default' | 'badge' | 'progress' | 'icon'
    groupedColumns: ['department', 'team'], // Pre-group by department and team
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
    { id: 21, department: 'Engineering', team: 'Frontend', name: 'Uma Patel', email: 'uma.patel@company.com', phone: '555-0121', location: 'New York', salary: 99000, bonus: 10500, experience: 5, startDate: '2019-05-22', status: 'Active', rating: 4.6, projects: 14 },
    { id: 22, department: 'Engineering', team: 'Backend', name: 'Victor Santos', email: 'victor.santos@company.com', phone: '555-0122', location: 'New York', salary: 108000, bonus: 13000, experience: 6, startDate: '2018-07-14', status: 'Active', rating: 4.7, projects: 19 },
    { id: 23, department: 'Marketing', team: 'Digital', name: 'Wendy Liu', email: 'wendy.liu@company.com', phone: '555-0123', location: 'New York', salary: 81000, bonus: 6200, experience: 3, startDate: '2021-04-05', status: 'Active', rating: 4.3, projects: 10 },
    { id: 24, department: 'Sales', team: 'Enterprise', name: 'Xavier Hughes', email: 'xavier.hughes@company.com', phone: '555-0124', location: 'New York', salary: 94000, bonus: 29000, experience: 5, startDate: '2019-09-18', status: 'Active', rating: 4.8, projects: 15 },
    { id: 25, department: 'HR', team: 'Operations', name: 'Yuki Tanaka', email: 'yuki.tanaka@company.com', phone: '555-0125', location: 'New York', salary: 76000, bonus: 6500, experience: 4, startDate: '2020-06-12', status: 'Active', rating: 4.4, projects: 12 },
    { id: 26, department: 'Engineering', team: 'DevOps', name: 'Zara Khan', email: 'zara.khan@company.com', phone: '555-0126', location: 'San Francisco', salary: 104000, bonus: 11500, experience: 5, startDate: '2019-02-28', status: 'Active', rating: 4.5, projects: 16 },
    { id: 27, department: 'Engineering', team: 'Frontend', name: 'Aaron Mitchell', email: 'aaron.mitchell@company.com', phone: '555-0127', location: 'San Francisco', salary: 97000, bonus: 10000, experience: 4, startDate: '2020-03-16', status: 'Active', rating: 4.4, projects: 13 },
    { id: 28, department: 'Marketing', team: 'Content', name: 'Bella Romano', email: 'bella.romano@company.com', phone: '555-0128', location: 'San Francisco', salary: 73000, bonus: 4500, experience: 2, startDate: '2022-08-22', status: 'Active', rating: 4.0, projects: 7 },
    { id: 29, department: 'Sales', team: 'SMB', name: 'Carlos Mendez', email: 'carlos.mendez@company.com', phone: '555-0129', location: 'San Francisco', salary: 71000, bonus: 11000, experience: 3, startDate: '2021-11-07', status: 'Active', rating: 4.2, projects: 8 },
    { id: 30, department: 'HR', team: 'Recruitment', name: 'Daisy Park', email: 'daisy.park@company.com', phone: '555-0130', location: 'San Francisco', salary: 74000, bonus: 5800, experience: 3, startDate: '2021-07-25', status: 'Active', rating: 4.3, projects: 11 },
    { id: 31, department: 'Engineering', team: 'Backend', name: 'Ethan Wright', email: 'ethan.wright@company.com', phone: '555-0131', location: 'Chicago', salary: 101000, bonus: 12000, experience: 5, startDate: '2019-06-03', status: 'Active', rating: 4.5, projects: 17 },
    { id: 32, department: 'Engineering', team: 'Frontend', name: 'Fiona O\'Connor', email: 'fiona.oconnor@company.com', phone: '555-0132', location: 'Chicago', salary: 93000, bonus: 9200, experience: 4, startDate: '2020-01-13', status: 'Active', rating: 4.3, projects: 12 },
    { id: 33, department: 'Marketing', team: 'Digital', name: 'George Adams', email: 'george.adams@company.com', phone: '555-0133', location: 'Chicago', salary: 78000, bonus: 5500, experience: 3, startDate: '2021-05-19', status: 'Active', rating: 4.1, projects: 9 },
    { id: 34, department: 'Sales', team: 'Enterprise', name: 'Hannah Brooks', email: 'hannah.brooks@company.com', phone: '555-0134', location: 'Chicago', salary: 91000, bonus: 26000, experience: 4, startDate: '2020-04-27', status: 'Active', rating: 4.6, projects: 13 },
    { id: 35, department: 'HR', team: 'Operations', name: 'Ian Fletcher', email: 'ian.fletcher@company.com', phone: '555-0135', location: 'Chicago', salary: 77000, bonus: 6800, experience: 4, startDate: '2020-08-10', status: 'Active', rating: 4.4, projects: 14 },
    { id: 36, department: 'Engineering', team: 'DevOps', name: 'Julia Hoffman', email: 'julia.hoffman@company.com', phone: '555-0136', location: 'Austin', salary: 96000, bonus: 9800, experience: 4, startDate: '2020-02-17', status: 'Active', rating: 4.4, projects: 14 },
    { id: 37, department: 'Engineering', team: 'Backend', name: 'Kevin Nguyen', email: 'kevin.nguyen@company.com', phone: '555-0137', location: 'Austin', salary: 107000, bonus: 14000, experience: 6, startDate: '2018-10-05', status: 'Active', rating: 4.7, projects: 21 },
    { id: 38, department: 'Marketing', team: 'Content', name: 'Laura Martinez', email: 'laura.martinez@company.com', phone: '555-0138', location: 'Austin', salary: 71000, bonus: 4200, experience: 2, startDate: '2022-06-14', status: 'Active', rating: 3.9, projects: 6 },
    { id: 39, department: 'Sales', team: 'SMB', name: 'Marcus Johnson', email: 'marcus.johnson@company.com', phone: '555-0139', location: 'Austin', salary: 67000, bonus: 9000, experience: 2, startDate: '2022-03-21', status: 'Active', rating: 4.0, projects: 6 },
    { id: 40, department: 'HR', team: 'Recruitment', name: 'Nina Williams', email: 'nina.williams@company.com', phone: '555-0140', location: 'Austin', salary: 73000, bonus: 5600, experience: 3, startDate: '2021-09-08', status: 'Active', rating: 4.2, projects: 10 },
    { id: 41, department: 'Engineering', team: 'Frontend', name: 'Oscar Rivera', email: 'oscar.rivera@company.com', phone: '555-0141', location: 'Seattle', salary: 100000, bonus: 10800, experience: 5, startDate: '2019-04-22', status: 'Active', rating: 4.5, projects: 15 },
    { id: 42, department: 'Engineering', team: 'Backend', name: 'Paula Schmidt', email: 'paula.schmidt@company.com', phone: '555-0142', location: 'Seattle', salary: 109000, bonus: 14500, experience: 7, startDate: '2017-08-30', status: 'Active', rating: 4.8, projects: 22 },
    { id: 43, department: 'Marketing', team: 'Digital', name: 'Quentin Black', email: 'quentin.black@company.com', phone: '555-0143', location: 'Seattle', salary: 80000, bonus: 6000, experience: 3, startDate: '2021-06-28', status: 'Active', rating: 4.2, projects: 10 },
    { id: 44, department: 'Sales', team: 'Enterprise', name: 'Rebecca Stone', email: 'rebecca.stone@company.com', phone: '555-0144', location: 'Seattle', salary: 93000, bonus: 27000, experience: 5, startDate: '2019-11-11', status: 'Active', rating: 4.7, projects: 14 },
    { id: 45, department: 'HR', team: 'Operations', name: 'Steven Clark', email: 'steven.clark@company.com', phone: '555-0145', location: 'Seattle', salary: 79000, bonus: 7200, experience: 5, startDate: '2019-07-15', status: 'Active', rating: 4.5, projects: 15 },
    { id: 46, department: 'Engineering', team: 'DevOps', name: 'Teresa Garcia', email: 'teresa.garcia@company.com', phone: '555-0146', location: 'Denver', salary: 95000, bonus: 9500, experience: 4, startDate: '2020-05-04', status: 'Active', rating: 4.3, projects: 13 },
    { id: 47, department: 'Engineering', team: 'Frontend', name: 'Ulrich Weber', email: 'ulrich.weber@company.com', phone: '555-0147', location: 'Denver', salary: 94000, bonus: 9300, experience: 4, startDate: '2020-04-13', status: 'Active', rating: 4.4, projects: 12 },
    { id: 48, department: 'Marketing', team: 'Content', name: 'Violet Hayes', email: 'violet.hayes@company.com', phone: '555-0148', location: 'Denver', salary: 72000, bonus: 4300, experience: 2, startDate: '2022-07-18', status: 'Active', rating: 4.0, projects: 7 },
    { id: 49, department: 'Sales', team: 'SMB', name: 'William Turner', email: 'william.turner@company.com', phone: '555-0149', location: 'Denver', salary: 69000, bonus: 10000, experience: 3, startDate: '2021-10-25', status: 'Active', rating: 4.1, projects: 8 },
    { id: 50, department: 'HR', team: 'Recruitment', name: 'Xena Morris', email: 'xena.morris@company.com', phone: '555-0150', location: 'Denver', salary: 75000, bonus: 6000, experience: 4, startDate: '2020-09-07', status: 'Active', rating: 4.4, projects: 12 },
    { id: 51, department: 'Engineering', team: 'Backend', name: 'Yosef Cohen', email: 'yosef.cohen@company.com', phone: '555-0151', location: 'Boston', salary: 106000, bonus: 13500, experience: 6, startDate: '2018-06-11', status: 'Active', rating: 4.6, projects: 18 },
    { id: 52, department: 'Engineering', team: 'Frontend', name: 'Zoe Campbell', email: 'zoe.campbell@company.com', phone: '555-0152', location: 'Boston', salary: 96000, bonus: 9800, experience: 4, startDate: '2020-02-24', status: 'Active', rating: 4.4, projects: 13 },
    { id: 53, department: 'Marketing', team: 'Digital', name: 'Adam Foster', email: 'adam.foster@company.com', phone: '555-0153', location: 'Boston', salary: 79000, bonus: 5700, experience: 3, startDate: '2021-03-15', status: 'Active', rating: 4.2, projects: 9 },
    { id: 54, department: 'Sales', team: 'Enterprise', name: 'Beth Cooper', email: 'beth.cooper@company.com', phone: '555-0154', location: 'Boston', salary: 90000, bonus: 25000, experience: 4, startDate: '2020-07-06', status: 'Active', rating: 4.5, projects: 12 },
    { id: 55, department: 'HR', team: 'Operations', name: 'Chris Evans', email: 'chris.evans@company.com', phone: '555-0155', location: 'Boston', salary: 78000, bonus: 7000, experience: 5, startDate: '2019-10-21', status: 'Active', rating: 4.5, projects: 14 },
    { id: 56, department: 'Engineering', team: 'DevOps', name: 'Dana Reed', email: 'dana.reed@company.com', phone: '555-0156', location: 'Los Angeles', salary: 99000, bonus: 10200, experience: 5, startDate: '2019-08-05', status: 'Active', rating: 4.5, projects: 15 },
    { id: 57, department: 'Engineering', team: 'Backend', name: 'Erik Larson', email: 'erik.larson@company.com', phone: '555-0157', location: 'Los Angeles', salary: 104000, bonus: 12500, experience: 5, startDate: '2019-03-18', status: 'Active', rating: 4.6, projects: 17 },
    { id: 58, department: 'Marketing', team: 'Content', name: 'Faith Morgan', email: 'faith.morgan@company.com', phone: '555-0158', location: 'Los Angeles', salary: 74000, bonus: 4800, experience: 2, startDate: '2022-05-09', status: 'Active', rating: 4.1, projects: 8 },
    { id: 59, department: 'Sales', team: 'SMB', name: 'Grant Palmer', email: 'grant.palmer@company.com', phone: '555-0159', location: 'Los Angeles', salary: 70000, bonus: 10500, experience: 3, startDate: '2021-08-16', status: 'Active', rating: 4.2, projects: 9 },
    { id: 60, department: 'HR', team: 'Recruitment', name: 'Holly Bennett', email: 'holly.bennett@company.com', phone: '555-0160', location: 'Los Angeles', salary: 76000, bonus: 6200, experience: 4, startDate: '2020-11-02', status: 'Active', rating: 4.4, projects: 13 },
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

  // Toggle grouping for a column
  const toggleGroupBy = useCallback((column) => {
    const currentGrouped = [...state.groupedColumns]
    const index = currentGrouped.indexOf(column)

    if (index >= 0) {
      // Remove from group
      currentGrouped.splice(index, 1)
    } else {
      // Add to group
      currentGrouped.push(column)
    }

    setState(prev => ({ ...prev, groupedColumns: currentGrouped }))
    gridRef.current?.api.setRowGroupColumns(currentGrouped)
  }, [state.groupedColumns])

  const clearGrouping = useCallback(() => {
    setState(prev => ({ ...prev, groupedColumns: [] }))
    gridRef.current?.api.setRowGroupColumns([])
  }, [])

  const onColumnRowGroupChanged = useCallback((event) => {
    const rowGroupCols = event.api.getRowGroupColumns()
    const groupedColumnIds = rowGroupCols.map(col => col.getColId())
    setState(prev => ({
      ...prev,
      isGrouping: rowGroupCols.length > 0,
      groupedColumns: groupedColumnIds,
    }))
  }, [])

  const onGridReady = useCallback((params) => {
    // Apply initial grouping after grid is ready to ensure footers render correctly
    params.api.setRowGroupColumns(['department', 'team'])
  }, [])

  // External scroll controls
  const scrollLeft = useCallback(() => {
    console.log('[scrollLeft] Button clicked')
    const viewport = document.querySelector('.ag-center-cols-viewport')
    if (!viewport) {
      console.warn('[scrollLeft] Viewport not found')
      return
    }
    console.log('[scrollLeft] Scrolling left by 200px, current scrollLeft:', viewport.scrollLeft)
    viewport.scrollBy({ left: -200, behavior: 'smooth' })
  }, [])

  const scrollRight = useCallback(() => {
    console.log('[scrollRight] Button clicked')
    const viewport = document.querySelector('.ag-center-cols-viewport')
    if (!viewport) {
      console.warn('[scrollRight] Viewport not found')
      return
    }
    console.log('[scrollRight] Scrolling right by 200px, current scrollLeft:', viewport.scrollLeft)
    viewport.scrollBy({ left: 200, behavior: 'smooth' })
  }, [])

  // Scrollbar drag handlers
  const scrollGridTo = useCallback((buttonPosition) => {
    console.log('[scrollGridTo] Called with buttonPosition:', buttonPosition)
    const viewport = document.querySelector('.ag-center-cols-viewport')
    if (!viewport) {
      console.warn('[scrollGridTo] Viewport not found')
      return
    }
    if (!scrollbarRef.current) {
      console.warn('[scrollGridTo] Scrollbar ref not available')
      return
    }

    const trackWidth = scrollbarRef.current.clientWidth - SCROLLBAR_BUTTON_WIDTH
    const scrollRatio = buttonPosition / trackWidth
    const maxScroll = viewport.scrollWidth - viewport.clientWidth
    const newScrollLeft = scrollRatio * maxScroll
    console.log('[scrollGridTo] trackWidth:', trackWidth, 'scrollRatio:', scrollRatio, 'maxScroll:', maxScroll, 'newScrollLeft:', newScrollLeft)
    viewport.scrollLeft = newScrollLeft
  }, [])

  const handleMouseDown = useCallback((e) => {
    console.log('[handleMouseDown] Drag started at clientX:', e.clientX, 'buttonLeft:', state.buttonLeft)
    isDragging.current = true
    dragStartX.current = e.clientX
    dragStartLeft.current = state.buttonLeft
    e.preventDefault()
  }, [state.buttonLeft])

  const handleMouseMove = useCallback((e) => {
    if (!isDragging.current) return
    if (!scrollbarRef.current) {
      console.warn('[handleMouseMove] Scrollbar ref not available')
      return
    }

    const deltaX = e.clientX - dragStartX.current
    const trackWidth = scrollbarRef.current.clientWidth - SCROLLBAR_BUTTON_WIDTH
    const newLeft = Math.max(0, Math.min(trackWidth, dragStartLeft.current + deltaX))

    console.log('[handleMouseMove] deltaX:', deltaX, 'trackWidth:', trackWidth, 'newLeft:', newLeft)
    setState(prev => ({ ...prev, buttonLeft: newLeft }))
    scrollGridTo(newLeft)
  }, [scrollGridTo])

  const handleMouseUp = useCallback(() => {
    if (isDragging.current) {
      console.log('[handleMouseUp] Drag ended')
    }
    isDragging.current = false
  }, [])

  const handleBodyScroll = useCallback((e) => {
    console.log('[handleBodyScroll] ag-grid onBodyScroll fired, direction:', e.direction)
    if (isDragging.current) {
      console.log('[handleBodyScroll] Skipped - currently dragging')
      return
    }
    if (!scrollbarRef.current) {
      console.warn('[handleBodyScroll] Scrollbar ref not available')
      return
    }
    if (e.direction !== 'horizontal') {
      console.log('[handleBodyScroll] Skipped - not horizontal scroll')
      return
    }

    const { left } = e
    const gridBody = document.querySelector('.ag-body-horizontal-scroll-viewport')
    if (!gridBody) {
      console.warn('[handleBodyScroll] Grid body not found')
      return
    }

    const { scrollWidth, clientWidth } = gridBody
    const maxScroll = scrollWidth - clientWidth
    if (maxScroll <= 0) {
      console.log('[handleBodyScroll] Skipped - maxScroll <= 0')
      return
    }

    const scrollRatio = left / maxScroll
    const trackWidth = scrollbarRef.current.clientWidth - SCROLLBAR_BUTTON_WIDTH
    const newButtonLeft = scrollRatio * trackWidth

    console.log('[handleBodyScroll] left:', left, 'maxScroll:', maxScroll, 'scrollRatio:', scrollRatio, 'newButtonLeft:', newButtonLeft)
    setState(prev => ({ ...prev, buttonLeft: newButtonLeft }))
  }, [])

  useEffect(() => {
    console.log('[useEffect:mouse] Setting up mouse event listeners')
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      console.log('[useEffect:mouse] Cleaning up mouse event listeners')
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  // DOM-level scroll listener for touchpad/wheel scrolling
  useEffect(() => {
    console.log('[useEffect:scroll] Setting up DOM scroll listener, showCustomScrollbar:', state.showCustomScrollbar)

    const updateScrollbarFromViewport = () => {
      if (isDragging.current) {
        console.log('[updateScrollbarFromViewport] Skipped - currently dragging')
        return
      }
      if (!scrollbarRef.current) {
        console.warn('[updateScrollbarFromViewport] Scrollbar ref not available')
        return
      }

      const viewport = document.querySelector('.ag-center-cols-viewport')
      if (!viewport) {
        console.warn('[updateScrollbarFromViewport] Viewport not found')
        return
      }

      const { scrollLeft, scrollWidth, clientWidth } = viewport
      const maxScroll = scrollWidth - clientWidth
      if (maxScroll <= 0) {
        console.log('[updateScrollbarFromViewport] Skipped - maxScroll <= 0')
        return
      }

      const scrollRatio = scrollLeft / maxScroll
      const trackWidth = scrollbarRef.current.clientWidth - SCROLLBAR_BUTTON_WIDTH
      const newButtonLeft = scrollRatio * trackWidth

      console.log('[updateScrollbarFromViewport] scrollLeft:', scrollLeft, 'maxScroll:', maxScroll, 'scrollRatio:', scrollRatio, 'newButtonLeft:', newButtonLeft)
      setState(prev => ({ ...prev, buttonLeft: newButtonLeft }))
    }

    const viewport = document.querySelector('.ag-center-cols-viewport')
    if (viewport) {
      console.log('[useEffect:scroll] Viewport found, attaching scroll listener')
      viewport.addEventListener('scroll', updateScrollbarFromViewport)
      return () => {
        console.log('[useEffect:scroll] Cleaning up scroll listener')
        viewport.removeEventListener('scroll', updateScrollbarFromViewport)
      }
    } else {
      console.warn('[useEffect:scroll] Viewport not found, scroll listener not attached')
    }
  }, [state.showCustomScrollbar])

  const defaultColDef = useMemo(() => ({
    resizable: true,
    sortable: true,
  }), [])

  const groupInnerRenderers = useMemo(() => ({
    default: DefaultInnerRenderer,
    badge: BadgeInnerRenderer,
    progress: ProgressInnerRenderer,
    icon: IconInnerRenderer,
  }), [])

  const autoGroupColumnDef = useMemo(() => ({
    headerName: 'Group',
    minWidth: state.groupRendererStyle === 'progress' ? 320 : 220,
    cellRendererParams: {
      suppressCount: true, // We handle count display in custom renderers
      innerRenderer: groupInnerRenderers[state.groupRendererStyle],
    },
  }), [state.groupRendererStyle, groupInnerRenderers])

  return (
    <div className="ag-grid-example">
      <div className="ag-grid-header">
        <h2>AG Grid Grouping Example</h2>
        <p>Drag column headers to the row groups panel to group, or use the external controls below. Scroll horizontally to see all columns.</p>
      </div>

      <div className="external-controls">
        <span>Group Cell Style:</span>
        <select
          className="style-select"
          value={state.groupRendererStyle}
          onChange={(e) => setState(prev => ({ ...prev, groupRendererStyle: e.target.value }))}
        >
          <option value="default">Default</option>
          <option value="badge">Colored Badges</option>
          <option value="progress">Progress Bar</option>
          <option value="icon">Icons</option>
        </select>
        <span className="style-hint">
          {state.groupRendererStyle === 'default' && '- Simple text with count'}
          {state.groupRendererStyle === 'badge' && '- Color-coded badges per department'}
          {state.groupRendererStyle === 'progress' && '- Shows aggregate projects as progress'}
          {state.groupRendererStyle === 'icon' && '- Department/team icons'}
        </span>
      </div>

      <div className="external-controls">
        <span>Group by:</span>
        <button
          className={state.groupedColumns.includes('department') ? 'group-btn active' : 'group-btn'}
          onClick={() => toggleGroupBy('department')}
        >
          Department
        </button>
        <button
          className={state.groupedColumns.includes('team') ? 'group-btn active' : 'group-btn'}
          onClick={() => toggleGroupBy('team')}
        >
          Team
        </button>
        <button
          className={state.groupedColumns.includes('location') ? 'group-btn active' : 'group-btn'}
          onClick={() => toggleGroupBy('location')}
        >
          Location
        </button>
        <button onClick={clearGrouping} disabled={state.groupedColumns.length === 0}>
          Clear All
        </button>
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
          key={state.groupRendererStyle}
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          autoGroupColumnDef={autoGroupColumnDef}
          rowGroupPanelShow="always"
          groupDefaultExpanded={-1}
          groupIncludeFooter={true}
          groupIncludeTotalFooter={true}
          suppressDragLeaveHidesColumns={true}
          suppressHorizontalScroll={state.showCustomScrollbar}
          animateRows={true}
          onGridReady={onGridReady}
          onColumnRowGroupChanged={onColumnRowGroupChanged}
          onBodyScroll={handleBodyScroll}
        />
      </div>

      {state.showCustomScrollbar && (
        <div className="simple-scrollbar" ref={scrollbarRef}>
          <div
            className="simple-scrollbar-button"
            style={{ left: state.buttonLeft, width: SCROLLBAR_BUTTON_WIDTH }}
            onMouseDown={handleMouseDown}
          />
        </div>
      )}
    </div>
  )
}

export default AgGridExample
