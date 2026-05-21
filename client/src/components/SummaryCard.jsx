const accentStyles = {
  green: 'bg-emerald-500 text-emerald-900/95',
  orange: 'bg-orange-500 text-orange-900/95',
  blue: 'bg-sky-500 text-sky-950',
  red: 'bg-rose-500 text-rose-950',
};

const SummaryCard = ({ title, value, accent }) => {
  return (
    <div className="rounded-3xl bg-white/90 p-6 shadow-card ring-1 ring-slate-200/80 backdrop-blur dark:bg-slate-900/90 dark:ring-slate-700/80">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">${value.toFixed(2)}</p>
        </div>
        <div className={`inline-flex h-12 w-12 items-center justify-center rounded-3xl ${accentStyles[accent]}`}>
          <span className="text-lg font-semibold">{accent === 'red' ? '⚠️' : '✔️'}</span>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
