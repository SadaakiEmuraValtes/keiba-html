<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="help-wrap">
    <h2 class="page-title">ヘルプ・免責事項</h2>

    <!-- 免責事項 -->
    <section class="help-section">
      <h3 class="section-heading">⚠️ 免責事項</h3>
      <div class="disclaimer-box">
        <p>本サイト「KEIBA NET」は<strong>架空の競馬投票デモサービス</strong>です。</p>
        <ul>
          <li>実際の競馬・馬券購入とは一切関係ありません。</li>
          <li>本サイトで使用される金額・レース情報・馬名・騎手名はすべてデモ用の架空データです。</li>
          <li>本サイトへのチャージ・投票は実際の金銭的取引を伴いません。</li>
          <li>レース結果はシステムが自動生成した架空の結果です。</li>
          <li>本サービスはブラウザセッション内でのみデータが保持されます。ブラウザを閉じるとリセットされます。</li>
          <li>本サービスの利用により生じた損害等について、運営者は一切の責任を負いません。</li>
        </ul>
      </div>
    </section>

    <!-- 使い方 -->
    <section class="help-section">
      <h3 class="section-heading">📖 使い方</h3>
      <div class="help-step">
        <div class="step-num">1</div>
        <div class="step-body">
          <div class="step-title">ログイン</div>
          <div class="step-desc">テストアカウントでログインします。パスワードはすべて <code>test1234</code> です。</div>
        </div>
      </div>
      <div class="help-step">
        <div class="step-num">2</div>
        <div class="step-body">
          <div class="step-title">チャージ</div>
          <div class="step-desc">マイページの「残高チャージ」または投票画面の「チャージ」ボタンで仮想銀行振込によるチャージを行います。</div>
        </div>
      </div>
      <div class="help-step">
        <div class="step-num">3</div>
        <div class="step-body">
          <div class="step-title">日程・時刻の選択</div>
          <div class="step-desc">レース一覧画面で開催日（5パターン）と仮想時刻（9〜21時）を選択します。時刻を進めるとレースが確定し払い戻しが自動計算されます。</div>
        </div>
      </div>
      <div class="help-step">
        <div class="step-num">4</div>
        <div class="step-body">
          <div class="step-title">馬券購入</div>
          <div class="step-desc">投票受付中のレースをクリックし、式別・方式を選んで馬を選択します。購入にはログインと残高が必要です。</div>
        </div>
      </div>
      <div class="help-step">
        <div class="step-num">5</div>
        <div class="step-body">
          <div class="step-title">WIN5 購入</div>
          <div class="step-desc">レース一覧画面の下部「WIN5」セクションで、日程の重賞5レース（10〜11R）の1着馬を各レース1頭以上選択して購入します。全5レース確定後に自動精算されます。</div>
        </div>
      </div>
      <div class="help-step">
        <div class="step-num">6</div>
        <div class="step-body">
          <div class="step-title">払い戻し確認</div>
          <div class="step-desc">仮想時刻をレース発走後に進めると自動的に精算されます。マイページで結果を確認できます。</div>
        </div>
      </div>
    </section>

    <!-- 馬券種別説明 -->
    <section class="help-section">
      <h3 class="section-heading">🎫 馬券の種類</h3>
      <table class="bet-types-table">
        <thead><tr><th>式別</th><th>内容</th><th>的中条件</th></tr></thead>
        <tbody>
          <tr><td>単勝</td><td>1着馬</td><td>1着を当てる</td></tr>
          <tr><td>複勝</td><td>3着以内</td><td>3着以内に入る1頭</td></tr>
          <tr><td>馬複</td><td>1・2着（順不同）</td><td>1着と2着の組み合わせ</td></tr>
          <tr><td>馬単</td><td>1・2着（順序指定）</td><td>1着→2着を順番通りに</td></tr>
          <tr><td>ワイド</td><td>3着以内2頭</td><td>3着以内の任意2頭（順不同）</td></tr>
          <tr><td>三連複</td><td>1〜3着（順不同）</td><td>1〜3着3頭の組み合わせ</td></tr>
          <tr><td>三連単</td><td>1〜3着（順序指定）</td><td>1着→2着→3着を順番通りに</td></tr>
          <tr class="win5-row"><td><strong>WIN5</strong></td><td>重賞5レース1着馬</td><td>指定5レースすべての1着馬を的中させる</td></tr>
        </tbody>
      </table>
    </section>

    <!-- 方式説明 -->
    <section class="help-section">
      <h3 class="section-heading">📋 購入方式</h3>
      <div class="method-list">
        <div class="method-item"><span class="method-name">通常</span>各着順に1頭ずつ指定して1点購入</div>
        <div class="method-item"><span class="method-name">流し</span>軸馬を決め、相手を複数指定してまとめて購入</div>
        <div class="method-item"><span class="method-name">ボックス</span>選んだ馬の全組み合わせを購入</div>
        <div class="method-item"><span class="method-name">フォーメーション</span>各着順に複数馬を指定して組み合わせを絞り込む</div>
      </div>
    </section>

    <!-- WIN5 説明 -->
    <section class="help-section">
      <h3 class="section-heading">🏆 WIN5 について</h3>
      <div class="win5-box">
        <p class="win5-lead">日程内の重賞5レース（10〜11R）すべての1着馬を的中させると高配当！</p>
        <ul>
          <li>レース一覧画面の下部「WIN5」セクションから購入します（ナビメニューではありません）。</li>
          <li>5レースが横並びで表示され、各レースで1頭以上を縦に選択します。</li>
          <li>複数頭選択可（ボックス購入）。組み合わせ数 × 購入額が合計金額になります。</li>
          <li>全5レースが「投票受付中」の間のみ購入できます。</li>
          <li>全レース確定後に自動精算されます。</li>
          <li>払戻金 = 的中馬オッズの積 × 30（最低 ¥100,000 / 100円）</li>
          <li>日程ごとに5レースが変わります。最終レースは最高グレード（GI）です。</li>
        </ul>
      </div>
    </section>

    <!-- オッズ色分け -->
    <section class="help-section">
      <h3 class="section-heading">🎨 オッズ色分け</h3>
      <table class="bet-types-table">
        <thead><tr><th>式別</th><th>赤（低オッズ）</th><th>黒（高オッズ）</th></tr></thead>
        <tbody>
          <tr><td>単勝・複勝</td><td>10倍未満</td><td>10倍以上</td></tr>
          <tr><td>馬複・馬単・ワイド・三連複・三連単</td><td>100倍未満</td><td>100倍以上</td></tr>
        </tbody>
      </table>
    </section>

    <!-- テストアカウント -->
    <section class="help-section">
      <h3 class="section-heading">👤 テストアカウント</h3>
      <table class="bet-types-table">
        <thead><tr><th>ログインID</th><th>パスワード</th></tr></thead>
        <tbody>
          <tr><td>yamada</td><td>test1234</td></tr>
          <tr><td>sato</td><td>test1234</td></tr>
          <tr><td>suzuki</td><td>test1234</td></tr>
          <tr><td>tanaka</td><td>test1234</td></tr>
          <tr><td>ito</td><td>test1234</td></tr>
        </tbody>
      </table>
    </section>

    <button class="btn btn-secondary" @click="router.push('/')">← レース一覧に戻る</button>
  </div>
