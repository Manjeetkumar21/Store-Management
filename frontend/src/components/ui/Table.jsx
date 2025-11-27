export const Table = ({ headers, data, renderRow, loading = false }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {headers.map((header) => (
              <th key={header} className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={headers.length} className="text-center py-8 text-gray-500">
                Loading...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="text-center py-8 text-gray-500">
                No data available
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr key={item._id || index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                {renderRow(item, index)}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
