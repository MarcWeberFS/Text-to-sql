import InputForm from "../components/input-form";
import Navigation from "../components/navigation";

export default function MainPage() {
  return (
    <>
      <Navigation />
      <div className="flex flex-col items-center justify-start min-h-screen pt-24 px-4 md:px-6 bg-white text-center">
        <h1 className="text-2xl md:text-4xl font-bold mb-4">Welcome to Text-to-PostGIS</h1>
        <h3 className="text-sm md:text-base text-gray-600 mb-6 max-w-2xl">
          Map data will only be displayed correctly when defining in prompt: return in WGS84 (EPSG:4326) coordinates
        </h3>
        <div className="w-full max-w-3xl">
          <InputForm />
        </div>
      </div>
    </>
  );
}
