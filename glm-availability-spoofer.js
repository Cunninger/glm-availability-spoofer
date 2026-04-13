// ==UserScript==
// @name         GLM Helper
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  数据拦截与篡改
// @author       抖音搜方法返回你的笑
// @match        *://www.bigmodel.cn/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    console.log('[H] 启动...');

    // === 战术1: JSON解析拦截 ===
    const _jp = JSON.parse;
    JSON.parse = function(t, r) {
        let d = _jp(t, r);
        
        function m(o) {
            if (!o || typeof o !== 'object') return;
            
            if (o.isSoldOut === true) o.isSoldOut = false;
            if (o.soldOut === true) o.soldOut = false;
            if (o.disabled === true && (o.price !== undefined || o.productId || o.title)) {
                o.disabled = false;
            }
            if (o.stock === 0) o.stock = 999;

            for (let k in o) {
                if (o[k] && typeof o[k] === 'object') {
                    m(o[k]);
                }
            }
        }
        
        try { m(d); } catch(e) {}
        return d;
    };

    // === 战术2: Fetch拦截 ===
    const _f = window.fetch;
    window.fetch = async function(...a) {
        const s = await _f.apply(this, a);
        const c = s.headers.get('content-type') || '';
        if (c.includes('application/json')) {
            const x = s.clone();
            try {
                let b = await x.text();
                if (b.includes('"isSoldOut":true') || b.includes('"disabled":true') || b.includes('"soldOut":true')) {
                    console.log('[H] F拦截:', a[0]);
                    b = b.replace(/"isSoldOut":true/g, '"isSoldOut":false')
                         .replace(/"disabled":true/g, '"disabled":false')
                         .replace(/"soldOut":true/g, '"soldOut":false')
                         .replace(/"stock":0/g, '"stock":999');
                    return new Response(b, {
                        status: s.status,
                        statusText: s.statusText,
                        headers: s.headers
                    });
                }
            } catch(e) {}
        }
        return s;
    };

    // === 战术3: XHR拦截 ===
    const _xo = XMLHttpRequest.prototype.open;
    const _xs = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function(m, u, ...r) {
        this._u = u;
        return _xo.call(this, m, u, ...r);
    };

    XMLHttpRequest.prototype.send = function(...p) {
        this.addEventListener('readystatechange', function() {
            if (this.readyState === 4 && this.status === 200) {
                const h = this.getResponseHeader('content-type') || '';
                if (h.includes('application/json')) {
                    try {
                        let v = this.responseText;
                        if (v.includes('"isSoldOut":true') || v.includes('"disabled":true') || v.includes('"soldOut":true')) {
                            console.log('[H] X拦截:', this._u);
                            v = v.replace(/"isSoldOut":true/g, '"isSoldOut":false')
                                 .replace(/"disabled":true/g, '"disabled":false')
                                 .replace(/"soldOut":true/g, '"soldOut":false');
                            
                            Object.defineProperty(this, 'responseText', { get: function() { return v; } });
                            Object.defineProperty(this, 'response', { get: function() { return JSON.parse(v); } });
                        }
                    } catch(e) {}
                }
            }
        });
        _xs.apply(this, p);
    };

})();
