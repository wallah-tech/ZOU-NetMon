interface ChartPlaceholderProps {
  title: string;
  height?: string;
  type?: 'line' | 'bar' | 'area';
}

export default function ChartPlaceholder({ title, height = 'h-64', type = 'line' }: ChartPlaceholderProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className={`${height} bg-gradient-to-br from-blue-50 to-slate-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300`}>
        <div className="text-center">
          <div className="text-gray-400 mb-2">
            {type === 'line' && (
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            )}
            {type === 'bar' && (
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            )}
            {type === 'area' && (
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            )}
          </div>
          <p className="text-sm text-gray-500 font-medium">{type.charAt(0).toUpperCase() + type.slice(1)} Chart</p>
          <p className="text-xs text-gray-400 mt-1">Data visualization placeholder</p>
        </div>
      </div>
    </div>
  );
}
