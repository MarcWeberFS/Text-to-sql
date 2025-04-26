import BenchmarkResults from "../components/benchmark-results"

export default function Benchmark() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <h1 className="text-4xl font-bold mb-4">Benchmark</h1>
      <BenchmarkResults correction={'is_correct'}/>
      <BenchmarkResults correction={'human_correction'}/>
    </div>
  )
}

