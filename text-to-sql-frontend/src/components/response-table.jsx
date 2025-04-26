export default function ResponseTable({ data }) {
  return (
    <div className="overflow-x-auto mt-10 border border-gray-300 rounded shadow-md">
      <table className="min-w-full divide-y divide-gray-200 table-fixed">
        <thead className="bg-gray-50">
          <tr>
            {Object.keys(data[0]).map((key) => (
              <th
                key={key}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider truncate max-w-[200px]"
              >
                {key}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, index) => (
            <tr key={index}>
              {Object.entries(row).map(([key, value], idx) => (
                <td
                  key={idx}
                  className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 truncate max-w-[200px]"
                  title={typeof value === "object" && value !== null
                    ? value.value ?? JSON.stringify(value)
                    : value?.toString()}
                >
                  {typeof value === "object" && value !== null
                    ? (value.value ?? JSON.stringify(value)).toString().slice(0, 50)
                    : value?.toString().slice(0, 50)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
