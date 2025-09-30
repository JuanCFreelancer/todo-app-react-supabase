// src/components/Ingredients.jsx

import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Importamos nuestro cliente de Supabase
import AddIngredientForm from './AddIngredientForm'; // Importamos el formulario

/**
 * Componente para gestionar el CRUD de Ingredientes.
 * Muestra la lista de ingredientes y permite crear, editar y eliminar.
 */
function Ingredients() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [showForm, setShowForm] = useState(false); // Estado para mostrar/ocultar el formulario de añadir
  const [editingIngredient, setEditingIngredient] = useState(null); // Estado para el ingrediente en edición

  // Función para añadir el nuevo ingrediente al estado local
  const handleNewIngredient = (newIngredient) => {
    setIngredients(prevIngredients => [...prevIngredients, newIngredient]);
    setShowForm(false);
  };

  // Función para actualizar un ingrediente en el estado local
  const handleUpdateIngredient = (updatedIngredient) => {
    setIngredients(prevIngredients => 
      prevIngredients.map(ing => ing.id === updatedIngredient.id ? updatedIngredient : ing)
    );
    setEditingIngredient(null); // Cerramos el formulario de edición
  };

  // Función para manejar el clic en el botón de editar
  const handleEditClick = (ingredient) => {
    setEditingIngredient(ingredient);
    setShowForm(false); // Ocultamos el form de añadir si estuviera abierto
  };

  // Función para cancelar la edición
  const handleCancelEdit = () => {
    setEditingIngredient(null);
  };

  // Función para eliminar un ingrediente
  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este ingrediente?')) {
      try {
        const { error } = await supabase.from('ingredientes').delete().match({ id });
        if (error) throw error;
        setIngredients(prevIngredients => prevIngredients.filter(ing => ing.id !== id));
      } catch (error) {
        setError(`Error al eliminar: ${error.message}`);
      }
    }
  };

  // Cargar los datos al montar el componente
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.from('ingredientes').select('*');
        if (error) throw error;
        setIngredients(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchIngredients();
  }, []);

  if (loading) return <p className="text-center">Cargando ingredientes...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Gestión de Ingredientes</h2>

      {/* Mostramos el botón de añadir solo si no estamos editando o añadiendo */}
      {!showForm && !editingIngredient && (
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
        >
          Añadir Ingrediente
        </button>
      )}

      {/* Formulario para AÑADIR un nuevo ingrediente */}
      {showForm && (
        <AddIngredientForm
          onNewIngredient={handleNewIngredient}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Formulario para EDITAR un ingrediente existente */}
      {editingIngredient && (
        <AddIngredientForm
          existingIngredient={editingIngredient}
          onUpdateIngredient={handleUpdateIngredient}
          onCancel={handleCancelEdit}
        />
      )}

      <div className="overflow-x-auto bg-white rounded-lg shadow mt-4">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Calorías</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inventario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ingredients.map((ingredient) => (
              <tr key={ingredient.id}>
                <td className="px-6 py-4 whitespace-nowrap">{ingredient.nombre}</td>
                <td className="px-6 py-4 whitespace-nowrap">${ingredient.precio}</td>
                <td className="px-6 py-4 whitespace-nowrap">{ingredient.calorias}</td>
                <td className="px-6 py-4 whitespace-nowrap">{ingredient.inventario}</td>
                <td className="px-6 py-4 whitespace-nowrap">{ingredient.tipo}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => handleEditClick(ingredient)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                  <button onClick={() => handleDelete(ingredient.id)} className="text-red-600 hover:text-red-900 ml-4">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Ingredients;
