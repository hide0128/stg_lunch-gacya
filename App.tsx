
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import SearchForm from './components/SearchForm';
import RestaurantList from './components/RestaurantList';
import FavoritesPanel from './components/FavoritesPanel';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import WelcomeMessage from './components/WelcomeMessage';
import { Restaurant, WebChunk, SearchCriteria, AiRestaurant } from './types';
import { fetchRestaurants } from './services/geminiService';
import { LOCAL_STORAGE_DARK_MODE_KEY, LOCAL_STORAGE_FAVORITES_KEY } from './constants';

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const storedDarkMode = localStorage.getItem(LOCAL_STORAGE_DARK_MODE_KEY);
    return storedDarkMode ? JSON.parse(storedDarkMode) : 
           (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const [searchResults, setSearchResults] = useState<Restaurant[]>([]);
  const [sourceUrls, setSourceUrls] = useState<WebChunk[]>([]);
  const [favorites, setFavorites] = useState<Restaurant[]>(() => {
    const storedFavorites = localStorage.getItem(LOCAL_STORAGE_FAVORITES_KEY);
    return storedFavorites ? JSON.parse(storedFavorites) : [];
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState<boolean>(true);
  const [showFavoritesPanel, setShowFavoritesPanel] = useState<boolean>(false);
  const [currentSearchCriteria, setCurrentSearchCriteria] = useState<SearchCriteria | undefined>(undefined);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(LOCAL_STORAGE_DARK_MODE_KEY, JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const handleSearch = useCallback(async (criteria: SearchCriteria, isReGacha: boolean = false) => {
    setIsLoading(true);
    setError(null);
    setShowWelcome(false);
    
    const searchCriteriaWithReGacha: SearchCriteria = { ...criteria, isReGacha };
    setCurrentSearchCriteria(criteria); // Store base criteria for re-gacha without the isReGacha flag itself for multiple re-gachas
    setSearchResults([]); 
    setSourceUrls([]);

    try {
      // Pass the potentially modified criteria (with isReGacha) to fetchRestaurants
      const { restaurants: aiRestaurants, sources } = await fetchRestaurants(searchCriteriaWithReGacha);
      const restaurantsWithIds: Restaurant[] = aiRestaurants.map((resto: AiRestaurant) => ({
        ...resto,
        id: crypto.randomUUID(), 
      }));
      setSearchResults(restaurantsWithIds);
      setSourceUrls(sources);
      if (restaurantsWithIds.length === 0 && !error) { 
        setError("条件に合うお店が見つかりませんでした。AIがお店を見つけられなかったか、情報が不正確だった可能性があります。条件を変えて試してみてください。");
      }
    } catch (err) {
      if (err instanceof Error) {
         if (err.message.includes("AIからの応答を解析できませんでした") || err.message.includes("AIがお店を見つけられなかった")) {
           setError("AIからの情報取得に失敗しました。駅名やキーワードを少し変えて再試行するか、時間をおいてお試しください。 詳細: " + err.message);
         } else {
           setError(err.message);
         }
      } else {
        setError("不明なエラーが発生しました。");
      }
      setSearchResults([]);
      setSourceUrls([]);
    } finally {
      setIsLoading(false);
    }
  }, [error]); 

  const handleReGacha = useCallback(() => {
    if (currentSearchCriteria) {
      handleSearch(currentSearchCriteria, true); // Pass true for isReGacha
    }
  }, [currentSearchCriteria, handleSearch]);

  const toggleFavorite = useCallback((restaurant: Restaurant) => {
    setFavorites(prevFavorites => {
      const isFavorited = prevFavorites.find(fav => fav.id === restaurant.id);
      if (isFavorited) {
        return prevFavorites.filter(fav => fav.id !== restaurant.id);
      } else {
        return [...prevFavorites, restaurant];
      }
    });
  }, []);

  const isRestaurantFavorite = useCallback((restaurantId: string): boolean => {
    return favorites.some(fav => fav.id === restaurantId);
  }, [favorites]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);
  const toggleFavoritesPanel = () => setShowFavoritesPanel(prev => !prev);

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onToggleFavorites={toggleFavoritesPanel}
        favoritesCount={favorites.length}
      />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <SearchForm 
          onSearch={(criteria) => handleSearch(criteria, false)} // Standard search is not a re-gacha
          isSearching={isLoading}
          initialCriteria={currentSearchCriteria} 
        />
        
        {isLoading && <LoadingSpinner />}
        
        {error && !isLoading && <ErrorMessage message={error} onRetry={currentSearchCriteria ? handleReGacha : undefined} />}

        {!isLoading && !error && searchResults.length > 0 && (
          <RestaurantList
            restaurants={searchResults}
            sources={sourceUrls}
            onToggleFavorite={toggleFavorite}
            isFavorite={isRestaurantFavorite}
            onReGacha={handleReGacha}
            isLoading={isLoading} 
            searchCriteriaUsed={currentSearchCriteria}
          />
        )}
        
        {!isLoading && !error && searchResults.length === 0 && !showWelcome && (
          <div className="mt-8 text-center text-slate-600 dark:text-slate-400 p-4 border border-slate-300 dark:border-slate-700 rounded-md">
            <p className="font-semibold">検索結果はありませんでした。</p>
            <p className="text-sm mt-1">AIが指定された条件に合うお店を見つけられなかったか、提供された情報が有効でありませんでした。</p>
            {currentSearchCriteria && <p className="text-sm mt-1">検索条件: {currentSearchCriteria.station} / {currentSearchCriteria.genre} / {currentSearchCriteria.keywords || '指定なし'}</p>}
            <p className="mt-2">駅名やジャンル、キーワードを変更して再度検索するか、「別のお店をガチャる！」ボタンで同じ条件で再検索してみてください。</p>
            {currentSearchCriteria && (
              <button
                onClick={handleReGacha}
                className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
              >
                別のお店をガチャる！
              </button>
            )}
          </div>
        )}

        {showWelcome && !isLoading && searchResults.length === 0 && !error && (
          <WelcomeMessage />
        )}
      </main>
      <FavoritesPanel
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        onClose={() => setShowFavoritesPanel(false)}
        isOpen={showFavoritesPanel}
      />
       <footer className="py-4 text-center text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700">
        &copy; {new Date().getFullYear()} らんちガチャ. All rights reserved.
      </footer>
    </div>
  );
};

export default App;
