import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editRoles, setEditRoles] = useState({});
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*');
      if (error) {
        setError(error.message);
      } else {
        setUsers(data);
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  if (loading) return <p>Cargando usuarios...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Lista de Usuarios</h2>
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="py-2 px-4 border">ID</th>
            <th className="py-2 px-4 border">Nombre</th>
            <th className="py-2 px-4 border">Rol</th>
            <th className="py-2 px-4 border">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td className="py-2 px-4 border">{user.id}</td>
              <td className="py-2 px-4 border">{user.nombre}</td>
              <td className="py-2 px-4 border">
                <select
                  value={editRoles[user.id] ?? user.rol}
                  onChange={e => setEditRoles({ ...editRoles, [user.id]: e.target.value })}
                  className="border px-2 py-1"
                  disabled={savingId === user.id}
                >
                  <option value="admin">Administrador</option>
                  <option value="empleado">Empleado</option>
                  <option value="cliente">Cliente</option>
                </select>
                {user.rol === 'admin' && <span className="font-bold text-green-600 ml-2">⭐</span>}
              </td>
              <td className="py-2 px-4 border">
                <button
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                  disabled={savingId === user.id || (editRoles[user.id] ?? user.rol) === user.rol}
                  onClick={async () => {
                    setSavingId(user.id);
                    const newRol = editRoles[user.id] ?? user.rol;
                    const { error } = await supabase
                      .from('users')
                      .update({ rol: newRol })
                      .eq('id', user.id);
                    if (!error) {
                      setUsers(users.map(u => u.id === user.id ? { ...u, rol: newRol } : u));
                    }
                    setSavingId(null);
                  }}
                >
                  Guardar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UsersList;
