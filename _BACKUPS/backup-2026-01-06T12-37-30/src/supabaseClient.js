import { createClient } from '@supabase/supabase-js'

// On utilise des fausses clés par défaut si les vraies ne sont pas trouvées
// Cela permet au site de s'afficher (même si la connexion ne marchera pas encore)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)