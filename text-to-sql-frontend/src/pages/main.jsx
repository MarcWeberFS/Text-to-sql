import InputForm from "../components/input-form"

export default function MainPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <h1 className="text-4xl font-bold mb-4">Welcome to the Main Page</h1>
      <InputForm />
    </div>
  )
}

