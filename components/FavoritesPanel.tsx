
import React from 'react';
import { Restaurant } from '../types';
import RestaurantCard from './RestaurantCard';

interface FavoritesPanelProps {
  favorites: Restaurant[];
  onToggleFavorite: (restaurant: Restaurant) => void;
  onClose: () => void;
  isOpen: boolean;
}

const FavoritesPanel: React.FC<FavoritesPanelProps> = ({ favorites, onToggleFavorite, onClose, isOpen }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex justify-end"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md h-full bg-white dark:bg-slate-800 shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside panel
        style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
      >
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">お気に入りのお店</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
            aria-label="閉じる"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {favorites.length === 0 ? (
          <div className="flex-grow flex items-center justify-center">
            <p className="text-slate-500 dark:text-slate-400">お気に入りのお店はありません。</p>
          </div>
        ) : (
          <div className="flex-grow overflow-y-auto p-5 space-y-4">
            {favorites.map((resto) => (
              <RestaurantCard
                key={resto.id}
                restaurant={resto}
                isFavorite={true} // Always true in favorites panel
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPanel;
