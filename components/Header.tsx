
import React from 'react';
import { APP_TITLE } from '../constants';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';
import HeartIcon from './icons/HeartIcon';

interface HeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onToggleFavorites: () => void;
  favoritesCount: number;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, onToggleDarkMode, onToggleFavorites, favoritesCount }) => {
  return (
    <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-sky-600 dark:text-sky-400">{APP_TITLE}</h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleFavorites}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-rose-500 dark:text-rose-400 relative"
            aria-label="お気に入り"
          >
            <HeartIcon className="w-6 h-6" />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {favoritesCount}
              </span>
            )}
          </button>
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-yellow-500 dark:text-yellow-400"
            aria-label={isDarkMode ? "ライトモードに切り替え" : "ダークモードに切り替え"}
          >
            {isDarkMode ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
