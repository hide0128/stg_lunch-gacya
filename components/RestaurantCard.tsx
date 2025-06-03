import React from 'react';
import { Restaurant } from '../types';
import StarIcon from './icons/StarIcon';

interface RestaurantCardProps {
  restaurant: Restaurant;
  isFavorite: boolean;
  onToggleFavorite: (restaurant: Restaurant) => void;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, isFavorite, onToggleFavorite }) => {
  const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(restaurant.name + " " + restaurant.address)}`;

  return (
    <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col">
      <div className="p-5 flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold text-sky-700 dark:text-sky-400">{restaurant.name}</h3>
          <button 
            onClick={() => onToggleFavorite(restaurant)} 
            className={`p-1.5 rounded-full text-yellow-500 hover:bg-yellow-100 dark:hover:bg-slate-700 
                        ${isFavorite ? 'text-yellow-400 dark:text-yellow-300' : 'text-slate-400 dark:text-slate-500'}`}
            aria-label={isFavorite ? "お気に入りから外す" : "お気に入りに追加"}
          >
            <StarIcon className="w-6 h-6" isFilled={isFavorite} />
          </button>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 h-16 overflow-y-auto">{restaurant.description}</p>
        
        <div className="space-y-1 text-sm mb-3">
          <p><span className="font-semibold">ジャンル:</span> {restaurant.genre}</p>
          <p><span className="font-semibold">アクセス:</span> {restaurant.access}</p>
          <p><span className="font-semibold">予算:</span> {restaurant.budget}</p>
          <p><span className="font-semibold">住所:</span> {restaurant.address}</p>
        </div>
      </div>
      <div className="px-5 py-3 bg-slate-50 dark:bg-slate-700/50">
        {restaurant.name ? (
          <a
            href={googleSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center px-4 py-2 border border-sky-600 dark:border-sky-500 text-sky-600 dark:text-sky-400 rounded-md hover:bg-sky-50 dark:hover:bg-sky-700/50 font-medium transition-colors"
          >
            お店の情報をGoogleで検索
          </a>
        ) : (
          <button
            disabled
            className="block w-full text-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500 rounded-md font-medium cursor-not-allowed"
            aria-label="店舗名不明のため検索不可"
          >
            店舗名不明のため検索不可
          </button>
        )}
      </div>
    </div>
  );
};

export default RestaurantCard;