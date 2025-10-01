// src/components/Products.jsx

import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

/**
 * Componente para mostrar el listado de productos con sus detalles.
 * Obtiene datos de las vistas de Supabase para costo y rentabilidad.
 */
function Products() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [notification, setNotification] = useState({ message: '', type: '' });

  // Efecto para limpiar la notificación después de 3 segundos
  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => {
        setNotification({ message: '', type: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('v_rentabilidad_producto')
        .select('*');

      if (error) throw error;
      
      const { data: caloriesData, error: caloriesError } = await supabase
        .from('v_calorias_producto')
        .select('producto_id, total_calorias');

      if (caloriesError) throw caloriesError;

      const productsWithDetails = data.map(product => {
        const calorieInfo = caloriesData.find(cal => cal.producto_id === product.producto_id);
        return {
          ...product,
          total_calorias: calorieInfo ? calorieInfo.total_calorias : 'N/A'
        };
      });

      setProducts(productsWithDetails);
    } catch (error) {
      setError(error.message);
    }
  };

  // Efecto para la carga inicial de datos
  useEffect(() => {
    setLoading(true);
    fetchProducts().finally(() => setLoading(false));
  }, []);

  const handleSell = async (product) => {
    try {
      const { data, error } = await supabase.rpc('vender_producto', { producto_id_param: product.producto_id });

      if (error) throw error;

      setNotification({ message: data, type: 'success' });
      await fetchProducts(); // Recargamos los productos sin activar el "loading"
    } catch (error) {
      setNotification({ message: error.message, type: 'error' });
      setError(error.message);
    }
  };

  if (loading) return <p className="text-center">Cargando productos...</p>;
  if (error && !notification.message) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
    <div className="p-4 mt-8">
      <h2 className="text-2xl font-bold mb-4">Listado de Productos</h2>

      {/* Componente de Notificación */}
      {notification.message && (
        <div className={`p-4 mb-4 rounded-md text-white ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {notification.message}
        </div>
      )}

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Venta</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Calorías</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rentabilidad</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.producto_id}>
                <td className="px-6 py-4 whitespace-nowrap">{product.nombre}</td>
                <td className="px-6 py-4 whitespace-nowrap">{product.precio_publico}</td>
                <td className="px-6 py-4 whitespace-nowrap">{product.costo}</td>
                <td className="px-6 py-4 whitespace-nowrap">{product.total_calorias}</td>
                <td className="px-6 py-4 whitespace-nowrap">{product.rentabilidad}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleSell(product)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Vender
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Products;
