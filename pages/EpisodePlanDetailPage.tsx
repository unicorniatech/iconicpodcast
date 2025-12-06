import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText, CalendarDays, UserPlus, Link as LinkIcon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { EpisodePlan, EpisodePlanStatus, PodcastGuest, getEpisodePlans, getGuests, upsertEpisodePlan } from '../services/podcastToolsService';

const EpisodePlanDetailPage: React.FC = () => {
  const { id } = useParams();
  const { lang } = useLanguage();
  const [plan, setPlan] = useState<EpisodePlan | null>(null);
  const [guests, setGuests] = useState<PodcastGuest[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [{ data: plansData }, { data: guestsData }] = await Promise.all([
        getEpisodePlans(),
        getGuests(),
      ]);
      const foundPlan = (plansData || []).find((p) => p.id === id) || null;
      setPlan(foundPlan || null);
      setGuests(guestsData || []);
    };
    load();
  }, [id]);

  const t = lang === 'cs-CZ'
    ? {
        back: 'Zpět na podcast nástroje',
        title: 'Detail plánu epizody',
        guest_label: 'Host epizody',
        outline: 'Osnova / body k epizodě',
        resources: 'Odkazy a soubory',
        notes: 'Poznámky / otázky pro hosta',
        save: 'Uložit změny',
      }
    : lang === 'es-MX'
    ? {
        back: 'Volver a herramientas de podcast',
        title: 'Detalle del plan de episodio',
        guest_label: 'Invitada/o del episodio',
        outline: 'Guion / puntos clave',
        resources: 'Enlaces y archivos',
        notes: 'Notas / preguntas para la persona invitada',
        save: 'Guardar cambios',
      }
    : {
        back: 'Back to Podcast tools',
        title: 'Episode plan detail',
        guest_label: 'Episode guest',
        outline: 'Outline / talking points',
        resources: 'Links & files',
        notes: 'Notes / questions for guest',
        save: 'Save changes',
      };

  const handleUpdate = async (patch: Partial<EpisodePlan>) => {
    if (!plan) return;
    const updated = { ...plan, ...patch } as Partial<EpisodePlan>;
    setPlan(updated as EpisodePlan);
    setIsSaving(true);
    try {
      const { data } = await upsertEpisodePlan(updated);
      if (data) setPlan(data);
    } finally {
      setIsSaving(false);
    }
  };

  if (!plan) {
    return (
      <div className="min-h-screen bg-white pt-32 px-4 pb-12">
        <div className="max-w-5xl mx-auto">
          <Link to="/crm/podcast-tools" className="inline-flex items-center text-sm text-gray-500 hover:text-iconic-pink mb-4">
            <ArrowLeft size={16} className="mr-1" /> {t.back}
          </Link>
          <div className="text-gray-700">Episode plan not found.</div>
        </div>
      </div>
    );
  }

  const selectedGuest = plan.guest_id ? guests.find((g) => g.id === plan.guest_id) || null : null;

  return (
    <div className="min-h-screen bg-gray-100 pt-32 px-4 pb-12">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-300 px-5 py-6 sm:px-7 sm:py-7">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link to="/crm/podcast-tools" className="inline-flex items-center text-sm text-gray-500 hover:text-iconic-pink mb-2">
              <ArrowLeft size={16} className="mr-1" /> {t.back}
            </Link>
            <h1 className="text-2xl font-serif font-bold text-iconic-black flex items-center gap-2">
              <FileText size={20} className="text-iconic-pink" />
              {plan.title}
            </h1>
            <div className="mt-2 text-xs text-gray-800 flex gap-4">
              <span className="font-medium">Status: <span className="font-normal">{plan.status}</span></span>
              {plan.planned_date && (
                <span className="flex items-center gap-1">
                  <CalendarDays size={14} /> {plan.planned_date}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => handleUpdate({})}
            disabled={isSaving}
            className="px-4 py-2 rounded-full bg-iconic-pink text-white text-xs font-semibold hover:bg-pink-600 disabled:opacity-50"
          >
            {isSaving ? 'Saving…' : t.save}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-md border border-gray-400 p-4">
            <h2 className="font-semibold text-iconic-black mb-3 flex items-center gap-2">
              <UserPlus size={16} /> {t.guest_label}
            </h2>
            <select
              className="w-full px-3 py-2 border border-gray-500 rounded-lg text-sm bg-white text-gray-900 mb-3 focus:outline-none focus:ring-2 focus:ring-iconic-pink/60 focus:border-iconic-pink"
              value={plan.guest_id || ''}
              onChange={(e) => handleUpdate({ guest_id: e.target.value || null })}
            >
              <option value="">—</option>
              {guests.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.full_name}
                </option>
              ))}
            </select>
            {selectedGuest && (
              <div className="text-sm text-gray-900 space-y-1">
                <div className="font-semibold">{selectedGuest.full_name}</div>
                {selectedGuest.email && (
                  <a
                    href={`mailto:${selectedGuest.email}`}
                    className="inline-flex items-center gap-1 text-iconic-pink text-xs font-semibold hover:underline"
                  >
                    <LinkIcon size={12} /> Email
                  </a>
                )}
                {selectedGuest.instagram_handle && (
                  <div className="text-gray-700">
                    @{selectedGuest.instagram_handle}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl shadow-md border border-gray-400 p-4 space-y-5">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-700 mb-1">{t.outline}</div>
              <textarea
                className="w-full px-3 py-2 border border-gray-500 rounded-lg text-sm resize-none bg-white text-gray-900 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-iconic-pink/60 focus:border-iconic-pink"
                value={plan.outline || ''}
                onChange={(e) => handleUpdate({ outline: e.target.value })}
              />
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-700 mb-1">{t.resources}</div>
              <textarea
                className="w-full px-3 py-2 border border-gray-500 rounded-lg text-sm resize-none bg-white text-gray-900 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-iconic-pink/60 focus:border-iconic-pink"
                value={(plan.resources || []).map((r) => `${r.label}|${r.url}`).join('\n')}
                onChange={(e) => {
                  const lines = e.target.value.split(/\n/).map((l) => l.trim()).filter(Boolean);
                  const resources = lines.map((line) => {
                    const [label, url] = line.split('|');
                    return { label: label || url, url: url || label };
                  });
                  handleUpdate({ resources });
                }}
              />
              {plan.resources && plan.resources.length > 0 && (
                <div className="mt-2 space-y-1 text-xs text-gray-900">
                  {plan.resources.map((r, idx) => (
                    <a
                      key={idx}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-iconic-pink hover:underline mr-3"
                    >
                      <LinkIcon size={12} /> {r.label}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-700 mb-1">{t.notes}</div>
              <textarea
                className="w-full px-3 py-2 border border-gray-500 rounded-lg text-sm resize-none bg-white text-gray-900 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-iconic-pink/60 focus:border-iconic-pink"
                value={plan.notes || ''}
                onChange={(e) => handleUpdate({ notes: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EpisodePlanDetailPage;
