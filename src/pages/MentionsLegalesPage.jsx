import React from 'react';

const MentionsLegalesPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 font-sans min-h-screen">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
          Mentions légales
        </h1>
        <p className="text-slate-500 text-lg">
          Informations légales relatives au site et à l'éditeur.
        </p>
      </div>

      <article className="prose prose-slate max-w-none space-y-8 text-slate-700 leading-relaxed">
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Éditeur du site</h2>
          <p>
            <strong>SOPARIMEX</strong> — SAS (Société par Actions Simplifiée)<br />
            Siège social : 12 Avenue des Pivoines, 93370 Montfermeil, France<br />
            SIREN : 904 426 665<br />
            SIRET : 904 426 665 00017<br />
            N° TVA Intracommunautaire : FR81 904 426 665<br />
            Code APE : 46.72Z — Commerce de gros de minerais et métaux<br />
            Date de création : 15 octobre 2021<br />
            Email : <a href="mailto:contact@soparimex.com" className="text-blue-600 hover:underline">contact@soparimex.com</a><br />
            Téléphone : 07 61 33 95 00
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Hébergement</h2>
          <p>
            Le site soparimex.com est hébergé par :<br /><br />
            <strong>Vercel Inc.</strong><br />
            440 N Barranca Ave #4133, Covina, CA 91723, États-Unis<br />
            Site web : <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">vercel.com</a><br /><br />
            Les données sont stockées par <strong>Supabase Inc.</strong>, dont les serveurs sont situés dans l'Union Européenne (région eu-central-1, Francfort, Allemagne).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Propriété intellectuelle</h2>
          <p>
            L'ensemble du contenu du site soparimex.com (textes, images, logos, icônes, mise en page) est la propriété exclusive de SOPARIMEX SAS ou de ses partenaires, et est protégé par les lois françaises et internationales relatives à la propriété intellectuelle. Toute reproduction, représentation, modification ou exploitation non autorisée de tout ou partie du site est strictement interdite et constitue une contrefaçon sanctionnée par le Code de la propriété intellectuelle.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Limitation de responsabilité</h2>
          <p>
            SOPARIMEX s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur ce site. Toutefois, SOPARIMEX ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations mises à disposition. En conséquence, SOPARIMEX décline toute responsabilité pour toute imprécision, inexactitude ou omission portant sur des informations disponibles sur le site. Le site peut contenir des liens vers d'autres sites internet. SOPARIMEX ne saurait être tenu responsable du contenu de ces sites tiers.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Droit applicable</h2>
          <p>
            Les présentes mentions légales sont régies par le droit français. En cas de litige, et après échec de toute tentative de recherche d'une solution amiable, les tribunaux compétents du ressort de Bobigny (Seine-Saint-Denis) seront seuls compétents pour connaître de ce litige.
          </p>
        </section>
      </article>
    </div>
  );
};

export default MentionsLegalesPage;
