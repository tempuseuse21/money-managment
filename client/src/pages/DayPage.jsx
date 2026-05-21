import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import api from '../services/api';
import Spinner from '../components/Spinner';

const formatRupee = (value) => {
  return `₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
const DayPage = ({ fetchDays }) => {
  const { date } = useParams();
  const navigate = useNavigate();
  const [day, setDay] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newEntry, setNewEntry] = useState({ description: '', amount: '', type: 'income' });
  const [saving, setSaving] = useState(false);

  const loadDay = async () => {
    if (!date) return;
    setLoading(true);
    try {
      const response = await api.get(`/day/${encodeURIComponent(date)}`);
      setDay(response.data);
    } catch (error) {
      console.error(error);
      toast.error('દિવસની વિગતો લોડ કરવામાં અસમર્થ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDay();
  }, [date]);

  const summary = useMemo(() => {
    if (!day?.entries) return { income: 0, expenses: 0, extraExpenses: 0, balance: 0 };
    return day.entries.reduce(
      (acc, entry) => {
        const amount = Number(entry.amount) || 0;
        const type = String(entry.type || '').toLowerCase();

        if (type === 'income' || type === 'credit') {
          acc.income += amount;
        } else if (type === 'expenses' || type === 'debit') {
          acc.expenses += amount;
        } else if (type === 'extra expenses') {
          acc.extraExpenses += amount;
        } else {
          acc.expenses += amount;
        }

        acc.balance = acc.income - acc.expenses - acc.extraExpenses;
        return acc;
      },
      { income: 0, expenses: 0, extraExpenses: 0, balance: 0 }
    );
  }, [day]);

  const createEntry = async (e) => {
    e.preventDefault();
    if (!newEntry.description || !newEntry.amount) {
      toast.error('કૃપા કરીને નોંધ અને રકમ ઉમેરો');
      return;
    }

    setSaving(true);
    try {
      await api.post(`/day/${encodeURIComponent(date)}`, newEntry);
      toast.success('એન્ટ્રી ઉમેરવામાં આવી');
      setNewEntry({ description: '', amount: '', type: 'income' });
      loadDay();
      fetchDays();
    } catch (error) {
      console.error(error);
      toast.error('એન્ટ્રી સાચવવામાં અસમર્થ');
    } finally {
      setSaving(false);
    }
  };

  const normalizeType = (type) => {
    if (!type) return 'expenses';
    const lower = type.toString().toLowerCase();
    if (lower === 'credit') return 'income';
    if (lower === 'debit') return 'expenses';
    return lower;
  };

  const getDisplayType = (type) => {
    const norm = normalizeType(type);
    if (norm === 'income') return 'આવક';
    if (norm === 'expenses') return 'ખર્ચ';
    if (norm === 'extra expenses') return 'વધારાનો ખર્ચ';
    return norm;
  };

  const downloadPdf = () => {
    if (!day) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`દૈનિક અહેવાલ - ${day.date}`, 14, 20);

    const rows = (day.entries || []).map((entry) => [
      entry.description,
      getDisplayType(entry.type),
      Number(entry.amount).toFixed(2),
      new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    ]);

    doc.autoTable({
      head: [['નોંધ', 'પ્રકાર', 'રકમ', 'સમય']],
      body: rows,
      startY: 30,
      styles: { fontSize: 10 },
      theme: 'grid',
    });

    doc.save(`દિવસ-${day.date}.pdf`);
  };

  const downloadExcel = () => {
    if (!day) return;
    const rows = (day.entries || []).map((entry) => ({
      'નોંધ': entry.description,
      'પ્રકાર': getDisplayType(entry.type),
      'રકમ': Number(entry.amount),
      'સમય': new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, day.date);
    const excelData = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    const blob = new Blob([excelData], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `દિવસ-${day.date}.xlsx`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const removeEntry = async (entryId) => {
    try {
      await api.delete(`/entry/${entryId}`);
      toast.success('એન્ટ્રી કાઢી નાખવામાં આવી');
      loadDay();
      fetchDays();
    } catch (error) {
      console.error(error);
      toast.error('એન્ટ્રી કાઢી નાખવામાં અસમર્થ');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900/95 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 sm:text-sm sm:tracking-[0.3em]">દૈનિક વિગત</p>
            <h2 className="text-2xl font-semibold text-slate-950 dark:text-slate-100 sm:text-3xl">{date}</h2>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 sm:text-sm">આ તારીખ માટે એન્ટ્રીઝ ઉમેરો અને ₹ માં કુલ રકમની સમીક્ષા કરો.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 rounded-full border border-slate-300 bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-900 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 sm:flex-none sm:px-5 sm:py-3 sm:text-sm"
            >
              દિવસો પર પાછા જાઓ
            </button>
            <button
              type="button"
              onClick={downloadPdf}
              className="flex-1 rounded-full border border-slate-300 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-900 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 sm:flex-none sm:px-5 sm:py-3 sm:text-sm"
            >
              PDF ડાઉનલોડ કરો
            </button>
            <button
              type="button"
              onClick={downloadExcel}
              className="flex-1 rounded-full border border-slate-300 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-900 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 sm:flex-none sm:px-5 sm:py-3 sm:text-sm"
            >
              શીટ ડાઉનલોડ કરો
            </button>
          </div>
        </div>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900/95 sm:p-6">
        <form onSubmit={createEntry} className="mb-6 rounded-3xl bg-slate-50 p-4 dark:bg-slate-950/40">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
            <label className="flex-1">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300 sm:text-sm">નોંધ</span>
              <input
                value={newEntry.description}
                onChange={(e) => setNewEntry((prev) => ({ ...prev, description: e.target.value }))}
                className="mt-1.5 w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-xs text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700 sm:rounded-3xl sm:py-3 sm:text-sm"
                placeholder="આ એન્ટ્રી માટે એક ઝડપી નોંધ દાખલ કરો"
              />
            </label>

            <div className="flex gap-3 w-full sm:w-auto">
              <label className="flex-1 sm:w-36 sm:flex-none">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 sm:text-sm">રકમ</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newEntry.amount}
                  onChange={(e) => setNewEntry((prev) => ({ ...prev, amount: e.target.value }))}
                  className="mt-1.5 w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-xs text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700 sm:rounded-3xl sm:py-3 sm:text-sm"
                  placeholder="0.00"
                />
              </label>

              <label className="flex-1 sm:w-40 sm:flex-none">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 sm:text-sm">પ્રકાર</span>
                <select
                  value={newEntry.type}
                  onChange={(e) => setNewEntry((prev) => ({ ...prev, type: e.target.value }))}
                  className="mt-1.5 w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-xs text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700 sm:rounded-3xl sm:py-3 sm:text-sm"
                >
                  <option value="income">આવક</option>
                  <option value="expenses">ખર્ચ</option>
                  <option value="extra expenses">વધારાનો ખર્ચ</option>
                </select>
              </label>
            </div>

            <div className="flex w-full items-end sm:w-auto">
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-2xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200 sm:rounded-3xl sm:py-3 sm:text-sm"
              >
                {saving ? 'સાચવી રહ્યાં છીએ...' : 'એન્ટ્રી ઉમેરો'}
              </button>
            </div>
          </div>
        </form>

        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-100 sm:text-xl">એન્ટ્રીઝ</h3>
            <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400 sm:text-sm">વ્યક્તિગત રેકોર્ડ્સની સમીક્ષા કરો અને કાઢી નાખો.</p>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">કુલ {day?.entries?.length || 0}</p>
        </div>

        {loading ? (
          <Spinner />
        ) : day?.entries?.length ? (
          <div className="space-y-3">
            {day.entries.map((entry) => {
              const type = String(entry.type || '').toLowerCase();
              const badgeClasses =
                type === 'income'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                  : type === 'extra expenses'
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                  : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300';

              return (
                <div key={entry._id} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:bg-slate-50 dark:border-slate-800/80 dark:bg-slate-900/40 dark:hover:bg-slate-900/60">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-950 dark:text-slate-100 sm:text-base">{entry.description}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold ${badgeClasses}`}>
                          {getDisplayType(entry.type)}
                        </span>
                        <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                          {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 text-right">
                      <p className="text-sm font-semibold text-slate-950 dark:text-slate-100 sm:text-base">{formatRupee(entry.amount)}</p>
                      <button
                        type="button"
                        onClick={() => removeEntry(entry._id)}
                        className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-700 transition hover:bg-rose-50 hover:text-rose-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                      >
                        કાઢી નાખો
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-300">
            <p className="text-lg font-semibold">હજુ સુધી કોઈ એન્ટ્રીઝ નથી</p>
            <p className="mt-2 text-sm">આ દિવસ માટે નવી એન્ટ્રી ઉમેરવા માટે ઉપરના ફોર્મનો ઉપયોગ કરો.</p>
          </div>
        )}
      </section>

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900/95 sm:p-6">
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="rounded-2xl bg-slate-100 p-2.5 dark:bg-slate-800/80 sm:rounded-3xl sm:p-5">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 sm:text-sm sm:tracking-[0.3em]">કુલ આવક</p>
            <p className="mt-1 text-xs font-semibold text-slate-950 dark:text-slate-100 xs:text-sm sm:mt-3 sm:text-2xl">{formatRupee(summary.income)}</p>
          </div>
          <div className="rounded-2xl bg-slate-100 p-2.5 dark:bg-slate-800/80 sm:rounded-3xl sm:p-5">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 sm:text-sm sm:tracking-[0.3em]">કુલ ખર્ચ</p>
            <p className="mt-1 text-xs font-semibold text-slate-950 dark:text-slate-100 xs:text-sm sm:mt-3 sm:text-2xl">{formatRupee(summary.expenses + summary.extraExpenses)}</p>
          </div>
          <div className="rounded-2xl bg-slate-100 p-2.5 dark:bg-slate-800/80 sm:rounded-3xl sm:p-5">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 sm:text-sm sm:tracking-[0.3em]">બેલેન્સ</p>
            <p className="mt-1 text-xs font-semibold text-slate-950 dark:text-slate-100 xs:text-sm sm:mt-3 sm:text-2xl">{formatRupee(summary.balance)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayPage;
