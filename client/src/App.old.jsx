import React, { useEffect, useMemo, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import Navbar from './components/Navbar';
import SpreadsheetTable from './components/SpreadsheetTable';
import SummaryCard from './components/SummaryCard';
import api from './services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const createRow = () => ({
  id: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
  date: '',
  income: '',
  expenses: '',
  otherExpenses: '',
});

const parseNumber = (value) => Number(value || 0);

const App = () => {
  const [entries, setEntries] = useState([]);
  const [draftRows, setDraftRows] = useState([createRow()]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchEntries = async (monthFilter = '') => {
    setLoading(true);
    try {
      const response = await api.get('/entries', {
        params: monthFilter ? { month: monthFilter } : undefined,
      });
      setEntries(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Unable to fetch entries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries(selectedMonth);
  }, [selectedMonth]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const totals = useMemo(() => {
    const totalIncome = entries.reduce((sum, item) => sum + (item.income || 0), 0);
    const totalExpenses = entries.reduce((sum, item) => sum + (item.expenses || 0), 0);
    const totalOtherExpenses = entries.reduce((sum, item) => sum + (item.otherExpenses || 0), 0);
    return {
      totalIncome,
      totalExpenses,
      totalOtherExpenses,
      finalBalance: totalIncome - totalExpenses - totalOtherExpenses,
    };
  }, [entries]);

  const chartData = useMemo(() => {
    const labels = [...entries].reverse().map((entry) => new Date(entry.date).toLocaleDateString());
    return {
      labels,
      datasets: [
        {
          label: 'Income',
          backgroundColor: 'rgba(34,197,94,0.7)',
          borderRadius: 4,
          data: [...entries].reverse().map((entry) => entry.income || 0),
        },
        {
          label: 'Expenses',
          backgroundColor: 'rgba(249,115,22,0.7)',
          borderRadius: 4,
          data: [...entries].reverse().map((entry) => entry.expenses || 0),
        },
        {
          label: 'Other Expenses',
          backgroundColor: 'rgba(59,130,246,0.7)',
          borderRadius: 4,
          data: [...entries].reverse().map((entry) => entry.otherExpenses || 0),
        },
      ],
    };
  }, [entries]);

  const updateRow = (id, field, value) => {
    setDraftRows((current) =>
      current.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const addRow = () => setDraftRows((current) => [...current, createRow()]);

  const removeRow = (id) => setDraftRows((current) => (current.length > 1 ? current.filter((row) => row.id !== id) : current));

  const validateRows = () => {
    for (const row of draftRows) {
      if (!row.date || row.income === '' || row.expenses === '' || row.otherExpenses === '') {
        toast.error('Complete all row fields before saving');
        return false;
      }
      if (parseNumber(row.income) < 0 || parseNumber(row.expenses) < 0 || parseNumber(row.otherExpenses) < 0) {
        toast.error('Values cannot be negative');
        return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateRows()) return;

    setSaving(true);
    try {
      await Promise.all(
        draftRows.map((row) =>
          api.post('/entries/add-entry', {
            date: row.date,
            income: parseNumber(row.income),
            expenses: parseNumber(row.expenses),
            otherExpenses: parseNumber(row.otherExpenses),
          })
        )
      );
      toast.success('Entries added');
      setDraftRows([createRow()]);
      fetchEntries(selectedMonth);
    } catch (error) {
      console.error(error);
      toast.error('Unable to save entries');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/entries/entry/${id}`);
      toast.success('Entry deleted');
      fetchEntries(selectedMonth);
    } catch (error) {
      console.error(error);
      toast.error('Unable to delete entry');
    }
  };

  const downloadCSV = () => {
    const rows = entries.map((entry) => ({
      date: new Date(entry.date).toLocaleDateString(),
      income: entry.income || 0,
      expenses: entry.expenses || 0,
      otherExpenses: entry.otherExpenses || 0,
    }));
    const header = 'Date,Income,Expenses,Other Expenses\n';
    const csvRows = rows.map((row) => `${row.date},${row.income},${row.expenses},${row.otherExpenses}`).join('\n');
    const blob = new Blob([header + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'finance-entries.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <Navbar isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode((value) => !value)} />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="mb-6 rounded-3xl bg-white/90 p-6 shadow-card ring-1 ring-slate-200/80 backdrop-blur dark:bg-slate-900/90 dark:ring-slate-700/80">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold">Finance Tracker</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
                Track income, expenses, and savings in one responsive dashboard.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={downloadCSV}
                className="rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-950 dark:hover:bg-slate-100"
              >
                Export CSV
              </button>
              <input
                type="month"
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6">
            <SpreadsheetTable
              rows={draftRows}
              onRowChange={updateRow}
              onAddRow={addRow}
              onRemoveRow={removeRow}
              onSave={handleSave}
              saving={saving}
              loading={loading}
            />
            <div className="rounded-3xl bg-white/90 p-6 shadow-card ring-1 ring-slate-200/80 backdrop-blur dark:bg-slate-900/90 dark:ring-slate-700/80">
              <h2 className="text-xl font-semibold">Monthly Overview</h2>
              <div className="mt-6">
                <Bar data={chartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <SummaryCard title="Total Income" value={totals.totalIncome} accent="green" />
            <SummaryCard title="Total Expenses" value={totals.totalExpenses} accent="orange" />
            <SummaryCard title="Other Expenses" value={totals.totalOtherExpenses} accent="blue" />
            <SummaryCard title="Final Balance" value={totals.finalBalance} accent={totals.finalBalance >= 0 ? 'green' : 'red'} />
          </aside>
        </section>

        <section className="mt-6 rounded-3xl bg-white/90 p-6 shadow-card ring-1 ring-slate-200/80 backdrop-blur dark:bg-slate-900/90 dark:ring-slate-700/80">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Saved entries</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                View your saved data and delete old entries.
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              {selectedMonth || 'All months'}
            </span>
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700">
            <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_0.8fr] gap-0 bg-slate-100 px-4 py-3 text-xs uppercase tracking-[0.2em] text-slate-500 dark:bg-slate-900 dark:text-slate-400">
              <span>Date</span>
              <span>Income</span>
              <span>Expenses</span>
              <span>Other</span>
              <span className="text-right">Action</span>
            </div>
            {loading ? (
              <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">Loading entries...</div>
            ) : entries.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">No saved entries found.</div>
            ) : (
              entries.map((entry) => (
                <div
                  key={entry._id}
                  className="grid grid-cols-[1.5fr_1fr_1fr_1fr_0.8fr] gap-0 border-t border-slate-200 px-4 py-4 text-sm dark:border-slate-700"
                >
                  <span>{new Date(entry.date).toLocaleDateString()}</span>
                  <span>${entry.income.toFixed(2)}</span>
                  <span>${entry.expenses.toFixed(2)}</span>
                  <span>${entry.otherExpenses.toFixed(2)}</span>
                  <button
                    type="button"
                    onClick={() => handleDelete(entry._id)}
                    className="ml-auto rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
      <Toaster position="top-right" />
    </div>
  );
};

export default App;
