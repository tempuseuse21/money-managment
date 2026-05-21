import React from 'react';

const Spinner = () => {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-slate-700 dark:border-slate-600 dark:border-t-slate-100" />
    </div>
  );
};

export default Spinner;
