import React from 'react';
import { Restaurant, WebChunk, SearchCriteria } from '../types';
import RestaurantCard from './RestaurantCard';
import RefreshIcon from './icons/RefreshIcon';

interface RestaurantListProps {
  restaurants: Restaurant[];
  sources: WebChunk[];
  onToggleFavorite: (restaurant: Restaurant) => void;
  isFavorite: (restaurantId: string) => boolean;
  onReGacha: () => void;
  isLoading: boolean;
  searchCriteriaUsed?: SearchCriteria;
}

const RestaurantList: React.FC<RestaurantListProps> = ({ restaurants, sources, onToggleFavorite, isFavorite, onReGacha, isLoading, searchCriteriaUsed }) => {
  if (restaurants.length === 0) {
    return null; // No results specific message handled in App.tsx
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-2 text-slate-800 dark:text-slate-200">お店の提案</h2>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
        AIがあなたの条件にピッタリのお店を見つけてきました！
        {searchCriteriaUsed && `（検索条件: ${searchCriteriaUsed.station} / ${searchCriteriaUsed.genre} / ${searchCriteriaUsed.keywords || 'なし'}）`}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((resto) => (
          <RestaurantCard
            key={resto.id}
            restaurant={resto}
            isFavorite={isFavorite(resto.id)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
      
      {restaurants.length > 0 && (
        <div className="mt-8 text-center">
          <button
            onClick={onReGacha}
            disabled={isLoading}
            className="px-6 py-3.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:bg-green-500 dark:hover:bg-green-600 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-150 flex items-center justify-center mx-auto"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                検索中...
              </>
            ) : (
              <>
                <RefreshIcon className="w-5 h-5 mr-2" />
                別のお店をガチャる！
              </>
            )}
          </button>
        </div>
      )}

      {sources.length > 0 && (
        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">情報源</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {sources.map((source, index) => (
              <li key={index} className="text-slate-600 dark:text-slate-400">
                <a
                  href={source.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-600 dark:text-sky-400 hover:underline"
                  title={source.title}
                >
                  {source.title || source.uri}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RestaurantList;