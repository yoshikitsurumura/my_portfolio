// お問い合わせフォーム送信処理
//
// GASのウェブアプリはサンドボックスiframeの中にレスポンスを描画するため、
// GAS側からサンクスページへ遷移させようとしても失敗することがある。
// そこで送信先を非表示iframeにして、遷移はこちら側で確実に行う。
// （JavaScriptが無効な環境では通常のフォーム送信にフォールバックする）

(function () {
    'use strict';

    const GAS_HOST = 'script.google.com';
    const SUBMIT_TIMEOUT_MS = 20000;

    document.addEventListener('DOMContentLoaded', () => {
        const forms = document.querySelectorAll('form[action*="' + GAS_HOST + '"]');
        forms.forEach(setupForm);
    });

    function setupForm(form) {
        const frameName = 'contact-sink-' + Math.random().toString(36).slice(2);
        const frame = document.createElement('iframe');
        frame.name = frameName;
        frame.title = 'お問い合わせ送信処理';
        frame.setAttribute('aria-hidden', 'true');
        frame.setAttribute('tabindex', '-1');
        frame.style.display = 'none';
        document.body.appendChild(frame);

        form.target = frameName;

        const button = form.querySelector('button[type="submit"], button:not([type])');
        const originalLabel = button ? button.innerHTML : '';
        let submitting = false;
        let timeoutId = null;

        form.addEventListener('submit', () => {
            // ブラウザの必須チェックを通過した後だけここに来る
            if (submitting) {
                return;
            }
            submitting = true;
            setBusy(button, true, '送信中…');

            // レスポンスが返ってこない場合に、操作不能のままにしない
            timeoutId = window.setTimeout(() => {
                submitting = false;
                setBusy(button, false, originalLabel);
                showError(form);
            }, SUBMIT_TIMEOUT_MS);
        });

        frame.addEventListener('load', () => {
            // iframe生成直後のabout:blankのloadは無視する
            if (!submitting) {
                return;
            }
            window.clearTimeout(timeoutId);
            window.location.href = form.dataset.thanks || 'pages/thanks.html';
        });
    }

    function setBusy(button, busy, label) {
        if (!button) {
            return;
        }
        button.disabled = busy;
        button.setAttribute('aria-busy', busy ? 'true' : 'false');
        button.innerHTML = label;
    }

    function showError(form) {
        let notice = form.querySelector('.contact-error');
        if (!notice) {
            notice = document.createElement('p');
            notice.className = 'contact-error';
            notice.setAttribute('role', 'alert');
            notice.style.color = '#ff6b6b';
            notice.style.marginTop = '12px';
            form.appendChild(notice);
        }
        notice.textContent = '送信に時間がかかっています。'
            + 'お急ぎの場合はお手数ですが crane7112@gmail.com まで直接ご連絡ください。';
    }
})();
