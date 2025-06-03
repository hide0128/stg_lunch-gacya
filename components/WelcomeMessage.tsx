
import React from 'react';
import { APP_TITLE } from '../constants';

const WelcomeMessage: React.FC = () => {
  return (
    <div className="my-8 p-6 bg-sky-50 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-700 rounded-lg text-center shadow">
      <h2 className="text-2xl font-semibold text-sky-700 dark:text-sky-300 mb-3">ようこそ {APP_TITLE} へ！</h2>
      <p className="text-slate-600 dark:text-slate-400 mb-1">
        「今日のランチ、どこにしようかな？」と悩んだときに、あなたにピッタリのお店を偶然見つけてくれるアプリです。
      </p>
      <p className="text-slate-600 dark:text-slate-400">
        上のフォームに条件を入力して、「お店をガチャる！」ボタンを押してみてください！
      </p>
    </div>
  );
};

export default WelcomeMessage;
