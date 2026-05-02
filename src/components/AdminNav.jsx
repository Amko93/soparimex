import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, LayoutGrid, Users, ClipboardList, History } from 'lucide-react';
import { supabase } from '../supabaseClient';

const AdminNav = () => {
  const location = useLocation();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user?.id) {
        const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
        if (data) setUserRole(data.role);
      }
    });
  }, []);

  const isCommercial = userRole === 'commercial';
  const currentPath = location.pathname;

  const links = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, hideForCommercial: true },
    { to: '/admin/categories', label: 'Catalogue', icon: LayoutGrid, hideForCommercial: true },
    { to: '/admin/users', label: 'Utilisateurs', icon: Users, hideForCommercial: true },
    { to: '/admin/leads', label: 'Demandes', icon: ClipboardList, hideForCommercial: false },
    { to: '/admin/leads/archive', label: 'Historique', icon: History, hideForCommercial: false },
  ];

  const isActive = (path) => {
    if (path === '/admin') return currentPath === '/admin';
    return currentPath.startsWith(path);
  };

  return (
    <nav className="flex flex-wrap items-center gap-2 mb-8">
      {links
        .filter(link => !(isCommercial && link.hideForCommercial))
        .map(link => {
          const Icon = link.icon;
          const active = isActive(link.to);
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                active
                  ? 'bg-slate-900 text-white shadow-lg'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-blue-200'
              }`}
            >
              <Icon size={16} />
              {link.label}
            </Link>
          );
        })}
    </nav>
  );
};

export default AdminNav;
