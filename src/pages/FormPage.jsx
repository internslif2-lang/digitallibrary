import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase.js'

const ENTITIES = [
  'IT Department', 'HR Department', 'Finance',
  'Operations', 'Marketing', 'Legal', 'Executive', 'Other'
]

export default function FormPage() {
  const [form, setForm]       = useState({ employeeName: '', employeeId: '', entity: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError]     = useState('')

  const update = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const validate = () => {
    if (!form.employeeName.trim()) return 'Employee name is required.'
    if (!form.employeeId.trim())   return 'Employee ID is required.'
    if (!form.entity)              return 'Please select your entity.'
    return ''
  }

  const submit = async (action) => {
    const err = validate()
    if (err) { setError(err); return }
    setError('')
    setLoading(true)
    try {
      await addDoc(collection(db, 'bookings'), {
        employeeName: form.employeeName,
        employeeId:   form.employeeId,
        entity:       form.entity,
        action,
        returned:     action === 'return',
        timestamp:    serverTimestamp(),
      })
      setSuccess(action)
    } catch (e) {
      console.error(e)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.successIcon}>{success === 'take' ? '📚' : '✅'}</div>
          <h2 style={{ ...styles.successTitle, color: success === 'take' ? 'var(--accent)' : 'var(--success)' }}>
            {success === 'take' ? 'Book Checked Out!' : 'Book Returned!'}
          </h2>
          <p style={styles.successSub}>
            {success === 'take'
              ? 'Your request has been logged. Enjoy your reading!'
              : 'Return recorded. Thank you!'}
          </p>
          <button style={styles.resetBtn} onClick={() => { setSuccess(null); setForm({ employeeName: '', employeeId: '', entity: '' }) }}>
            Submit another
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <div style={styles.card} className="fade-in">

        <div style={styles.header}>
          <p style={styles.eyebrow}>📚 LibraFlow</p>
          <h1 style={styles.title}>Library Check-In / Out</h1>
          <p style={styles.sub}>Fill in your details and choose an action</p>
        </div>

        <div style={styles.group}>
          <label style={styles.label}>Employee Name</label>
          <input
            style={styles.input}
            value={form.employeeName}
            onChange={update('employeeName')}
            placeholder="e.g. Sarah Al Mansouri"
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e  => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        <div style={styles.group}>
          <label style={styles.label}>Employee ID</label>
          <input
            style={styles.input}
            value={form.employeeId}
            onChange={update('employeeId')}
            placeholder="e.g. EMP-0042"
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e  => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        <div style={styles.group}>
          <label style={styles.label}>Entity / Department</label>
          <select
            style={styles.select}
            value={form.entity}
            onChange={update('entity')}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e  => e.target.style.borderColor = 'var(--border)'}
          >
            <option value="">Select your department</option>
            {ENTITIES.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>

        {error && <div style={styles.errorBox}>⚠ {error}</div>}

        <div style={styles.btnRow}>
          <button
            style={{ ...styles.btnTake, opacity: loading ? .6 : 1 }}
            onClick={() => submit('take')}
            disabled={loading}
          >
            {loading ? 'Saving...' : '📖 Take a Book'}
          </button>
          <button
            style={{ ...styles.btnReturn, opacity: loading ? .6 : 1 }}
            onClick={() => submit('return')}
            disabled={loading}
          >
            {loading ? 'Saving...' : '↩ Return Book'}
          </button>
        </div>

      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    background: 'var(--bg)',
  },
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '20px',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '440px',
  },
  header: { marginBottom: '2rem' },
  eyebrow: {
    fontSize: '.75rem',
    letterSpacing: '.15em',
    color: 'var(--accent)',
    textTransform: 'uppercase',
    marginBottom: '.6rem',
  },
  title: {
    fontWeight: 800,
    fontSize: '1.8rem',
    color: 'var(--text)',
    marginBottom: '.4rem',
  },
  sub: { fontSize: '.82rem', color: 'var(--muted)' },
  group: { marginBottom: '1.2rem' },
  label: {
    display: 'block',
    fontSize: '.72rem',
    letterSpacing: '.1em',
    textTransform: 'uppercase',
    color: 'var(--muted)',
    marginBottom: '.4rem',
  },
  input: {
    width: '100%',
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '.8rem 1rem',
    color: 'var(--text)',
    fontSize: '.95rem',
    outline: 'none',
    transition: 'border-color .2s',
  },
  select: {
    width: '100%',
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '.8rem 1rem',
    color: 'var(--text)',
    fontSize: '.95rem',
    outline: 'none',
    cursor: 'pointer',
  },
  btnRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '.8rem',
    marginTop: '1.8rem',
  },
  btnTake: {
    padding: '1rem',
    borderRadius: '10px',
    border: 'none',
    background: 'var(--accent)',
    color: '#0a0a0f',
    fontWeight: 800,
    fontSize: '.95rem',
    cursor: 'pointer',
  },
  btnReturn: {
    padding: '1rem',
    borderRadius: '10px',
    border: '1px solid var(--border)',
    background: 'transparent',
    color: 'var(--text)',
    fontWeight: 700,
    fontSize: '.95rem',
    cursor: 'pointer',
  },
  errorBox: {
    background: 'rgba(248,113,113,.08)',
    border: '1px solid rgba(248,113,113,.3)',
    borderRadius: '8px',
    padding: '.7rem 1rem',
    fontSize: '.78rem',
    color: 'var(--danger)',
    marginTop: '.5rem',
  },
  successIcon: { fontSize: '3rem', marginBottom: '1rem', textAlign: 'center' },
  successTitle: {
    fontWeight: 800,
    fontSize: '1.5rem',
    marginBottom: '.5rem',
    textAlign: 'center',
  },
  successSub: {
    fontSize: '.82rem',
    color: 'var(--muted)',
    marginBottom: '2rem',
    textAlign: 'center',
  },
  resetBtn: {
    display: 'block',
    margin: '0 auto',
    background: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '.6rem 1.5rem',
    color: 'var(--muted)',
    fontSize: '.82rem',
    cursor: 'pointer',
  },
}