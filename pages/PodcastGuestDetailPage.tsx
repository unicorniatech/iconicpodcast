import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CalendarDays, UserPlus, ArrowLeft, Mail, Instagram } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { PodcastGuest, EpisodePlan, getGuests, getEpisodePlans } from '../services/podcastToolsService';

const PodcastGuestDetailPage: React.FC = () => {
  const { id } = useParams();
  const { lang } = useLanguage();
  const [guest, setGuest] = useState<PodcastGuest | null>(null);
  const [plans, setPlans] = useState<EpisodePlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const [{ data: guestsData }, { data: plansData }] = await Promise.all([
        getGuests(),
        getEpisodePlans(),
      ]);
      const foundGuest = (guestsData || []).find((g) => g.id === id) || null;
      setGuest(foundGuest || null);
      setPlans((plansData || []).filter((p) => p.guest_id === id));
      setIsLoading(false);
    };
    load();
  }, [id]);

  const t = lang === 'cs-CZ'
    ? {
        back: 'Zpět na podcast nástroje',
        title: 'Detail hosta',
        episodes_with_guest: 'Epizody s tímto hostem',
        contact: 'Kontakt',
        no_episodes: 'Zatím nejsou naplánované žádné epizody pro tohoto hosta.',
      }
    : lang === 'es-MX'
    ? {
        back: 'Volver a herramientas de podcast',
        title: 'Detalle de invitada/o',
        episodes_with_guest: 'Episodios con esta persona invitada',
        contact: 'Contacto',
        no_episodes: 'Todavía no hay episodios planificados para esta persona invitada.',
      }
    : {
        back: 'Back to Podcast tools',
        title: 'Guest detail',
        episodes_with_guest: 'Episodes with this guest',
        contact: 'Contact',
        no_episodes: 'No episodes are planned with this guest yet.',
      };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white pt-32 px-4 pb-12">
        <div className="max-w-5xl mx-auto text-sm text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!guest) {
    return (
      <div className="min-h-screen bg-white pt-32 px-4 pb-12">
        <div className="max-w-5xl mx-auto">
          <Link to="/crm/podcast-tools" className="inline-flex items-center text-sm text-gray-500 hover:text-iconic-pink mb-4">
            <ArrowLeft size={16} className="mr-1" /> {t.back}
          </Link>
          <div className="text-gray-700">Guest not found.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-32 px-4 pb-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link to="/crm/podcast-tools" className="inline-flex items-center text-sm text-gray-500 hover:text-iconic-pink mb-2">
              <ArrowLeft size={16} className="mr-1" /> {t.back}
            </Link>
            <h1 className="text-2xl font-serif font-bold text-iconic-black flex items-center gap-2">
              <UserPlus size={20} className="text-iconic-pink" />
              {guest.full_name}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-md border border-gray-200 p-4">
            <h2 className="font-semibold text-iconic-black mb-3">{t.contact}</h2>
            <div className="space-y-2 text-sm text-gray-700">
              {guest.email && (
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <Mail size={14} />
                    {guest.email}
                  </span>
                  <a
                    href={`mailto:${guest.email}`}
                    className="text-iconic-pink text-xs font-semibold hover:underline"
                  >
                    Email
                  </a>
                </div>
              )}
              {guest.instagram_handle && (
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <Instagram size={14} />
                    @{guest.instagram_handle}
                  </span>
                  <a
                    href={`https://instagram.com/${guest.instagram_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-iconic-pink text-xs font-semibold hover:underline"
                  >
                    Instagram
                  </a>
                </div>
              )}
              {guest.expertise && (
                <div>
                  <div className="text-xs uppercase text-gray-400 mb-1">Expertise</div>
                  <div>{guest.expertise}</div>
                </div>
              )}
              {guest.notes && (
                <div>
                  <div className="text-xs uppercase text-gray-400 mb-1">Notes</div>
                  <div className="whitespace-pre-wrap text-gray-800">{guest.notes}</div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl shadow-md border border-gray-200 p-4">
            <h2 className="font-semibold text-iconic-black mb-3 flex items-center gap-2">
              <CalendarDays size={18} /> {t.episodes_with_guest}
            </h2>
            {plans.length === 0 ? (
              <div className="text-sm text-gray-500">{t.no_episodes}</div>
            ) : (
              <div className="space-y-3">
                {plans.map((p) => (
                  <Link
                    key={p.id}
                    to={`/crm/podcast-tools/episodes/${p.id}`}
                    className="block border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white hover:border-iconic-pink hover:shadow-sm transition-all"
                  >
                    <div className="font-semibold text-iconic-black mb-1">{p.title}</div>
                    <div className="text-xs text-gray-500 flex gap-3">
                      <span>Status: {p.status}</span>
                      {p.planned_date && <span>Date: {p.planned_date}</span>}
                    </div>
                    {p.outline && (
                      <div className="mt-1 text-xs text-gray-700 line-clamp-2">{p.outline}</div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PodcastGuestDetailPage;
