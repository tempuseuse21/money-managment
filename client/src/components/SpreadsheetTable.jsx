import RowItem from './RowItem';

const SpreadsheetTable = ({ rows, onRowChange, onAddRow, onRemoveRow, onSave, saving, loading }) => {
  return (
    <section className="rounded-3xl bg-white/90 p-6 shadow-card ring-1 ring-slate-200/80 backdrop-blur dark:bg-slate-900/90 dark:ring-slate-700/80">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Add new entries</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Add one or more rows, then save to store them in MongoDB.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onAddRow}
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-950 dark:hover:bg-slate-100"
          >
            Add row
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving || loading}
            className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-300 dark:bg-blue-500 dark:hover:bg-blue-400"
          >
            {saving ? 'Saving...' : 'Save entries'}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {rows.map((row) => (
          <RowItem key={row.id} row={row} onRowChange={onRowChange} onRemove={onRemoveRow} canRemove={rows.length > 1} />
        ))}
      </div>
    </section>
  );
};

export default SpreadsheetTable;
