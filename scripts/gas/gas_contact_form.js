/**
 * CraneAI ポートフォリオ お問い合わせフォーム処理（Google Apps Script）
 *
 * 設計方針:
 *   「通知メールが届くこと」を最優先にする。
 *   スプレッドシートへの記録は任意の機能とし、そこで失敗しても
 *   メール通知だけは必ず実行されるようにしている。
 *   （旧版はシート保存を先に実行していたため、スプレッドシートが
 *     未接続のスタンドアロンプロジェクトだと例外で止まり、
 *     メールが 1 通も送られなかった。）
 *
 * デプロイ手順・動作確認の手順は scripts/gas/README.md を参照。
 */

// ===== 設定 =====================================================
var CONFIG = {
  // 通知メールの宛先
  RECIPIENT: 'crane7112@gmail.com',

  // 送信完了後に表示するページ
  THANKS_URL: 'https://yoshikitsurumura.github.io/my_portfolio/pages/thanks.html',

  // 問い合わせが届かないときに案内する連絡先
  FALLBACK_CONTACT: 'crane7112@gmail.com',

  // 記録用スプレッドシートのID（任意）。
  // 空のままなら スクリプトプロパティ SHEET_ID → バインド中のシート の順に探し、
  // どれも無ければシート保存はスキップする（メール通知は影響を受けない）。
  SHEET_ID: '',
  SHEET_NAME: '問い合わせ',

  TIMEZONE: 'Asia/Tokyo'
};

// ===== エントリポイント ==========================================

/**
 * 疎通確認用。ブラウザでウェブアプリのURLを開くと JSON が表示される。
 * ここで JSON が見えない（ログイン画面になる／404になる）場合は、
 * デプロイ設定かURLの方に問題がある。
 */
function doGet() {
  return jsonOutput({
    status: 'ok',
    service: 'CraneAI contact form',
    time: formatTimestamp(new Date())
  });
}

function doPost(e) {
  var data = parseSubmission(e);
  var mailSent = false;
  var sheetSaved = false;
  var errors = [];

  // 1) 通知メール（最優先。ここが落ちると問い合わせに気づけない）
  try {
    sendNotificationEmail(data);
    mailSent = true;
  } catch (err) {
    errors.push('mail: ' + err);
    // HTML本文や replyTo が原因の可能性があるため、最小構成で再送を試みる
    try {
      MailApp.sendEmail(CONFIG.RECIPIENT, buildSubject(data), buildPlainBody(data));
      mailSent = true;
      errors.push('mail: プレーンテキストで再送信しました');
    } catch (retryErr) {
      errors.push('mail(retry): ' + retryErr);
    }
  }

  // 2) スプレッドシートへの記録（任意。失敗してもメールは届いている）
  try {
    sheetSaved = saveToSheet(data);
  } catch (err) {
    errors.push('sheet: ' + err);
  }

  if (errors.length) {
    Logger.log('お問い合わせ処理で問題が発生しました:\n' + errors.join('\n'));
  }

  // メールもシートも駄目だった場合だけ、送信者にその旨を伝える
  if (!mailSent && !sheetSaved) {
    return errorPage();
  }
  return redirectPage();
}

// ===== 入力の取り出し ============================================

function parseSubmission(e) {
  var params = (e && e.parameter) || {};
  return {
    timestamp: new Date(),
    name: pick(params.name, '（お名前未入力）'),
    email: pick(params.email, ''),
    message: pick(params.message, '（内容未入力）'),
    source: pick(params.source, '不明')
  };
}

