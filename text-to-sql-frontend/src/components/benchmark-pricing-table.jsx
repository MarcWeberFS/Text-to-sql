"use client";

export default function BenchmarkPricingTable() {
  const data = {
    ChatGPT: {
      price_start: "$7.65",
      price_end: "$7.44",
      price_total: "$0.21",
      price_total_chf: "CHF 0.17",
      price_per_case_chf: "CHF 0.0068",
    },
    Deepseek: {
      price_start: "¥19.94",
      price_end: "¥19.27",
      price_total: "¥0.67",
      price_total_chf: "CHF 0.07",
      price_per_case_chf: "CHF 0.0028",
    },
    Grok: {
      price_start: "$4.90",
      price_end: "$0.72",
      price_total: "$4.18",
      price_total_chf: "CHF 3.38",
      price_per_case_chf: "CHF 0.1352",
    },
    Claude: {
      price_start: "$8.57",
      price_end: "$6.79",
      price_total: "$1.78",
      price_total_chf: "CHF 1.44",
      price_per_case_chf: "CHF 0.0576",
    },
    Gemini: {
      price_start: "0",
      price_end: "CHF 1.73",
      price_total: "CHF 1.73",
      price_total_chf: "CHF 1.73",
      price_per_case_chf: "CHF 0.0692",
    },
  };

  const llms = ["ChatGPT", "Deepseek", "Grok", "Claude", "Gemini"];
  const fields = [
    { label: "Price Start", key: "price_start" },
    { label: "Price End", key: "price_end" },
    { label: "Price Total", key: "price_total" },
    { label: "Price Total in CHF", key: "price_total_chf" },
    { label: "Price Per Case in CHF", key: "price_per_case_chf" },
  ];

  return (
    <div className="p-6 flex justify-center">
      <div className="w-full sm:w-4/5 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-lg shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider"></th>
              {llms.map((llm) => (
                <th key={llm} className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                  {llm}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {fields.map((field) => (
              <tr key={field.key}>
                <td className="px-6 py-4 text-center font-semibold">{field.label}</td>
                {llms.map((llm) => (
                  <td key={llm} className="px-6 py-4 text-center">
                    {data[llm][field.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
