import React, { useState, useEffect } from 'react';
import { useSelection } from '../context/SelectionContext';
import { supabase } from '../supabaseClient';
import { Plus, Minus } from 'lucide-react';

/**
 * Bouton "Ajouter / Retirer de ma sélection". Visible uniquement pour les utilisateurs connectés.
 * @param {Object} product - { id, name, image_url?, product_code? }
 * @param {string} [className] - Classes Tailwind additionnelles pour le bouton
 * @param {string} [variant] - 'card' | 'detail' pour adapter le style
 */
const AddToSelectionButton = ({ product, className = '', variant = 'card' }) => {
  const { addToSelection, removeFromSelection, isInSelection } = useSelection();
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => setSession(s));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription?.unsubscribe();
  }, []);

  if (!session || !product?.id) return null;

  const inSelection = isInSelection(product.id);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (inSelection) {
      removeFromSelection(product.id);
    } else {
      addToSelection(product);
    }
  };

  const baseClass = 'inline-flex items-center justify-center gap-2 font-semibold transition-all rounded-xl border';
  const primaryClass = 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:border-blue-700';
  const removeClass = 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200';

  if (variant === 'detail') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-2 transition-all ${inSelection ? 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 border border-slate-200' : 'bg-blue-600 text-white hover:bg-blue-700 border border-blue-600 shadow-lg'}`}
      >
        {inSelection ? <><Minus size={18} /> Retirer de ma sélection</> : <><Plus size={18} /> Ajouter à ma sélection</>}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${baseClass} ${inSelection ? removeClass : primaryClass} ${className}`}
    >
      {inSelection ? <Minus size={14} /> : <Plus size={14} />}
      {inSelection ? 'Retirer de ma sélection' : 'Ajouter à ma sélection'}
    </button>
  );
};

export default AddToSelectionButton;
