import { useState } from 'react';
import { supabase } from '../supabaseClient';

function CreateUserForm() {
  const [form, setForm] = useState({ email: '', nombre: '', rol: 'cliente', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // Crear usuario en auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });
      if (signUpError) throw signUpError;
      // Insertar datos adicionales en la tabla users
      const userId = data.user?.id;
      if (userId) {
        const { error: dbError } = await supabase
          .from('users')
          .insert({ id: userId, nombre: form.nombre, rol: form.rol });
        if (dbError) throw dbError;
      }
      setSuccess('Usuario creado correctamente.');
      setForm({ email: '', nombre: '', rol: 'cliente', password: '' });
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 p-4 border rounded bg-white">
      <h3 className="text-lg font-bold mb-2">Crear nuevo usuario</h3>
      <div className="mb-2">
        <label>Email:</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} required className="border px-2 py-1 w-full" />
      </div>
      <div className="mb-2">
        <label>Nombre:</label>
        <input type="text" name="nombre" value={form.nombre} onChange={handleChange} required className="border px-2 py-1 w-full" />
      </div>
      <div className="mb-2">
        <label>Rol:</label>
        <select name="rol" value={form.rol} onChange={handleChange} className="border px-2 py-1 w-full">
          <option value="admin">Administrador</option>
          <option value="empleado">Empleado</option>
          <option value="cliente">Cliente</option>
        </select>
      </div>
      <div className="mb-2">
        <label>Contraseña:</label>
        <input type="password" name="password" value={form.password} onChange={handleChange} required className="border px-2 py-1 w-full" />
      </div>
      <button type="submit" disabled={loading} className="bg-blue-500 text-white px-4 py-2 rounded">
        {loading ? 'Creando...' : 'Crear usuario'}
      </button>
      {error && <p className="text-red-500 mt-2">Error: {error}</p>}
      {success && <p className="text-green-500 mt-2">{success}</p>}
    </form>
  );
}

export default CreateUserForm;
