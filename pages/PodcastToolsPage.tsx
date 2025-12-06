import React, { useEffect, useState } from 'react';
import { CalendarDays, UserPlus, FileText, Plus, Trash2, Edit2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { PodcastGuest, EpisodePlan, EpisodePlanStatus, getGuests, getEpisodePlans, upsertGuest, upsertEpisodePlan, deleteGuest, deleteEpisodePlan } from '../services/podcastToolsService';

export const PodcastToolsPage: React.FC = () => {
  const { lang } = useLanguage();
  const [guests, setGuests] = useState<PodcastGuest[]>([]);
  const [plans, setPlans] = useState<EpisodePlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [guestForm, setGuestForm] = useState<Partial<PodcastGuest>>({});
  const [planForm, setPlanForm] = useState<Partial<EpisodePlan>>({ status: 'idea' });

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const [{ data: g }, { data: p }] = await Promise.all([getGuests(), getEpisodePlans()]);
      setGuests(g || []);
      setPlans(p || []);
      setIsLoading(false);
    };
    load();
  }, []);

  const handleSaveGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestForm.full_name?.trim()) return;
    const { data } = await upsertGuest(guestForm);
    if (data) {
      setGuestForm({});
      const { data: g } = await getGuests();
      setGuests(g || []);
    }
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planForm.title?.trim()) return;
    const { data } = await upsertEpisodePlan(planForm);
    if (data) {
      setPlanForm({ status: 'idea' });
      const { data: p } = await getEpisodePlans();
      setPlans(p || []);
    }
  };

  const handleEditGuest = (g: PodcastGuest) => setGuestForm(g);
  const handleEditPlan = (p: EpisodePlan) => setPlanForm(p);

  const t = lang === 'cs-CZ'
    ? {
        title: 'Podcast nástroje',
        guests: 'Hosté',
        episodes: 'Episode plánovač',
        new_guest: 'Nový host',
        name: 'Jméno',
        email: 'Email',
        instagram: 'Instagram',
        expertise: 'Expertíza',
        notes: 'Poznámky',
        save: 'Uložit',
        new_plan: 'Nový plán epizody',
        status: 'Stav',
        date: 'Datum',
        outline: 'Osnova / body k epizodě',
        resources: 'Odkazy (oddělené čárkou)',
        recording_link: 'Odkaz na nahrávku',
        idea: 'Nápad',
        planned: 'Plánováno',
        recorded: 'Nahráno',
        published: 'Publikováno',
      }
    : lang === 'es-MX'
    ? {
        title: 'Herramientas de podcast',
        guests: 'Invitadas/os',
        episodes: 'Planificador de episodios',
        new_guest: 'Nueva persona invitada',
        name: 'Nombre',
        email: 'Correo',
        instagram: 'Instagram',
        expertise: 'Experiencia',
        notes: 'Notas',
        save: 'Guardar',
        new_plan: 'Nuevo plan de episodio',
        status: 'Estado',
        date: 'Fecha',
        outline: 'Guion / puntos clave',
        resources: 'Enlaces (separados por coma)',
        recording_link: 'Enlace a la grabación',
        idea: 'Idea',
        planned: 'Planificado',
        recorded: 'Grabado',
        published: 'Publicado',
      }
    : {
        title: 'Podcast tools',
        guests: 'Guests',
        episodes: 'Episode planner',
        new_guest: 'New guest',
        name: 'Name',
        email: 'Email',
        instagram: 'Instagram',
        expertise: 'Expertise',
        notes: 'Notes',
        save: 'Save',
        new_plan: 'New episode plan',
        status: 'Status',
        date: 'Date',
        outline: 'Outline / talking points',
        resources: 'Links (comma separated)',
        recording_link: 'Recording link',
        idea: 'Idea',
        planned: 'Planned',
        recorded: 'Recorded',
        published: 'Published',
      };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white pt-32 px-4 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-iconic-pink to-iconic-blue flex items-center justify-center text-white shadow-md">
              <CalendarDays size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-iconic-black">{t.title}</h1>
              <p className="text-gray-800 text-sm">Lightweight workspace to plan episodes and manage guests.</p>
            </div>
          </div>
          <div className="text-gray-500 text-sm">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-32 px-4 pb-12 relative">
      {/* Solid white overlay to kill any global gradients/overlays */}
      <div className="fixed inset-0 bg-white pointer-events-none -z-10" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-iconic-pink to-iconic-blue flex items-center justify-center text-white shadow-md">
            <CalendarDays size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-iconic-black">{t.title}</h1>
            <p className="text-gray-800 text-sm">Lightweight workspace to plan episodes and manage guests.</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-300 p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Guests column */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-500 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="flex items-center gap-2 font-semibold text-iconic-black">
                  <UserPlus size={18} /> {t.guests}
                </h2>
              </div>

              <form onSubmit={handleSaveGuest} className="space-y-2 mb-4">
                <input
                  className="w-full px-3 py-2 border border-gray-500 rounded-lg text-sm bg-white text-gray-900 placeholder-gray-400"
                  placeholder={t.name}
                  value={guestForm.full_name || ''}
                  onChange={(e) => setGuestForm({ ...guestForm, full_name: e.target.value })}
                />
                <input
                  className="w-full px-3 py-2 border border-gray-500 rounded-lg text-sm bg-white text-gray-900 placeholder-gray-400"
                  placeholder={t.email}
                  value={guestForm.email || ''}
                  onChange={(e) => setGuestForm({ ...guestForm, email: e.target.value })}
                />
                <input
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder={t.instagram}
                  value={guestForm.instagram_handle || ''}
                  onChange={(e) => setGuestForm({ ...guestForm, instagram_handle: e.target.value })}
                />
                <input
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder={t.expertise}
                  value={guestForm.expertise || ''}
                  onChange={(e) => setGuestForm({ ...guestForm, expertise: e.target.value })}
                />
                <textarea
                  className="w-full px-3 py-2 border border-gray-500 rounded-lg text-sm resize-none bg-white text-gray-900 placeholder-gray-400"
                  rows={2}
                  placeholder={t.notes}
                  value={guestForm.notes || ''}
                  onChange={(e) => setGuestForm({ ...guestForm, notes: e.target.value })}
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-iconic-pink text-white text-xs font-semibold hover:bg-pink-600"
                >
                  <Plus size={14} /> {t.save}
                </button>
              </form>

              <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
                {guests.map((g) => (
                  <div
                    key={g.id}
                    className="flex items-start justify-between gap-2 border border-gray-400 rounded-xl px-3 py-2 text-xs bg-white"
                  >
                    <div>
                      <Link
                        to={`/crm/podcast-tools/guests/${g.id}`}
                        className="font-semibold text-iconic-black hover:text-iconic-pink"
                      >
                        {g.full_name}
                      </Link>
                      {g.expertise && <div className="text-gray-700">{g.expertise}</div>}
                      {g.email && <div className="text-gray-700">{g.email}</div>}
                      {g.instagram_handle && <div className="text-gray-600">@{g.instagram_handle}</div>}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <button
                        type="button"
                        onClick={() => handleEditGuest(g)}
                        className="text-gray-500 hover:text-iconic-blue"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await deleteGuest(g.id);
                          const { data: gg } = await getGuests();
                          setGuests(gg || []);
                        }}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Episode planner column */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-400 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="flex items-center gap-2 font-semibold text-iconic-black">
                  <FileText size={18} /> {t.episodes}
                </h2>
              </div>

              <form onSubmit={handleSavePlan} className="space-y-2 mb-4">
                <input
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder={t.new_plan}
                  value={planForm.title || ''}
                  onChange={(e) => setPlanForm({ ...planForm, title: e.target.value })}
                />
                <div className="flex gap-2">
                  <select
                    className="w-1/2 px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white text-gray-900"
                    value={planForm.status || 'idea'}
                    onChange={(e) => setPlanForm({ ...planForm, status: e.target.value as EpisodePlanStatus })}
                  >
                    <option value="idea">{t.idea}</option>
                    <option value="planned">{t.planned}</option>
                    <option value="recorded">{t.recorded}</option>
                    <option value="published">{t.published}</option>
                  </select>
                  <input
                    type="date"
                    className="w-1/2 px-3 py-2 border border-gray-500 rounded-lg text-sm bg-white text-gray-900"
                    value={planForm.planned_date || ''}
                    onChange={(e) => setPlanForm({ ...planForm, planned_date: e.target.value })}
                  />
                </div>
                <input
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder={t.recording_link}
                  value={planForm.recording_link || ''}
                  onChange={(e) => setPlanForm({ ...planForm, recording_link: e.target.value })}
                />
                <textarea
                  className="w-full px-3 py-2 border border-gray-500 rounded-lg text-sm resize-none bg-white text-gray-900 placeholder-gray-400"
                  rows={3}
                  placeholder={t.outline}
                  value={planForm.outline || ''}
                  onChange={(e) => setPlanForm({ ...planForm, outline: e.target.value })}
                />
                <textarea
                  className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
                  rows={2}
                  placeholder={t.resources}
                  value={(planForm.resources || []).map(r => r.label + '|' + r.url).join(', ')}
                  onChange={(e) => {
                    const parts = e.target.value.split(',').map(p => p.trim()).filter(Boolean);
                    const resources = parts.map(part => {
                      const [label, url] = part.split('|');
                      return { label: label || url, url: url || label };
                    });
                    setPlanForm({ ...planForm, resources });
                  }}
                />
                <textarea
                  className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
                  rows={2}
                  placeholder={t.notes}
                  value={planForm.notes || ''}
                  onChange={(e) => setPlanForm({ ...planForm, notes: e.target.value })}
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-iconic-pink text-white text-xs font-semibold hover:bg-pink-600"
                >
                  <Plus size={14} /> {t.save}
                </button>
              </form>

              <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
                {plans.map((p) => (
                  <div
                    key={p.id}
                    className="border border-gray-400 rounded-xl px-3 py-2 text-xs flex items-start justify-between gap-2 bg-white"
                  >
                    <div>
                      <Link
                        to={`/crm/podcast-tools/episodes/${p.id}`}
                        className="font-semibold text-iconic-black hover:text-iconic-pink"
                      >
                        {p.title}
                      </Link>
                      <div className="text-gray-700 flex gap-2">
                        <span>{t.status}: {p.status}</span>
                        {p.planned_date && <span>{t.date}: {p.planned_date}</span>}
                      </div>
                      {p.outline && <div className="text-gray-800 mt-1 line-clamp-2">{p.outline}</div>}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <button
                        type="button"
                        onClick={() => handleEditPlan(p)}
                        className="text-gray-400 hover:text-iconic-blue"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await deleteEpisodePlan(p.id);
                          const { data: pp } = await getEpisodePlans();
                          setPlans(pp || []);
                        }}
                        className="text-gray-300 hover:text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PodcastToolsPage;
