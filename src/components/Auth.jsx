// src/components/Auth.jsx

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../supabaseClient';

/**
 * Componente para la autenticación de usuarios.
 * Utiliza el componente pre-construido de Supabase UI para el formulario.
 */

function AuthComponent() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Iniciar sesión en la Heladería</h1>
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={["google"]}
        theme="dark"
      />
    </div>
  );
}

export default AuthComponent;
