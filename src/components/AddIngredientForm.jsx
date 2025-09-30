// src/components/AddIngredientForm.jsx

import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function AddIngredientForm({ onNewIngredient, onCancel, existingIngredient, onUpdateIngredient }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    calorias: '',
    inventario: '',
    es_vegetariano: false,
    es_sano: false,
    tipo: 'complemento',
    sabor: ''
  });

  const isEditMode = !!existingIngredient;

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        nombre: existingIngredient.nombre || '',
        precio: existingIngredient.precio || '',
        calorias: existingIngredient.calorias || '',
        inventario: existingIngredient.inventario || '',
        es_vegetariano: existingIngredient.es_vegetariano || false,
        es_sano: existingIngredient.es_sano || false,
        tipo: existingIngredient.tipo || 'complemento',
        sabor: existingIngredient.sabor || ''
      });
    }
  }, [existingIngredient, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const ingredientData = {
        ...formData,
        precio: parseFloat(formData.precio),
        calorias: parseInt(formData.calorias, 10),
        inventario: parseInt(formData.inventario, 10),
        sabor: formData.tipo === 'base' ? formData.sabor : null
      };

      let data, error;

      if (isEditMode) {
        // Modo Edición: Actualizar el ingrediente existente
        ({ data, error } = await supabase
          .from('ingredientes')
          .update(ingredientData)
          .match({ id: existingIngredient.id })
          .select()
          .single());
        if (!error) onUpdateIngredient(data);
      } else {
        // Modo Creación: Insertar un nuevo ingrediente
        ({ data, error } = await supabase
          .from('ingredientes')
          .insert([ingredientData])
          .select()
          .single());
        if (!error) onNewIngredient(data);
      }

      if (error) throw error;

      // No es necesario resetear el formulario aquí porque el componente se desmontará o recibirá nuevos props

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 mb-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">
        {isEditMode ? 'Editar Ingrediente' : 'Añadir Nuevo Ingrediente'}
      </h3>
      {error && <p className="text-red-500 bg-red-100 p-2 rounded mb-4">Error: {error}</p>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Nombre" required className="p-2 border rounded" />
        <input type="number" name="precio" value={formData.precio} onChange={handleChange} placeholder="Precio" required className="p-2 border rounded" step="0.01" />
        <input type="number" name="calorias" value={formData.calorias} onChange={handleChange} placeholder="Calorías" required className="p-2 border rounded" />
        <input type="number" name="inventario" value={formData.inventario} onChange={handleChange} placeholder="Inventario" required className="p-2 border rounded" />
        <select name="tipo" value={formData.tipo} onChange={handleChange} className="p-2 border rounded">
          <option value="complemento">Complemento</option>
          <option value="base">Base</option>
        </select>
        {formData.tipo === 'base' && (
          <input type="text" name="sabor" value={formData.sabor} onChange={handleChange} placeholder="Sabor" required className="p-2 border rounded" />
        )}
      </div>
      <div className="flex items-center gap-4 mb-4">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="es_vegetariano" checked={formData.es_vegetariano} onChange={handleChange} className="h-4 w-4" />
          Es Vegetariano
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="es_sano" checked={formData.es_sano} onChange={handleChange} className="h-4 w-4" />
          Es Sano
        </label>
      </div>

      <div className="flex gap-4">
        <button type="submit" disabled={loading} className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300">
          {loading ? (isEditMode ? 'Actualizando...' : 'Añadiendo...') : (isEditMode ? 'Actualizar Ingrediente' : 'Añadir Ingrediente')}
        </button>
        <button type="button" onClick={onCancel} className="w-full px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default AddIngredientForm;
