// src/App.jsx
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Auth from './components/Auth';
import Ingredients from './components/Ingredients';
import Products from './components/Products';
import UsersList from './components/UsersList';
import CreateUserForm from './components/CreateUserForm';
import logoHeladeria from './assets/logo-heladeria.svg';
import bgHeladeria from './assets/bg-heladeria.jpg';
import '@fontsource/lilita-one';
import Rentabilidad from './components/Rentabilidad';

/**
 * Componente principal de la aplicación.
 * Gestiona la sesión del usuario y renderiza la vista apropiada.
 */
function App() {
  const [session, setSession] = useState(null);
  const [rol, setRol] = useState(null);
  const [loadingRol, setLoadingRol] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Consultar el rol del usuario autenticado y registrar si no existe
  useEffect(() => {
    const fetchOrRegisterUser = async () => {
      if (session && session.user) {
        setLoadingRol(true);
        // Consultar si el usuario ya existe
        const { data, error } = await supabase
          .from('users')
          .select('rol')
          .eq('id', session.user.id)
          .single();
        if (error || !data) {
          // Si no existe, registrar usuario con rol 'cliente' por defecto
          const { error: insertError } = await supabase
            .from('users')
            .insert([
              {
                id: session.user.id,
                nombre: session.user.email,
                rol: 'cliente',
              },
            ]);
          setRol('cliente');
        } else {
          setRol(data?.rol || null);
        }
        setLoadingRol(false);
      } else {
        setRol(null);
      }
    };
    fetchOrRegisterUser();
  }, [session]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error al cerrar sesión:', error);
  };

  // Renderizado según rol
  let mainContent;
  if (!session) {
    // Público (no autenticado)
    mainContent = <Products />;
  } else if (loadingRol) {
    mainContent = <p>Cargando permisos...</p>;
  } else if (rol === 'admin') {
    mainContent = (
      <>
        <p className="mb-4">Bienvenido, <strong>{session.user.email}</strong> (Administrador).</p>
        <div className="mb-8"><Ingredients /></div>
        <hr className="my-8" />
        <div><Products /></div>
        <hr className="my-8" />
        <div className="mb-8"><CreateUserForm /></div>
        <div><UsersList /></div>
        <hr className="my-8" />
        <Rentabilidad />
      </>
    );
  } else if (rol === 'empleado') {
    mainContent = (
      <>
        <p className="mb-4">Bienvenido, <strong>{session.user.email}</strong> (Empleado).</p>
        <div className="mb-8"><Ingredients /></div>
        <hr className="my-8" />
        <div><Products /></div>
        {/* No mostrar funciones de rentabilidad */}
      </>
    );
  } else if (rol === 'cliente') {
    mainContent = (
      <>
        <p className="mb-4">Bienvenido, <strong>{session.user.email}</strong> (Cliente).</p>
        <div><Products /></div>
        {/* Solo venta y lista/calorías */}
      </>
    );
  } else {
    // Si el rol no se encuentra, mostrar solo productos
    mainContent = <Products />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-blue-100 text-gray-800" style={{ fontFamily: 'Lilita One, Arial, sans-serif' }}>
      <header className="bg-white shadow-lg">
        <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center mb-4 sm:mb-0">
            <img src={logoHeladeria} alt="Logo Heladería" className="w-16 h-16 mr-4 drop-shadow-lg" />
            <div>
              <h1 className="text-5xl font-extrabold text-pink-600 tracking-tight" style={{ fontFamily: 'Lilita One, Arial, sans-serif' }}>
                Heladería "El Buen Sabor"
              </h1>
              <p className="text-xl text-blue-500 font-semibold" style={{ fontFamily: 'Lilita One, Arial, sans-serif' }}>
                ¡Disfruta el sabor que alegra tu día!
              </p>
            </div>
          </div>
          {session && (
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-pink-500 to-yellow-400 hover:from-pink-600 hover:to-yellow-500 text-white font-bold py-2 px-6 rounded-full shadow-md transition-all duration-200"
            >
              Cerrar Sesión
            </button>
          )}
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {!session ? <Auth /> : null}
        {mainContent}
      </main>
    </div>
  );
}

export default App;