function pick(value, fallback) {
  var text = (value === null || value === undefined) ? '' : String(value).trim();
  return text === '' ? fallback : text;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// ===== 通知メール ================================================

function sendNotificationEmail(data) {
  var options = {
    htmlBody: buildHtmlBody(data),
    name: 'CraneAI お問い合わせ通知'
  };

  // 有効なアドレスのときだけ replyTo を付ける。
  // 不正な値を渡すと送信そのものが例外で失敗するため。
  if (isValidEmail(data.email)) {
    options.replyTo = data.email;
  }

  // GmailApp ではなく MailApp を使う。
  // 必要な認可スコープが少なく（script.send_mail のみ）、
  // 通知メールの送信用途ではこちらの方が確実に動く。
  MailApp.sendEmail(CONFIG.RECIPIENT, buildSubject(data), buildPlainBody(data), options);
}

function buildSubject(data) {
  return '🚨【CraneAI】お問い合わせ: ' + data.name + ' 様';
}

function buildPlainBody(data) {
  var line = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  var body = [
    line,
    '🌐 CraneAI ポートフォリオ お問い合わせ通知',
    line,
    '',
    '📅 受信日時: ' + formatTimestamp(data.timestamp),
    '📄 送信元ページ: ' + data.source,
    '',
    line,
    '📋 お問い合わせ内容',
    line,
    '',
    '👤 お名前: ' + data.name,
    '',
    '📧 メールアドレス: ' + (data.email || '（未入力）'),
    '',
    '💬 お問い合わせ内容:',
    '────────────────────────────',
    data.message,
    '────────────────────────────',
    ''
  ];

  if (isValidEmail(data.email)) {
    body.push('このメールにそのまま返信すれば、お客様に届きます。');
  } else {
    body.push('⚠️ メールアドレスが未入力または不正な形式のため、返信できません。');
  }

  var sheetUrl = getSpreadsheetUrl();
  if (sheetUrl) {
    body.push('', 'スプレッドシートで管理: ' + sheetUrl);
  }

  body.push('', line, '※ このメールはCraneAIポートフォリオから自動送信されています', line);
  return body.join('\n');
}

function buildHtmlBody(data) {
  // 受信した内容はそのまま HTML に埋め込まず、必ずエスケープする
  var name = escapeHtml(data.name);
  var email = escapeHtml(data.email);
  var message = escapeHtml(data.message).replace(/\n/g, '<br>');
  var source = escapeHtml(data.source);
  var replyBlock = isValidEmail(data.email)
    ? '<div style="text-align:center;padding-top:20px;">' +
      '<a href="mailto:' + email + '" style="display:inline-block;background:#00f0ff;color:#0f0f1e;' +
      'padding:12px 30px;text-decoration:none;border-radius:5px;font-weight:bold;">📩 返信する</a>' +
      '</div>'
    : '<p style="color:#ff6b6b;text-align:center;">⚠️ メールアドレスが未入力または不正な形式です</p>';

  return '' +
    '<div style="font-family:\'Helvetica Neue\',Arial,sans-serif;max-width:600px;margin:0 auto;' +
    'background:#0f0f1e;color:#fff;padding:30px;border-radius:10px;">' +
      '<div style="text-align:center;padding-bottom:20px;border-bottom:2px solid #00f0ff;">' +
        '<h1 style="color:#00f0ff;margin:0;">🌐 CraneAI</h1>' +
        '<p style="color:#888;margin:10px 0 0;">ポートフォリオ お問い合わせ通知</p>' +
      '</div>' +
      '<div style="padding:20px 0;">' +
        '<p style="color:#888;font-size:14px;margin:0;">📅 受信日時: ' + formatTimestamp(data.timestamp) + '</p>' +
        '<p style="color:#888;font-size:14px;margin:6px 0 0;">📄 送信元ページ: ' + source + '</p>' +
      '</div>' +
      '<div style="background:#1a1a2e;padding:20px;border-radius:8px;margin:20px 0;">' +
        '<h2 style="color:#00f0ff;margin-top:0;font-size:18px;">📋 お問い合わせ内容</h2>' +
        '<table style="width:100%;color:#fff;">' +
          '<tr>' +
            '<td style="padding:10px 0;color:#888;width:120px;">👤 お名前:</td>' +
            '<td style="padding:10px 0;font-weight:bold;">' + name + '</td>' +
          '</tr>' +
          '<tr>' +
            '<td style="padding:10px 0;color:#888;">📧 メール:</td>' +
            '<td style="padding:10px 0;">' + (email || '（未入力）') + '</td>' +
          '</tr>' +
        '</table>' +
        '<div style="margin-top:20px;padding-top:20px;border-top:1px solid #333;">' +
          '<p style="color:#888;margin-bottom:10px;">💬 お問い合わせ内容:</p>' +
          '<div style="background:#0f0f1e;padding:15px;border-radius:5px;line-height:1.6;">' + message + '</div>' +
        '</div>' +
      '</div>' +
      replyBlock +
      '<div style="text-align:center;padding-top:30px;border-top:1px solid #333;margin-top:30px;">' +
        '<p style="color:#666;font-size:12px;">このメールはCraneAIポートフォリオから自動送信されています</p>' +
      '</div>' +
    '</div>';
}

// ===== スプレッドシート記録（任意） ================================

/**
 * @return {boolean} 実際に書き込めたら true、シート未設定でスキップしたら false
 */
function saveToSheet(data) {
  var ss = openSpreadsheet();
  if (!ss) {
    Logger.log('スプレッドシートが設定されていないため、記録をスキップしました。');
    return false;
  }

  var sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);
    sheet.appendRow(['日時', 'お名前', 'メールアドレス', 'お問い合わせ内容', '送信元ページ', 'ステータス']);
    sheet.getRange(1, 1, 1, 6).setFontWeight('bold').setBackground('#00f0ff');
    sheet.setFrozenRows(1);
  }

  sheet.appendRow([data.timestamp, data.name, data.email, data.message, data.source, '未対応']);
  return true;
}

