# 🔥 マイページ機能 実装手順

## 📁 受け取ったファイル

| ファイル | 説明 |
|---------|------|
| `mypage.html` | マイページ本体（新規追加） |
| `index_patched.html` | トップページ（ヘッダーにマイページアイコンを追加済み） |

---

## STEP 1｜Firebase プロジェクトを作成

1. https://console.firebase.google.com にアクセス
2. 「プロジェクトを追加」→ 任意の名前で作成
3. **Authentication** を有効化
   - 「始める」→「ログイン方法」タブ
   - ✅ メール/パスワード を有効化
   - ✅ Google を有効化（任意）
4. **Firestore Database** を有効化
   - 「データベースの作成」→ 「本番環境モードで開始」でOK
   - リージョン：`asia-northeast1`（東京）推奨

---

## STEP 2｜Firebaseの設定値を取得してコピー

1. Firebase コンソール → プロジェクト設定 ⚙
2. 「マイアプリ」→「ウェブ」アイコンでアプリ登録
3. 表示される設定値をコピー：

```javascript
const firebaseConfig = {
  apiKey:            "AIzaSy...",
  authDomain:        "your-project.firebaseapp.com",
  projectId:         "your-project",
  storageBucket:     "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123:web:abc..."
};
```

4. **この設定値を以下の2箇所に貼り付けてください：**
   - `mypage.html`     の `YOUR_API_KEY` などのプレースホルダー部分
   - `index_patched.html` の同じプレースホルダー部分（JavaScript末尾）

---

## STEP 3｜Firestoreセキュリティルールを設定

Firebase コンソール → Firestore → 「ルール」タブで以下に変更：

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザー自身のデータのみ読み書き可能
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /history/{historyId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

---

## STEP 4｜ファイルを配置

```
総合サイト/
├── index.html          ← index_patched.html をリネームして差し替え
├── mypage.html         ← 新規追加
├── diagnosis-config.js
├── thinktype/
├── uniquetype/
└── 関係改善ジェネレータ/
```

---

## STEP 5｜各診断ツールに「結果保存」を組み込む

診断が完了したとき（結果画面の表示時）に以下のコードを呼び出すと、
ログインユーザーの履歴に自動保存されます：

### ThinkType の例
```javascript
// 結果表示関数の中に追加
if (window.saveDiagnosisResult) {
  window.saveDiagnosisResult({
    diagnosisId:  'thinktype',
    resultType:   'ビジョナリー型',     // 診断結果のタイプ名
    resultEmoji:  '🌟',
    resultDesc:   'ビジョンを描き、...',  // 結果の説明文
    scores: {
      '外向性': 4,
      '視覚性': 3
    },
    maxScore: 5
  });
}
```

### わらいのツボ診断 の例
```javascript
if (window.saveDiagnosisResult) {
  window.saveDiagnosisResult({
    diagnosisId:  'uniquetype',
    resultType:   'ほっこり共感タイプ',
    resultEmoji:  '🌸',
    resultDesc:   '日常のあるある...',
    scores: {
      'ほっこり': 4,
      'ひらめき': 2,
      'スパイス': 1,
      'カオス': 3
    },
    maxScore: 5
  });
}
```

### ふたりのモヤモヤ整理室 の例
```javascript
if (window.saveDiagnosisResult) {
  window.saveDiagnosisResult({
    diagnosisId: 'relationship',
    resultType:  '会話不足タイプ',
    resultEmoji: '💬',
    resultDesc:  '言葉にできていない...',
  });
}
```

> **ポイント**：`if (window.saveDiagnosisResult)` で囲むことで、
> mypage.html を経由していない（未ログイン）状態でも
> エラーなく動作します。

---

## Firestoreのデータ構造

```
users/
  {uid}/
    username:  "ユーザー名"
    email:     "user@example.com"
    avatar:    "🧪"
    createdAt: Timestamp

    history/
      {historyId}/
        diagnosisId:  "thinktype"
        resultType:   "ビジョナリー型"
        resultEmoji:  "🌟"
        resultDesc:   "説明文..."
        scores:       { 外向性: 4, 視覚性: 3 }
        maxScore:     5
        completedAt:  Timestamp
```

---

## マイページ機能一覧

| 機能 | 内容 |
|------|------|
| ✅ メール/パスワード認証 | 新規登録・ログイン |
| ✅ Googleログイン | ワンクリックログイン |
| ✅ ユーザー名編集 | インライン編集・Firestoreに保存 |
| ✅ アバター選択 | 絵文字20種から選択 |
| ✅ 診断履歴一覧 | 日付順・ジャンルフィルター |
| ✅ 結果詳細展開 | アコーディオンで表示 |
| ✅ 統計バー | 総回数・ジャンル数・最終日・よく使うジャンル |
| ✅ 履歴削除 | 1件ずつ削除可能 |
| ✅ ヘッダーアイコン | ログイン状態を緑ドット＋アバターで表示 |

---

© SHINDAN LAB
