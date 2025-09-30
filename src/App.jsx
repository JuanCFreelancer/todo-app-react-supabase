// src/App.jsx
import Ingredients from './components/Ingredients';

/**
 * Componente principal de la aplicación.
 * Funciona como el contenedor general y punto de entrada de la interfaz de usuario.
 */
function App() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-center text-blue-600">Heladería "El Buen Sabor"</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold mb-4">Gestión de Ingredientes</h2>
        {/* Aquí se renderiza el componente que gestiona los ingredientes */}
        <Ingredients />
      </main>
    </div>
  )
}

export default App
