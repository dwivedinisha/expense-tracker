import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000/api';
const CATEGORIES = ['All', 'Food', 'Travel', 'Bills', 'Shopping', 'Health', 'Other'];

export default function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [filter, setFilter] = useState('All');
  const [form, setForm] = useState({ title: '', amount: '', category: 'Food', date: '' });
  const [msg, setMsg] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    const u = JSON.parse(localStorage.getItem('user'));
    setUser(u);
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const { data } = await axios.get(`${API}/expenses`, { headers });
      setExpenses(data);
    } catch {
      localStorage.clear();
      navigate('/login');
    }
  };

  const addExpense = async () => {
    try {
      await axios.post(`${API}/expense`, form, { headers });
      setMsg('Expense added!');
      setForm({ title: '', amount: '', category: 'Food', date: '' });
      fetchExpenses();
      setTimeout(() => setMsg(''), 2000);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error adding expense');
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const filtered = filter === 'All' ? expenses : expenses.filter(e => e.category === filter);
  const total = filtered.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>

        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>💰 Expense Tracker</h2>
          <div>
            <span style={styles.welcome}>👋 {user?.name}</span>
            <button style={styles.logoutBtn} onClick={logout}>Logout</button>
          </div>
        </div>

        {/* Add Expense Form */}
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>➕ Add New Expense</h3>
          <div style={styles.formRow}>
            <input placeholder="Title" style={styles.input}
              value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <input placeholder="Amount (₹)" type="number" style={styles.input}
              value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
            <select style={styles.input} value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.filter(c => c !== 'All').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input type="date" style={styles.input}
              value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            <button style={styles.btn} onClick={addExpense}>Add</button>
          </div>
          {msg && <p style={styles.success}>{msg}</p>}
        </div>

        {/* Filter */}
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>📊 My Expenses</h3>
          <div style={styles.filterRow}>
            {CATEGORIES.map(c => (
              <button key={c}
                style={filter === c ? styles.filterBtnActive : styles.filterBtn}
                onClick={() => setFilter(c)}>
                {c}
              </button>
            ))}
          </div>

          {/* Total */}
          <div style={styles.totalBox}>
            <span>Total: </span>
            <span style={styles.totalAmount}>₹{total.toFixed(2)}</span>
          </div>

          {/* Expense List */}
          {filtered.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#9ca3af', marginTop: '1rem' }}>
              No expenses found
            </p>
          ) : (
            filtered.map(e => (
              <div key={e._id} style={styles.expenseItem}>
                <div>
                  <p style={styles.expenseTitle}>{e.title}</p>
                  <p style={styles.expenseMeta}>
                    {e.category} • {new Date(e.date).toLocaleDateString()}
                  </p>
                </div>
                <span style={styles.expenseAmount}>₹{e.amount}</span>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#f0f4f8', padding: '1rem' },
  wrapper: { maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '1rem 1.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
  title: { color: '#10b981' },
  welcome: { marginRight: '1rem', color: '#374151' },
  logoutBtn: { padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  card: { background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
  sectionTitle: { color: '#374151', marginBottom: '1rem' },
  formRow: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  input: { padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px', flex: 1, minWidth: '120px' },
  btn: { padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  filterRow: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1rem' },
  filterBtn: { padding: '6px 14px', background: '#f3f4f6', border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '13px' },
  filterBtnActive: { padding: '6px 14px', background: '#10b981', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '13px' },
  totalBox: { background: '#f0fdf4', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '16px' },
  totalAmount: { fontWeight: 'bold', color: '#10b981', fontSize: '20px' },
  expenseItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderBottom: '1px solid #f3f4f6' },
  expenseTitle: { fontWeight: '600', color: '#111827' },
  expenseMeta: { fontSize: '13px', color: '#9ca3af', marginTop: '2px' },
  expenseAmount: { fontWeight: 'bold', color: '#10b981', fontSize: '16px' },
  success: { color: 'green', textAlign: 'center', marginTop: '8px' }
};