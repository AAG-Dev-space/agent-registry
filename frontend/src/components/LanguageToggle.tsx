import { useLanguage } from '../contexts/LanguageContext';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => setLanguage('ko')}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
          language === 'ko'
            ? 'bg-white text-brand-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        한국어
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
          language === 'en'
            ? 'bg-white text-brand-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        English
      </button>
    </div>
  );
}
