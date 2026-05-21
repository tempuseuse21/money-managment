import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Spinner from '../components/Spinner';

const formatRupee = (value) => {
  return `₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const getDaySummary = (entries) => {
  const summary = entries.reduce(
    (acc, entry) => {
      const amount = Number(entry.amount) || 0;
      const type = String(entry.type || '').toLowerCase();
      if (type === 'income') {
        acc.income += amount;
      } else if (type === 'extra expenses') {
        acc.extraExpenses += amount;
      } else {
        acc.expenses += amount;
      }
      return acc;
    },
    { income: 0, expenses: 0, extraExpenses: 0 }
  );
  return {
    income: summary.income,
    expenses: summary.expenses + summary.extraExpenses,
    balance: summary.income - summary.expenses - summary.extraExpenses,
  };
};

const HomePage = ({ days, loading, fetchDays }) => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    fetchDays();
  }, [fetchDays]);

  const getNextDayDate = () => {
    const currentDates = new Set(days.map((day) => day.date));
    let candidate = days.length ? new Date(days[0].date) : new Date();
    candidate = new Date(candidate.toISOString().slice(0, 10));

    while (currentDates.has(candidate.toISOString().slice(0, 10))) {
      candidate.setDate(candidate.getDate() + 1);
    }

    return candidate.toISOString().slice(0, 10);
  };

  const createNewDay = async () => {
    const dateToCreate = selectedDate || getNextDayDate();
    try {
      const response = await api.post('/day', { date: dateToCreate });
      if (response?.data?.date) {
        toast.success('નવો દિવસ બનાવવામાં આવ્યો');
        fetchDays();
        navigate(`/day/${encodeURIComponent(dateToCreate)}`);
      }
    } catch (error) {
      console.error(error);
      const message = error?.response?.data?.message || 'નવો દિવસ બનાવવામાં અસમર્થ';
      toast.error(message);
    }
  };

  const deleteDay = async (date) => {
    try {
      await api.delete(`/day/${encodeURIComponent(date)}`);
      toast.success('દિવસ કાઢી નાખવામાં આવ્યો');
      fetchDays();
    } catch (error) {
      console.error(error);
      const message = error?.response?.data?.message || 'દિવસ કાઢી નાખવામાં અસમર્થ';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900/90 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_270px] lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 sm:text-sm">નાણાકીય વિહંગાવલોકન</p>
            <h2 className="text-2xl font-semibold text-slate-950 dark:text-slate-100 sm:text-3xl">સ્માર્ટ બજેટ અને નાણાકીય આયોજન</h2>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">તારીખ પસંદ કરો</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700"
              />
            </label>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={createNewDay}
                className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200"
              >
                દિવસ ઉમેરો
              </button>
              <button
                type="button"
                onClick={fetchDays}
                className="rounded-full border border-slate-300 bg-slate-50 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                રિફ્રેશ કરો
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        {loading ? (
          <Spinner />
        ) : days.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-10 text-center text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-300">
            <p className="text-xl font-semibold">હજુ સુધી કોઈ દિવસના રેકોર્ડ નથી</p>
            <p className="mt-2 text-sm">દૈનિક એન્ટ્રીઝ ટ્રેક કરવાનું શરૂ કરવા માટે નવો દિવસ ઉમેરો પર ક્લિક કરો.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {days.map((day) => {
              const summary = getDaySummary(day.entries || []);
              return (
                <div key={day._id} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/95 sm:p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 sm:text-sm">{day.date}</p>
                  <h3 className="mt-4 text-2xl font-semibold text-slate-950 dark:text-slate-100">{formatRupee(summary.balance)}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{(day.entries || []).length} એન્ટ્રીઝ</p>

                  <div className="mt-6 grid grid-cols-3 gap-2 text-slate-700 dark:text-slate-300">
                    <div className="rounded-2xl bg-slate-100 p-2 dark:bg-slate-800 sm:p-3">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 sm:text-xs sm:tracking-[0.3em]">આવક</p>
                      <p className="mt-1 text-xs font-semibold text-slate-900 dark:text-slate-100 sm:text-sm">{formatRupee(summary.income)}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-100 p-2 dark:bg-slate-800 sm:p-3">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 sm:text-xs sm:tracking-[0.3em]">ખર્ચ</p>
                      <p className="mt-1 text-xs font-semibold text-slate-900 dark:text-slate-100 sm:text-sm">{formatRupee(summary.expenses)}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-100 p-2 dark:bg-slate-800 sm:p-3">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 sm:text-xs sm:tracking-[0.3em]">એન્ટ્રીઝ</p>
                      <p className="mt-1 text-xs font-semibold text-slate-900 dark:text-slate-100 sm:text-sm">{day.entries?.length || 0}</p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      to={`/day/${encodeURIComponent(day.date)}`}
                      className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200"
                    >
                      દિવસ જુઓ
                    </Link>
                    <button
                      type="button"
                      onClick={() => deleteDay(day.date)}
                      className="inline-flex items-center justify-center rounded-full border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-700 dark:bg-rose-950 dark:text-rose-200 dark:hover:bg-rose-900"
                    >
                      દિવસ કાઢી નાખો
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
