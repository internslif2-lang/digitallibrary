import { useState, useEffect } from 'react'
import { collection, onSnapshot, doc, updateDoc, query, orderBy } from 'firebase/firestore'
import { db } from '../firebase.js'
import { Link } from 'react-router-dom'

export default function AdminPage() {
  document.title = 'Admin — EDGE Library'  
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('all')
  const [search, setSearch]   = useState('')

  // Live listener — updates instantly when new data comes in
  useEffect(() => {
    const q = query(collection(db, 'bookings'), orderBy('timestamp', 'desc'))
    const unsub = onSnapshot(q, snap => {
      setRecords(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }, err => {
      console.error(err)
      setLoading(false)
    })
    return unsub
  }, [])

  const markReturned = async (id) => {
    try {
      await updateDoc(doc(db, 'bookings', id), { returned: true })
    } catch (e) {
      alert('Error updating. Try again.')
    }
  }

  const fmt = (ts) => {
    if (!ts) return '...'
    const d = ts.toDate()
    return d.toLocaleString('en-AE', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  // Only show take records
  // Auto-mark returned if a matching return submission exists by same employeeId
  const takeRecords = records
    .filter(r => r.action === 'take')
    .map(r => {
      const hasReturn = records.some(
        x => x.action === 'return' && x.employeeId === r.employeeId
      )
      return { ...r, returned: r.returned || hasReturn }
    })

  const filtered = takeRecords.filter(r => {
    const matchFilter =
      filter === 'all'      ? true :
      filter === 'stillout' ? !r.returned :
      filter === 'returned' ? r.returned  : true

    const q = search.toLowerCase()
    const matchSearch = !q ||
      r.employeeName?.toLowerCase().includes(q) ||
      r.employeeId?.toLowerCase().includes(q)   ||
      r.entity?.toLowerCase().includes(q)

    return matchFilter && matchSearch
  })

  const total    = takeRecords.length
  const returned = takeRecords.filter(r => r.returned).length
  const stillOut = takeRecords.filter(r => !r.returned).length

  return (
    <div style={S.page}>

      {/* Top Bar */}
      <div style={S.topbar}>
        <div style={S.topbarLeft}>
          <span style={S.logo}>📚 LibraFlow</span>
          <span style={S.badge}>Admin</span>
        </div>
        <Link to="/form" style={S.navLink}>→ Employee Form</Link>
      </div>

      <div style={S.content}>

        {/* Stats */}
        <div style={S.stats}>
          {[
            { label: 'Total Books Out', value: total,    color: 'var(--text)'    },
            { label: 'Still Out',       value: stillOut, color: 'var(--danger)'  },
            { label: 'Returned',        value: returned, color: 'var(--success)' },
          ].map(s => (
            <div key={s.label} style={S.statCard}>
              <div style={S.statLabel}>{s.label}</div>
              <div style={{ ...S.statValue, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filter + Search */}
        <div style={S.filterRow}>
          {[
            { key: 'all',      label: 'All'       },
            { key: 'stillout', label: 'Still Out' },
            { key: 'returned', label: 'Returned'  },
          ].map(f => (
            <button
              key={f.key}
              style={{ ...S.filterBtn, ...(filter === f.key ? S.filterBtnActive : {}) }}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
          <input
            style={S.searchInput}
            placeholder="Search name, ID, department..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        <div style={S.tableWrap}>
          <table style={S.table}>
            <thead>
              <tr>
                {['Employee Name', 'Employee ID', 'Entity', 'Taken At', 'Status'].map(h => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} style={S.empty}>Loading records...</td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} style={S.empty}>No records found.</td>
                </tr>
              )}
              {filtered.map((r, i) => (
                <tr key={r.id} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,.02)' }}>
                  <td style={S.td}>{r.employeeName}</td>
                  <td style={S.tdMono}>{r.employeeId}</td>
                  <td style={S.tdMono}>{r.entity}</td>
                  <td style={S.tdMono}>{fmt(r.timestamp)}</td>
                  <td style={S.td}>
                    {r.returned ? (
                      <span style={S.statusReturned}>✓ Returned</span>
                    ) : (
                      <button
                        style={S.markBtn}
                        onClick={() => markReturned(r.id)}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--success)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                      >
                        Mark Returned
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}

const S = {
  page: { minHeight: '100vh', background: 'var(--bg)' },
  topbar: {
    background: 'var(--surface)',
    borderBottom: '1px solid var(--border)',
    padding: '1rem 2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  topbarLeft: { display: 'flex', alignItems: 'center', gap: '1rem' },
  logo: { fontWeight: 800, fontSize: '1.1rem', color: 'var(--text)' },
  badge: {
    fontSize: '.65rem',
    letterSpacing: '.12em',
    textTransform: 'uppercase',
    color: 'var(--accent)',
    background: 'rgba(200,169,110,.1)',
    border: '1px solid rgba(200,169,110,.2)',
    borderRadius: '999px',
    padding: '.2rem .7rem',
  },
  navLink: {
    fontSize: '.78rem',
    color: 'var(--muted)',
    textDecoration: 'none',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '.4rem .9rem',
  },
  content: { maxWidth: '1100px', margin: '0 auto', padding: '2rem' },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    marginBottom: '2rem',
  },
  statCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    padding: '1.2rem 1.4rem',
  },
  statLabel: {
    fontSize: '.72rem',
    letterSpacing: '.1em',
    textTransform: 'uppercase',
    color: 'var(--muted)',
    marginBottom: '.5rem',
  },
  statValue: { fontWeight: 800, fontSize: '2rem', lineHeight: 1 },
  filterRow: {
    display: 'flex',
    gap: '.6rem',
    marginBottom: '1.2rem',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  filterBtn: {
    fontSize: '.75rem',
    letterSpacing: '.08em',
    textTransform: 'uppercase',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '.4rem .9rem',
    cursor: 'pointer',
    background: 'transparent',
    color: 'var(--muted)',
  },
  filterBtnActive: {
    background: 'var(--accent)',
    color: '#0a0a0f',
    borderColor: 'var(--accent)',
    fontWeight: 700,
  },
  searchInput: {
    marginLeft: 'auto',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '.4rem .9rem',
    color: 'var(--text)',
    fontSize: '.82rem',
    outline: 'none',
    minWidth: '220px',
  },
  tableWrap: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    overflow: 'hidden',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    fontSize: '.65rem',
    letterSpacing: '.1em',
    textTransform: 'uppercase',
    color: 'var(--muted)',
    padding: '.9rem 1.2rem',
    textAlign: 'left',
    background: 'var(--surface2)',
    borderBottom: '1px solid var(--border)',
    fontWeight: 500,
  },
  td: {
    padding: '.9rem 1.2rem',
    borderBottom: '1px solid var(--border)',
    fontSize: '.9rem',
    color: 'var(--text)',
    verticalAlign: 'middle',
  },
  tdMono: {
    padding: '.9rem 1.2rem',
    borderBottom: '1px solid var(--border)',
    fontSize: '.78rem',
    color: 'var(--muted)',
    fontFamily: 'monospace',
    verticalAlign: 'middle',
  },
  statusReturned: {
    background: 'rgba(74,222,128,.08)',
    border: '1px solid rgba(74,222,128,.2)',
    color: 'var(--success)',
    borderRadius: '999px',
    padding: '.3rem .9rem',
    fontSize: '.78rem',
  },
  markBtn: {
    background: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '.3rem .9rem',
    color: 'var(--muted)',
    fontSize: '.78rem',
    cursor: 'pointer',
    transition: 'border-color .2s',
  },
  empty: {
    textAlign: 'center',
    padding: '3rem',
    color: 'var(--muted)',
    fontSize: '.85rem',
  },
}