</template>

<style scoped>
.help-wrap { max-width: 720px; margin: 0 auto; }
.help-section { margin-bottom: 24px; }
.section-heading { font-size: 1rem; font-weight: 800; margin-bottom: 12px; color: #1a1a1a; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; }

.disclaimer-box {
  background: #fff8f8; border: 1px solid #fca5a5; border-radius: 8px;
  padding: 14px 16px; font-size: 0.85rem; color: #1a1a1a; line-height: 1.7;
}
.disclaimer-box strong { color: #dc2626; }
.disclaimer-box ul { margin: 8px 0 0 16px; }
.disclaimer-box li { margin-bottom: 4px; }

.help-step { display: flex; gap: 12px; margin-bottom: 12px; align-items: flex-start; }
.step-num {
  width: 28px; height: 28px; border-radius: 50%; background: #16a34a;
  color: #fff; font-weight: 800; font-size: 0.85rem;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.step-title { font-weight: 700; font-size: 0.88rem; margin-bottom: 3px; color: #1a1a1a; }
.step-desc { font-size: 0.82rem; color: #374151; line-height: 1.6; }
code { background: #f1f5f9; padding: 1px 5px; border-radius: 3px; color: #1e40af; font-family: monospace; }

.bet-types-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
.bet-types-table th { background: #f0fdf4; padding: 7px 10px; text-align: left; color: #166534; border-bottom: 1px solid #bbf7d0; font-weight: 700; }
.bet-types-table td { padding: 7px 10px; border-bottom: 1px solid #f1f5f9; color: #1a1a1a; }
.bet-types-table tr:hover td { background: #f8fafc; }
.win5-row td { background: #fefce8; color: #92400e; font-weight: 600; border-bottom: 1px solid #fde68a; }

.method-list { display: flex; flex-direction: column; gap: 6px; }
.method-item { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 9px 12px; font-size: 0.82rem; display: flex; align-items: baseline; gap: 10px; color: #374151; }
.method-name { font-weight: 800; color: #16a34a; min-width: 80px; }

.win5-box {
  background: #fefce8; border: 1px solid #d97706; border-radius: 8px;
  padding: 14px 16px; font-size: 0.85rem; color: #1a1a1a; line-height: 1.7;
}
.win5-lead { font-weight: 700; color: #92400e; margin-bottom: 8px; }
.win5-box ul { margin: 0 0 0 16px; }
.win5-box li { margin-bottom: 4px; }
</style>
