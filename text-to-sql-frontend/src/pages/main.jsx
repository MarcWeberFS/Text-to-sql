import InputForm from "../components/input-form"

export default function MainPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <h1 className="text-4xl font-bold mb-4">Welcome to Text-to-PostGIS</h1>
      <h3 className="text-sm mb-4">Map data will only be displayed correctly when defining in prompt: return in WGS84 (EPSG:4326) coordinates</h3>
      <InputForm />
    </div>
  )
}

