import React, { useEffect, useState } from "react";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({ user_id: 1, type: 'Income', amount: '', category: '', description: '' });
  const [summary, setSummary] = useState({});
  const [editId, setEditId] = useState(null);

  const API = "http://localhost:8081";

  const getTransactions = async () => {
    const res = await axios.get(`${API}/transactions/1`);
    setTransactions(res.data);
  };

  const getSummary = async () => {
    const res = await axios.get(`${API}/transactions/summary/1`);
    setSummary(res.data);
  };

  useEffect(() => {
    getTransactions();
    getSummary();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await axios.put(`${API}/transactions/${editId}`, form);
      setEditId(null);
    } else {
      await axios.post(`${API}/transactions`, form);
    }
    setForm({ ...form, amount: '', category: '', description: '' });
    getTransactions();
    getSummary();
  };

  const handleDelete = async (id) => {
    await axios.delete(`${API}/transactions/${id}`);
    getTransactions();
    getSummary();
  };

  const handleEdit = (txn) => {
    setForm(txn);
    setEditId(txn.id);
  };

  return (
    <div className="container my-4">
      <h2 className="text-center mb-4">💰 Personal Budget Tracker</h2>

      {/* Summary */}
      <div className="row mb-4">
        <div className="col-md-4"><div className="alert alert-success">Income: ₹{summary.total_income || 0}</div></div>
        <div className="col-md-4"><div className="alert alert-danger">Expense: ₹{summary.total_expense || 0}</div></div>
        <div className="col-md-4"><div className="alert alert-primary">Balance: ₹{summary.balance || 0}</div></div>
      </div>

      {/* Form */}
      <form className="row g-3 mb-4" onSubmit={handleSubmit}>
        <div className="col-md-2">
          <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            <option>Income</option>
            <option>Expense</option>
          </select>
        </div>
        <div className="col-md-2">
          <input type="number" className="form-control" placeholder="Amount" value={form.amount}
            onChange={e => setForm({ ...form, amount: e.target.value })} required />
        </div>
        <div className="col-md-2">
          <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
            <option value="">Category</option>
            <option>Food</option>
            <option>Rent</option>
            <option>Salary</option>
            <option>Entertainment</option>
          </select>
        </div>
        <div className="col-md-4">
          <input type="text" className="form-control" placeholder="Description" value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="col-md-2">
          <button className="btn btn-primary w-100">{editId ? "Update" : "Add"}</button>
        </div>
      </form>

      {/* Transactions Table */}
      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            <th>Type</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Description</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(txn => (
            <tr key={txn.id}>
              <td>{txn.type}</td>
              <td>₹{txn.amount}</td>
              <td>{txn.category}</td>
              <td>{txn.description}</td>
              <td>{new Date(txn.created_at).toLocaleString()}</td>
              <td>
                <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(txn)}>Edit</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(txn.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
