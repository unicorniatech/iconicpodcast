import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getPublishedFaqs, FAQItem } from '../services/faqService';
import { SEOHead } from '../components';

export const FAQPage: React.FC = () => {
  const { lang, t } = useLanguage();
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    getPublishedFaqs(lang).then(({ data }) => {
      if (isMounted && data) setFaqs(data);
    }).finally(() => {
      if (isMounted) setIsLoading(false);
    });
    return () => { isMounted = false; };
  }, [lang]);

  const pageTitle =
    lang === 'cs-CZ'
      ? 'Často kladené otázky'
      : lang === 'es-MX'
      ? 'Preguntas frecuentes'
      : 'Frequently Asked Questions';

  const emptyText =
    lang === 'cs-CZ'
      ? 'FAQ budou brzy doplněny.'
      : lang === 'es-MX'
      ? 'Pronto añadiremos preguntas frecuentes.'
      : 'FAQs will be added soon.';

  return (
    <div className="pt-24 pb-20 min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <SEOHead title={pageTitle} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-10 sm:mb-12 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black text-iconic-black mb-3">
            {pageTitle}
          </h1>
        </header>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-gray-200 bg-white/70 p-4 h-16"
              />
            ))}
          </div>
        ) : faqs.length === 0 ? (
          <p className="text-center text-gray-500 text-sm mt-8">{emptyText}</p>
        ) : (
          <div className="space-y-3">
            {faqs.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <button
                  key={faq.id}
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full text-left rounded-2xl border border-gray-200 bg-white/90 px-4 sm:px-5 py-3 sm:py-4 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-iconic-black">
                        {faq.question}
                      </p>
                      {faq.category && (
                        <span className="mt-1 inline-block text-[10px] font-bold uppercase tracking-wide text-gray-400">
                          {faq.category}
                        </span>
                      )}
                    </div>
                    <ChevronDown
                      size={18}
                      className={`flex-shrink-0 text-gray-400 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                  {isOpen && (
                    <div className="mt-3 text-sm text-gray-600 whitespace-pre-line">
                      {faq.answer}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FAQPage;
