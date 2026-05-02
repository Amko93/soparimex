import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 font-sans">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={40} className="text-amber-500" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-3">Page introuvable</h1>
        <p className="text-slate-500 font-medium mb-8">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg transition-all hover:-translate-y-0.5"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
