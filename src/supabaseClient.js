// src/supabaseClient.js

import { createClient } from '@supabase/supabase-js'

// Lee las variables de entorno desde el objeto import.meta.env de Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Crea y exporta el cliente de Supabase
// Este cliente se puede importar en cualquier componente para interactuar con Supabase.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
