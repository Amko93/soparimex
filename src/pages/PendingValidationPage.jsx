import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Home, LogIn } from 'lucide-react';

const PendingValidationPage = () => {
  return (
    <div className="min-h-screen bg-site flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl border border-slate-100 p-12 text-center">
        {/* Icône */}
        <div className="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Clock className="text-amber-600" size={40} />
        </div>

        {/* Titre */}
        <h1 className="text-4xl font-black text-slate-900 mb-6">
          Inscription enregistrée
        </h1>

        {/* Message */}
        <p className="text-slate-600 text-lg font-medium mb-8 leading-relaxed">
          Votre compte a bien été créé. Il est actuellement en attente de validation par notre équipe administrateur. Vous recevrez un email une fois l'accès validé.
        </p>

        {/* Boutons */}
        <div className="flex flex-col gap-4">
          <Link
            to="/"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <Home size={20} />
            Retour à l'accueil
          </Link>
          
          <Link
            to="/login"
            className="text-slate-500 hover:text-blue-600 font-medium text-sm transition-colors flex items-center justify-center gap-2"
          >
            <LogIn size={16} />
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PendingValidationPage;
