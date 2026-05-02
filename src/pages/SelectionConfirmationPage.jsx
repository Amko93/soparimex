import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, ShoppingBag } from 'lucide-react';

const SelectionConfirmationPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-emerald-600" size={48} />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">Demande envoyée</h1>
        <p className="text-slate-600 mb-8">
          Votre sélection a bien été transmise à notre équipe commerciale. Vous serez recontacté rapidement.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/selection"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition"
          >
            <ShoppingBag size={18} /> Ma sélection
          </Link>
          <Link
            to="/categories"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition"
          >
            Retour au catalogue <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SelectionConfirmationPage;