/**
 * 記録先スプレッドシートを開く。見つからない場合は null。
 * スタンドアロンのスクリプトでは getActiveSpreadsheet() が null を返す点に注意。
 */
function openSpreadsheet() {
  var id = CONFIG.SHEET_ID || PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  if (id) {
    return SpreadsheetApp.openById(id);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getSpreadsheetUrl() {
  try {
    var ss = openSpreadsheet();
    return ss ? ss.getUrl() : '';
  } catch (err) {
    return '';
  }
}

// ===== レスポンス ================================================

/**
 * サンクスページへ遷移させる。
 * ウェブアプリの出力はサンドボックス iframe の中に描画されるため、
 * window.location だけだと iframe の中だけが切り替わってしまう。
 * 必ず window.top を対象にし、遷移できなかったときのためにリンクも出す。
 */
function redirectPage() {
  var url = CONFIG.THANKS_URL;
  var html = '<!DOCTYPE html>' +
    '<html lang="ja"><head><meta charset="utf-8">' +
    '<title>送信完了 | CraneAI</title></head>' +
    '<body style="font-family:sans-serif;text-align:center;padding:48px 16px;background:#0f0f1e;color:#fff;">' +
      '<p style="font-size:18px;">送信が完了しました。ページを移動しています…</p>' +
      '<p><a href="' + escapeHtml(url) + '" target="_top" ' +
      'style="color:#00f0ff;font-weight:bold;">切り替わらない場合はこちらをクリック</a></p>' +
      '<script>' +
        'var url=' + JSON.stringify(url) + ';' +
        'try{window.top.location.href=url;}catch(err){window.location.href=url;}' +
      '<\/script>' +
    '</body></html>';

  return HtmlService.createHtmlOutput(html).setTitle('送信完了 | CraneAI');
}

function errorPage() {
  var html = '<!DOCTYPE html>' +
    '<html lang="ja"><head><meta charset="utf-8">' +
    '<title>送信エラー | CraneAI</title></head>' +
    '<body style="font-family:sans-serif;text-align:center;padding:48px 16px;background:#0f0f1e;color:#fff;">' +
      '<h1 style="color:#ff6b6b;font-size:20px;">送信に失敗しました</h1>' +
      '<p>大変申し訳ございません。システム側の問題で送信を受け付けられませんでした。<br>' +
      'お手数ですが、下記アドレスまで直接ご連絡ください。</p>' +
      '<p><a href="mailto:' + escapeHtml(CONFIG.FALLBACK_CONTACT) + '" ' +
      'style="color:#00f0ff;font-weight:bold;">' + escapeHtml(CONFIG.FALLBACK_CONTACT) + '</a></p>' +
    '</body></html>';

  return HtmlService.createHtmlOutput(html).setTitle('送信エラー | CraneAI');
}

function jsonOutput(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ===== ユーティリティ ============================================

function formatTimestamp(date) {
  return Utilities.formatDate(date, CONFIG.TIMEZONE, 'yyyy/MM/dd HH:mm:ss');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ===== 動作確認用 ================================================

/**
 * スクリプトエディタから実行して、メールとシートの両方を確認する。
 * 実行ログに結果が出るので、どちらが失敗したか切り分けできる。
 */
function testDoPost() {
  var response = doPost({
    parameter: {
      name: 'テスト太郎',
      email: 'test@example.com',
      message: 'これはテストメッセージです。\n改行も含めてテストします。',
      source: 'testDoPost（手動実行）'
    }
  });
  Logger.log('テスト完了。' + CONFIG.RECIPIENT + ' の受信トレイを確認してください。');
  return response;
}

/**
 * メール送信だけを単体で確認する。
 * 「メールが届かない」ときは、まずこれを実行して認可の状態を確かめる。
 */
function testEmailOnly() {
  sendNotificationEmail({
    timestamp: new Date(),
    name: 'メール単体テスト',
    email: 'test@example.com',
    message: 'メール送信のみのテストです。',
    source: 'testEmailOnly（手動実行）'
  });
  Logger.log('送信しました。残りの送信可能数: ' + MailApp.getRemainingDailyQuota());
}

/**
 * スプレッドシート接続だけを単体で確認する。
 */
function testSheetOnly() {
  var ss = openSpreadsheet();
  if (!ss) {
    Logger.log('スプレッドシートは未設定です（メール通知のみで運用されます）。');
    return;
  }
  Logger.log('接続先: ' + ss.getName() + ' / ' + ss.getUrl());
}
