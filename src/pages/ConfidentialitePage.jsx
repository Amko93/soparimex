import React from 'react';

const ConfidentialitePage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 font-sans min-h-screen">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
          Politique de confidentialité
        </h1>
        <p className="text-slate-500 text-lg">
          Comment nous collectons, utilisons et protégeons vos données personnelles.
        </p>
      </div>

      <article className="prose prose-slate max-w-none space-y-8 text-slate-700 leading-relaxed">
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Données collectées</h2>
          <p>
            Dans le cadre de l'utilisation du site soparimex.com, nous collectons les données personnelles suivantes :
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-1">
            <li><strong>Lors de l'inscription</strong> : nom complet, adresse email, nom de société, numéro SIRET, numéro de téléphone.</li>
            <li><strong>Lors de l'envoi d'un message via le formulaire de contact</strong> : prénom, nom, entreprise, téléphone, email et contenu du message.</li>
            <li><strong>Lors de la création d'une demande de fournitures</strong> : liste des produits sélectionnés et message associé.</li>
          </ul>
          <p className="mt-3">
            Ces données sont collectées avec votre consentement lors de la création de votre compte ou de l'envoi d'un formulaire.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Utilisation des données</h2>
          <p>
            Vos données personnelles sont utilisées exclusivement pour :
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-1">
            <li>La gestion de votre compte client et l'authentification sur le site.</li>
            <li>Le traitement de vos demandes de fournitures industrielles.</li>
            <li>La communication relative à vos commandes et demandes en cours.</li>
            <li>L'envoi de réponses à vos messages de contact.</li>
          </ul>
          <p className="mt-3">
            Vos données ne sont jamais vendues, louées ou partagées avec des tiers à des fins commerciales. Elles sont uniquement accessibles par l'équipe SOPARIMEX dans le cadre du traitement de vos demandes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Conservation et sécurité</h2>
          <p>
            Vos données sont conservées aussi longtemps que votre compte est actif, et pendant une durée maximale de 3 ans après votre dernière activité, conformément aux recommandations de la CNIL.
          </p>
          <p className="mt-3">
            Les données sont stockées de manière sécurisée sur les serveurs de <strong>Supabase</strong>, hébergés dans l'Union Européenne (Francfort, Allemagne). Les communications entre votre navigateur et nos serveurs sont chiffrées via le protocole HTTPS/TLS. Les mots de passe sont hachés avec l'algorithme bcrypt et ne sont jamais stockés en clair.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Vos droits (RGPD)</h2>
          <p>
            Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, vous disposez des droits suivants sur vos données personnelles :
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-1">
            <li><strong>Droit d'accès</strong> : obtenir une copie de vos données personnelles.</li>
            <li><strong>Droit de rectification</strong> : corriger des données inexactes ou incomplètes.</li>
            <li><strong>Droit de suppression</strong> : demander l'effacement de vos données.</li>
            <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré.</li>
            <li><strong>Droit d'opposition</strong> : vous opposer au traitement de vos données.</li>
          </ul>
          <p className="mt-3">
            Pour exercer ces droits, contactez-nous à : <a href="mailto:contact@soparimex.com" className="text-blue-600 hover:underline">contact@soparimex.com</a> ou par courrier à SOPARIMEX, 12 Avenue des Pivoines, 93370 Montfermeil. Nous nous engageons à répondre dans un délai de 30 jours.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Cookies</h2>
          <p>
            Le site soparimex.com utilise uniquement des cookies techniques strictement nécessaires au fonctionnement du service d'authentification (session Supabase Auth). Ces cookies permettent de maintenir votre connexion active lors de votre navigation.
          </p>
          <p className="mt-3">
            Nous n'utilisons aucun cookie publicitaire, aucun cookie de suivi tiers et aucun outil d'analyse d'audience. Aucun consentement supplémentaire n'est requis pour ces cookies techniques, conformément à la directive ePrivacy et aux recommandations de la CNIL.
          </p>
        </section>
      </article>
    </div>
  );
};

export default ConfidentialitePage;
