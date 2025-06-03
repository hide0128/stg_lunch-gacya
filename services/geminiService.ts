
import { AiRestaurant, WebChunk, SearchCriteria } from '../types';
// GoogleGenAI と API_MODEL_NAME の直接の import は不要になります。
// API_MODEL_NAME はサーバーサイド関数内で使用されます。

// isValidRestaurantItem と constructPrompt はサーバーサイド関数に移管されました。

export const fetchRestaurants = async (
  criteria: SearchCriteria
): Promise<{ restaurants: AiRestaurant[], sources: WebChunk[] }> => {
  try {
    const response = await fetch('/api/generate-restaurant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(criteria),
    });

    if (!response.ok) {
      let errorData: any = { message: `サーバーエラー: ${response.status}` };
      try {
        errorData = await response.json();
      } catch (e) {
        // JSONパースに失敗した場合でも、ステータステキストを使用
        errorData.message = `サーバーエラー: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorData.error || errorData.message || `サーバーとの通信に失敗しました。`);
    }

    const data = await response.json();
    
    // サーバーサイド関数が整形済みのデータを返すことを期待
    if (!data || !Array.isArray(data.restaurants) || !Array.isArray(data.sources)) {
        console.error("Invalid data structure received from server function:", data);
        throw new Error("サーバーから予期しない形式のデータを受信しました。");
    }
    
    return { 
        restaurants: data.restaurants as AiRestaurant[], 
        sources: data.sources as WebChunk[] 
    };

  } catch (error) {
    console.error("Error fetching or processing restaurants via server function:", error);
    // エラーメッセージをより汎用的に
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("APIキーが設定されていません")) { // これは古いエラーメッセージだが、念のため
        throw new Error("APIキーに関する設定エラーがサーバーで発生しました。");
    }
    throw new Error(`レストラン情報の取得中にエラーが発生しました。サーバーとの通信に問題があった可能性があります。詳細: ${message}`);
  }
};
