const RowItem = ({ row, onRowChange, onRemove, canRemove }) => {
  return (
    <div className="grid gap-3 sm:grid-cols-[1.5fr_1fr_1fr_1fr_0.8fr] sm:items-end sm:gap-4">
      <label className="flex w-full flex-col gap-2 text-sm text-slate-700 dark:text-slate-300">
        Date
        <input
          type="date"
          value={row.date}
          onChange={(event) => onRowChange(row.id, 'date', event.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
      </label>
      <label className="flex w-full flex-col gap-2 text-sm text-slate-700 dark:text-slate-300">
        Income
        <input
          type="number"
          value={row.income}
          min="0"
          onChange={(event) => onRowChange(row.id, 'income', event.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
      </label>
      <label className="flex w-full flex-col gap-2 text-sm text-slate-700 dark:text-slate-300">
        Expenses
        <input
          type="number"
          value={row.expenses}
          min="0"
          onChange={(event) => onRowChange(row.id, 'expenses', event.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
      </label>
      <label className="flex w-full flex-col gap-2 text-sm text-slate-700 dark:text-slate-300">
        Other
        <input
          type="number"
          value={row.otherExpenses}
          min="0"
          onChange={(event) => onRowChange(row.id, 'otherExpenses', event.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
      </label>
      <button
        type="button"
        onClick={() => onRemove(row.id)}
        disabled={!canRemove}
        className="mt-2 h-12 w-full rounded-2xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-600"
      >
        Remove
      </button>
    </div>
  );
};

export default RowItem;
