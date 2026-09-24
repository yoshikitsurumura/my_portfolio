const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(__dirname + '/gas_contact_form.js', 'utf8');

function setup({ sheet = 'bound', mailFails = false, sheetFails = false } = {}) {
  const sent = [], rows = [], opened = [], errors = [];
  const worksheet = { appendRow(row) { if (sheetFails) throw Error('permission denied'); rows.push(row); } };
  const spreadsheet = { getSheetByName() { return worksheet; } };
  const ctx = vm.createContext({
    console: { error(...args) { errors.push(args); }, log() {} },
    PropertiesService: { getScriptProperties() { return { getProperty() { return sheet === 'id' ? 'existing-sheet-id' : null; } }; } },
    SpreadsheetApp: {
      getActiveSpreadsheet() { return sheet === 'missing' ? null : spreadsheet; },
      openById(id) { opened.push(id); return spreadsheet; }
    },
    GmailApp: { sendEmail(...args) { if (mailFails) throw Error('quota or authorization failure'); sent.push(args); } },
    HtmlService: { createHtmlOutput(html) { return { getContent() { return html; } }; } }
  });
  vm.runInContext(source, ctx);
  return { ctx, sent, rows, opened, errors };
}
const event = (overrides = {}) => ({ parameter: { name: '鶴村テスト', email: 'test@example.com', message: 'お問い合わせ\n2行目', ...overrides } });

test('valid request records history and sends one mail with reply-to', () => {
  const {ctx, sent, rows} = setup();
  assert.match(ctx.doPost(event()).getContent(), /<h1>送信完了<\/h1>/);
  assert.equal(rows.length, 1);
  assert.equal(sent.length, 1);
  assert.equal(sent[0][0], 'crane7112@gmail.com');
  assert.equal(sent[0][3].replyTo, 'test@example.com');
});
test('standalone project without an active sheet still sends mail', () => {
  const {ctx, sent, errors} = setup({sheet:'missing'});
  assert.match(ctx.doPost(event()).getContent(), /<h1>送信完了<\/h1>/);
  assert.equal(sent.length, 1);
  assert.equal(errors.length, 1);
});
test('sheet permission failure does not block notification', () => {
  const {ctx, sent} = setup({sheetFails:true});
  ctx.doPost(event());
  assert.equal(sent.length, 1);
});
test('configured spreadsheet is opened explicitly', () => {
  const {ctx, opened} = setup({sheet:'id'});
  ctx.doPost(event());
  assert.deepEqual(opened, ['existing-sheet-id']);
});
test('mail failure displays failure, without exposing internal details', () => {
  const {ctx} = setup({mailFails:true});
  const html = ctx.doPost(event()).getContent();
  assert.match(html, /<h1>送信できませんでした<\/h1>/);
  assert.doesNotMatch(html, /quota|authorization|<h1>送信完了<\/h1>/);
});
test('invalid input never writes history or sends mail', () => {
  for (const input of [undefined, event({name:' '}), event({message:''}), event({email:'x@x.com\r\nBcc:bad@example.com'}), event({message:'x'.repeat(10001)})]) {
    const {ctx, sent, rows} = setup();
    assert.match(ctx.doPost(input).getContent(), /<h1>送信できませんでした<\/h1>/);
    assert.equal(sent.length, 0);
    assert.equal(rows.length, 0);
  }
});
test('HTML is escaped and sheet formulas are stored as text', () => {
  const {ctx, sent, rows} = setup();
  ctx.doPost(event({name:'=1+1', message:'<img src=x onerror=alert(1)>\n& text'}));
  assert.equal(rows[0][1], "'=1+1");
  assert.match(sent[0][3].htmlBody, /&lt;img/);
  assert.doesNotMatch(sent[0][3].htmlBody, /<img src=x/);
  assert.match(sent[0][3].htmlBody, /<br>&amp; text/);
});
test('result links escape GAS iframe through explicit user navigation', () => {
  const {ctx} = setup();
  const html = ctx.doPost(event()).getContent();
  assert.match(html, /target="_top"/);
  assert.doesNotMatch(html, /http-equiv="refresh"|window.location/);
});
test('editor test reports a mail failure instead of unconditional success', () => {
  const {ctx} = setup({mailFails:true});
  assert.throws(() => ctx.testDoPost(), /送信テスト失敗/);
});
