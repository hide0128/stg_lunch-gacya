
import React, { useState, useEffect } from 'react';
import { GENRE_OPTIONS } from '../constants';
import { SearchCriteria } from '../types';
import SearchIcon from './icons/SearchIcon';

interface SearchFormProps {
  onSearch: (criteria: SearchCriteria) => void;
  isSearching: boolean;
  initialCriteria?: SearchCriteria;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isSearching, initialCriteria }) => {
  const [station, setStation] = useState(initialCriteria?.station || '');
  const [selectedGenre, setSelectedGenre] = useState(initialCriteria?.genre || GENRE_OPTIONS[0]);
  const [keywords, setKeywords] = useState(initialCriteria?.keywords || '');
  const [stationError, setStationError] = useState('');

  useEffect(() => {
    if (initialCriteria) {
      setStation(initialCriteria.station);
      setSelectedGenre(initialCriteria.genre);
      setKeywords(initialCriteria.keywords);
    }
  }, [initialCriteria]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!station.trim()) {
      setStationError('最寄り駅は必須です。');
      return;
    }
    setStationError('');
    onSearch({ station, genre: selectedGenre, keywords });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white dark:bg-slate-800 shadow-lg rounded-lg space-y-6">
      <div>
        <label htmlFor="station" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          最寄り駅 (必須)
        </label>
        <input
          type="text"
          id="station"
          value={station}
          onChange={(e) => {
            setStation(e.target.value);
            if (e.target.value.trim()) setStationError('');
          }}
          placeholder="例: 東京駅, 渋谷駅 西口"
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:text-slate-50"
        />
        {stationError && <p className="text-sm text-red-500 mt-1">{stationError}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          料理ジャンル
        </label>
        <div className="flex flex-wrap gap-2">
          {GENRE_OPTIONS.map((genre) => (
            <button
              type="button"
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-3 py-1.5 text-sm rounded-full border transition-colors duration-150
                ${selectedGenre === genre 
                  ? 'bg-sky-600 text-white border-sky-600 dark:bg-sky-500 dark:border-sky-500' 
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-sky-100 dark:hover:bg-slate-600'
                }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="keywords" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          気分・キーワード (お好みで)
        </label>
        <input
          type="text"
          id="keywords"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="例: 個室あり, おしゃれな雰囲気, 子連れOK"
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:text-slate-50"
        />
      </div>

      <button
        type="submit"
        disabled={isSearching}
        className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:bg-sky-500 dark:hover:bg-sky-600 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-150"
      >
        {isSearching ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            検索中...
          </>
        ) : (
          <>
            <SearchIcon className="w-5 h-5 mr-2" />
            お店をガチャる！
          </>
        )}
      </button>
    </form>
  );
};

export default SearchForm;
