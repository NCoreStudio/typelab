/**
 * Firebase共通モジュール - 診断結果保存機能
 * 各診断ツールから saveDiagnosisResult() を呼び出すだけで
 * Firestoreに診断履歴を保存します
 */

// Firebase設定（mypage.htmlと同一値）
const firebaseConfig = {
  apiKey:            "AIzaSyBLuQpm7NASl4kD4FTKPOmHNfuaWT_ydEI",
  authDomain:        "shindanlab-eedc0.firebaseapp.com",
  projectId:         "shindanlab-eedc0",
  storageBucket:     "shindanlab-eedc0.appspot.com",
  messagingSenderId: "946383078896",
  appId:             "1:946383078896:web:09e48c3f75f2d7e8d8c935"
};

// Firebase初期化（多重実行防止）
let db = null;
let auth = null;

console.log('🔥 Firebase SDK available:', typeof firebase !== 'undefined');
console.log('🔥 Firebase apps count:', typeof firebase !== 'undefined' ? firebase.apps.length : 'N/A');

if (typeof firebase !== 'undefined' && !firebase.apps.length) {
  console.log('🔥 Initializing Firebase app...');
  firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  db = firebase.firestore();
  console.log('🔥 Firebase initialized successfully');
} else if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
  console.log('🔥 Using existing Firebase app');
  auth = firebase.auth();
  db = firebase.firestore();
} else {
  console.error('❌ Firebase SDK not loaded');
}

/**
 * 診断結果をFirestoreに保存
 * @param {Object} payload - 診断結果データ
 * @param {string} payload.diagnosisId - 診断ツールID
 * @param {string} payload.diagnosisTitle - 診断ツール名
 * @param {string} payload.resultType - 結果タイプ
 * @param {string} payload.resultEmoji - 結絵文字（空文字可）
 * @param {string} payload.resultDesc - 結果説明（空文字可）
 * @param {Object|null} payload.scores - スコアデータ（null可）
 * @param {number|null} payload.maxScore - 最大スコア（null可）
 * @returns {boolean} - 保存成功時true、未ログイン時false
 */
window.saveDiagnosisResult = async function(payload) {
  console.log('🔥 saveDiagnosisResult called with:', payload);
  
  try {
    // Firebase初期化チェック
    if (!auth || !db) {
      console.error('❌ Firebase not initialized:', { auth: !!auth, db: !!db });
      return false;
    }
    
    // 未ログインの場合は保存しない
    if (!auth.currentUser) {
      console.log('🔐 未ログインのため診断結果を保存しません');
      console.log('🔐 Current auth state:', auth);
      return false;
    }

    const user = auth.currentUser;
    console.log('🔥 Logged in user:', { uid: user.uid, email: user.email, displayName: user.displayName });
    
    // 必須フィールドのチェック
    if (!payload.diagnosisId || !payload.diagnosisTitle || !payload.resultType) {
      console.error('❌ 必須フィールドが不足しています:', payload);
      return false;
    }

    // Firestore保存用データの整形
    const docData = {
      uid: user.uid,
      diagnosisId: payload.diagnosisId,
      diagnosisTitle: payload.diagnosisTitle,
      resultType: payload.resultType,
      resultEmoji: payload.resultEmoji || "",
      resultDesc: payload.resultDesc || "",
      scores: payload.scores || null,
      maxScore: payload.maxScore || null,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    console.log('🔥 Saving to Firestore:', docData);

    // diagnosisHistoryコレクションに保存
    const docRef = await db.collection('diagnosisHistory').add(docData);
    
    console.log('✅ 診断結果を保存しました:', payload.diagnosisTitle, 'DocID:', docRef.id);
    return true;

  } catch (error) {
    console.error('❌ 診断結果の保存に失敗しました:', error);
    console.error('❌ Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    return false;
  }
};

/**
 * 現在の認証状態を取得
 * @returns {Object|null} - ユーザーオブジェクトまたはnull
 */
window.getCurrentUser = function() {
  if (!auth) {
    console.error('❌ Firebase auth not initialized');
    return null;
  }
  return auth.currentUser;
};

/**
 * 認証状態の変化を監視
 * @param {Function} callback - ユーザー状態変更時のコールバック
 */
window.onAuthStateChanged = function(callback) {
  if (!auth) {
    console.error('❌ Firebase auth not initialized');
    return;
  }
  return auth.onAuthStateChanged(callback);
};

/**
 * 手動で認証状態をリフレッシュ（診断ツール用）
 * @returns {Promise<Object|null>} - 更新されたユーザーオブジェクト
 */
window.refreshAuthState = async function() {
  if (!auth) {
    console.error('❌ Firebase auth not initialized');
    return null;
  }
  
  try {
    await auth.currentUser?.reload();
    return auth.currentUser;
  } catch (error) {
    console.error('❌ Failed to refresh auth state:', error);
    return null;
  }
};
