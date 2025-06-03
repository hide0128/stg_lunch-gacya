
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { AiRestaurant, WebChunk, SearchCriteria } from '../../types'; // パスはプロジェクトルートからの相対パス
import { API_MODEL_NAME } from '../../constants'; // パスはプロジェクトルートからの相対パス
import type { PagesFunction } from '@cloudflare/workers-types';

interface Env {
  API_KEY: string;
  // 他の環境変数もここに追加できます
}

// constructPrompt: types.ts と constants.ts からのインポートは不要、直接ここに記述
const constructPrompt = (criteria: SearchCriteria): string => {
  const { station, genre, keywords, isReGacha } = criteria;

  let reGachaInstructions = "";
  if (isReGacha) {
    reGachaInstructions = `

# 再検索に関する【最重要】指示
これはユーザーによる「別のお店をガチャる！」操作（再検索）です。
**前回提案したお店とは異なる、完全に新しいお店を絶対に提案してください。** ユーザーは前回とは全く違う選択肢と、驚きのある新しい発見を強く期待しています。
前回提案されたお店のリストを内部的に記憶し、それらとは明確に区別されるお店を選んでください。
もし初回の検索戦略で前回と似たようなお店しか見つからない場合は、**検索戦略を積極的に変更してください。** 例えば、以下のような工夫を試みてください:
    - 検索キーワードに「隠れた名店」「地元民おすすめ」「最近オープン」「ユニークな雰囲気」「高評価」などの修飾語を加えてみる。
    - 指定されたジャンルが広範な場合（例：「洋食」）、より具体的なサブジャンル（例：「オムライス専門店」「ハンバーグ専門店」「パスタ」）や、近接する別のジャンルを試すことを検討する。
    - 検索範囲を微調整する（ただし、指定された最寄り駅の近隣であることは厳守する）。
    - 評価の観点を変える（例：コストパフォーマンス重視、特定の料理が評判、静かな雰囲気など）。
**いかなる場合も、前回提案したお店や酷似したお店を再度提案することは固く禁じます。** ユーザー体験の質を高めるため、多様性に富んだ提案をすることがあなたの最優先事項の一つです。
`;
  }

  return `あなたはランチのレストランを提案するAIアシスタントです。ユーザーから指定された「最寄り駅」周辺のレストランを、Google検索を駆使して探し出し、最大3軒まで提案してください。
提案する情報は**全てGoogle検索結果から得られた最新かつ正確な情報**に基づいてください。特に、レストランの名称、住所、アクセス情報が指定された「最寄り駅」（${station}）と地理的に明確に関連していることを慎重に確認してください。提案するレストランの住所とアクセス情報が、指定された「最寄り駅」（${station}）の**ごく近隣**に位置することを、**複数の情報源で照合・確認**してください。明らかに駅と関連のない場所のレストランは絶対に含めないでください。
**提案するレストランは、ユーザーがランチに訪れたくなるような、魅力的で評価の良い選択肢であるよう努めてください。これはGoogle検索で見つかる情報（レビューの要約、紹介文、写真など）に基づいて判断してください。**
${reGachaInstructions}
# 必須条件
- **最寄り駅**: ${station} (この駅の周辺の店舗のみを提案してください。提案するレストランの住所やアクセス情報が、この駅と地理的に一致することをGoogle検索結果から極めて慎重に検証してください。)
- **情報源**: Google検索結果。各レストランの情報（名称、説明、ジャンル、アクセス、予算、住所）は、検索で見つかった具体的なウェブページの内容を正確に反映し、**Google検索等で確認した具体的な情報のみを記述してください。曖昧な表現や一般的な記述は避け、店舗固有の情報を優先してください**。AIの一般的な知識や推測で情報を補完しないでください。**提案するレストランの各情報は、あなたが参照したウェブページの内容と完全に一致している必要があります。あなたの一般的な知識や、検索結果から直接読み取れない推測で情報を補完しないでください。**
- **レストランの存在確認**: 提案するレストランが現在も営業していることを確認してください。古い情報や閉業した店舗は提案しないでください。

# 任意条件
- ジャンル: ${genre && genre !== "特に指定なし" ? genre : "指定なし (多様なジャンルを考慮)"}
- キーワード・気分: ${keywords && keywords.trim() !== "" ? keywords : "指定なし"}

# 出力形式
以下のJSON形式で、レストランの配列として回答してください。あなたの応答は、このJSON配列**そのもの**でなければなりません。JSONデータの前後に、いかなる挨拶、説明、注釈、空白行なども含めないでください。JSONデータ内の文字列値にも、会話的な表現（例：「ええと、このお店は…」）は含めず、直接的で客観的な情報を記述してください。
各レストランオブジェクトには、以下のキーを必ず含めてください。
- name: string (レストランの正式名称。検索結果と完全に一致させてください。)
- description: string (レストランの簡単な説明。検索結果に基づき、具体的かつ魅力的に、日本語で100文字程度で記述してください。)
- genre: string (料理ジャンル。例: イタリアン, 和食。検索結果から特定してください。)
- access: string (指定された最寄り駅「${station}」からの具体的なアクセス情報。例: 「${station}から徒歩5分」。検索結果に基づいてください。)
- budget: string (おおよそのランチ予算。例: 「¥1,000～¥1,999」。検索結果から特定してください。)
- address: string (レストランの正確な住所。検索結果に基づいてください。この住所が「${station}」周辺であることを確認してください。)
- url: string (レストランの公式ウェブサイトまたは主要なグルメサイトの店舗個別ページのURL。見つかれば記載し、適切なものが見つからなければ空文字列 "" としてください。このURLの検証は以前ほど厳格ではありませんが、可能な限り正確なものを目指してください。)

例 (あくまで形式の例であり、内容は検索結果に応じて具体的に記述してください):
\`\`\`json
[
  {
    "name": "AIビストロ東京",
    "description": "最新技術を駆使した創作料理が楽しめる。ランチは特に人気。",
    "genre": "創作料理",
    "access": "${station}から徒歩5分",
    "budget": "ランチ ¥1,500～¥2,500",
    "address": "東京都AI区検索町1-1-1 AIビル1F",
    "url": "https://www.example.com/ai-bistro-tokyo-specific-branch"
  },
  {
    "name": "駅前カフェ・プロンプト",
    "description": "こだわりのコーヒーと軽食を提供。待ち合わせにも便利。",
    "genre": "カフェ",
    "access": "${station}から徒歩1分",
    "budget": "ランチ ¥800～¥1,200",
    "address": "東京都AI区${station}駅前ビルディング 2F",
    "url": ""
  }
]
\`\`\`

# 注意事項 (再掲)
- 上記JSON形式に厳密に従って回答してください。
- **あなたの応答は、指示されたJSON配列そのものでなければなりません。JSONデータの前後に、いかなる挨拶、説明、注釈、空白行なども含めないでください。**
- **全ての情報は、Google検索結果から得られた具体的な内容に基づいてください。不確かな情報や推測に基づく情報は含めないでください。**
- 提案する各レストランの情報（特に住所やアクセス情報）が、指定された「最寄り駅」(${station})と地理的に一致することをGoogle検索結果から慎重に確認してください。
- 条件に合うレストランが見つからない場合は、空の配列 \`[]\` を返してください。**その際、他のテキストは一切含めないでください。**
`;
};

