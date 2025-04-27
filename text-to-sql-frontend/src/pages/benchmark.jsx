import BenchmarkResults from "../components/benchmark-results"
import BenchmarkResponseTime from "../components/benchmark-responsetime"
import BenchmarkFastestSlowest from "../components/benchmark-fastest-slowest-responsetime"
import BenchmarkCorrections from "../components/benchmark-correction-count"

export default function Benchmark() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <h1 className="text-4xl font-bold mb-4">Benchmark</h1>
      <BenchmarkResults correction={'is_correct'}/>
      <BenchmarkResults correction={'human_correction'}/>
      <BenchmarkCorrections />
      <BenchmarkResponseTime />
      <BenchmarkFastestSlowest />
    </div>
  )
}