// isValidRestaurantItem: types.ts からのインポートは不要、直接ここに記述
const isValidRestaurantItem = (item: any): item is Partial<AiRestaurant> => {
  if (!item || typeof item !== 'object') return false;
  
  if (typeof item.name !== 'string' || !item.name.trim()) return false;
  if (typeof item.address !== 'string' || !item.address.trim()) return false;

  if (typeof item.url !== 'string') return false;
  if (item.url.trim() !== "") {
    if (!(item.url.startsWith('http://') || item.url.startsWith('https://'))) return false;
    if (item.url === 'http://' || item.url === 'https://') return false;
  }
  return true;
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const apiKey = context.env.API_KEY;
    if (!apiKey) {
      console.error("API_KEY is not configured in Cloudflare Function environment variables.");
      return new Response(JSON.stringify({ error: "サーバー側のAPIキー設定に問題があります。" }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const criteria: SearchCriteria = await context.request.json();
    
    if (!criteria || typeof criteria.station !== 'string' || criteria.station.trim() === '') {
        return new Response(JSON.stringify({ error: "無効な検索条件です。駅情報が必須です。" }), {
            status: 400, // Bad Request
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const prompt = constructPrompt(criteria);

    const geminiResponse: GenerateContentResponse = await ai.models.generateContent({
      model: API_MODEL_NAME,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 0 }, // 思考時間を最小限に設定
      },
    });
    
    let jsonStr = geminiResponse.text;
    const fenceRegex = /```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/;
    const match = jsonStr.match(fenceRegex);

    if (match && match[1]) {
      jsonStr = match[1].trim();
    } else {
      jsonStr = jsonStr.trim();
      if (!((jsonStr.startsWith("[") && jsonStr.endsWith("]")) || (jsonStr.startsWith("{") && jsonStr.endsWith("}")))) {
         console.warn("Function: JSON fence ```json ... ``` not found and response doesn't look like a JSON array/object. Full response:", geminiResponse.text);
      }
    }
    
    let parsedData: any;
    try {
      parsedData = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Function: Failed to parse JSON response after fence removal:", e);
      console.error("Function: Original JSON string:", jsonStr);
      console.error("Function: Full AI response text:", geminiResponse.text);
      return new Response(JSON.stringify({ error: `AIからの応答を解析できませんでした。JSON形式が正しくない可能性があります。詳細: ${e.message}` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!Array.isArray(parsedData)) {
      console.warn("Function: Parsed data is not an array, attempting to use as single object array if valid:", parsedData);
      if (isValidRestaurantItem(parsedData)) {
        parsedData = [parsedData];
      } else {
        return new Response(JSON.stringify({ error: "AIからの応答が期待されるレストラン情報の配列形式ではありません。" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    const validRestaurants: AiRestaurant[] = [];
    for (const item of parsedData) {
      if (isValidRestaurantItem(item)) {
        validRestaurants.push({
          name: item.name || "名称不明", // isValidRestaurantItemでnameは必須なので、ここはitem.nameで良い
          description: typeof item.description === 'string' ? item.description : "情報なし",
          genre: typeof item.genre === 'string' ? item.genre : "情報なし",
          access: typeof item.access === 'string' ? item.access : "情報なし",
          budget: typeof item.budget === 'string' ? item.budget : "情報なし",
          address: item.address || "住所不明", // isValidRestaurantItemでaddressは必須
          url: item.url || "",
        });
      } else {
        console.warn("Function: Invalid restaurant item received from AI, skipping:", item);
      }
    }
    
    const sources: WebChunk[] = [];
    const sdkGroundingChunks = geminiResponse.candidates?.[0]?.groundingMetadata?.groundingChunks;

    if (sdkGroundingChunks) {
        sdkGroundingChunks.forEach(sdkChunk => {
            if (sdkChunk.web && typeof sdkChunk.web.uri === 'string' && sdkChunk.web.uri.trim() !== '') {
                const uri = sdkChunk.web.uri;
                const title = (typeof sdkChunk.web.title === 'string' && sdkChunk.web.title.trim() !== '') 
                              ? sdkChunk.web.title 
                              : uri;
                sources.push({ uri, title });
            }
        });
    }
    
    const finalRestaurants = validRestaurants.filter(r => r.name !== "名称不明" && r.address !== "住所不明");

    if (finalRestaurants.length === 0 && parsedData.length > 0) {
        console.warn("Function: AI returned data, but none were valid restaurants after processing:", parsedData);
    }
    
    return new Response(JSON.stringify({ restaurants: finalRestaurants, sources }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in Cloudflare Function (onRequestPost):", error);
    const errorMessage = error instanceof Error ? error.message : "サーバー関数で不明なエラーが発生しました。";
    return new Response(JSON.stringify({ error: `サーバー関数エラー: ${errorMessage}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
