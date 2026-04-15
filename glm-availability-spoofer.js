// ==UserScript==
// @name         智谱 GLM Coding 抢购
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  在底层拦截并篡改服务器返回的数据流，让前端框架彻底认为有货，从而原生激活按钮和完整的支付逻辑。
// @author       YourName
// @match        *://bigmodel.cn/*
// @match        *://www.bigmodel.cn/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'strict mode';
    const originalJSONParse = JSON.parse;
    JSON.parse = function(text, reviver) {
        let result = originalJSONParse(text, reviver);

        // 递归遍历所有解析出的对象属性
        function deepModify(obj) {
            if (!obj || typeof obj !== 'object') return;

            // 篡改核心售罄标识
            if (obj.isSoldOut === true) obj.isSoldOut = false;
            if (obj.soldOut === true) obj.soldOut = false;
            // 如果遇到 disabled，且该对象看起来是个商品(包含 price/id 等)，则强制启用
            if (obj.disabled === true && (obj.price !== undefined || obj.productId || obj.title)) {
                obj.disabled = false;
            }
            // 有些系统会下发库存数量，顺手给它改大
            if (obj.stock === 0) obj.stock = 999;

            for (let key in obj) {
                if (obj[key] && typeof obj[key] === 'object') {
                    deepModify(obj[key]);
                }
            }
        }

        try { deepModify(result); } catch (e) {}
        return result;
    };

    // ==========================================
    // 战术二：拦截 Fetch 接口请求
    // 针对用户在页面停留时，前端向后端发起的存量/价格二次检查
    // ==========================================
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        const response = await originalFetch.apply(this, args);
        // 我们只处理 JSON 接口
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            const clone = response.clone();
            try {
                let text = await clone.text();
                // 粗暴地全局替换响应体文字中的售罄状态
                if (text.includes('"isSoldOut":true') || text.includes('"disabled":true') || text.includes('"soldOut":true')) {
                    console.log('[抢购助手] 拦截到 Fetch 售罄数据，正在执行篡改！', args[0]);
                    text = text.replace(/"isSoldOut":true/g, '"isSoldOut":false')
                               .replace(/"disabled":true/g, '"disabled":false')
                               .replace(/"soldOut":true/g, '"soldOut":false')
                               .replace(/"stock":0/g, '"stock":999');
                    // 构造并返回一份假的响应给 Vue
                    return new Response(text, {
                        status: response.status,
                        statusText: response.statusText,
                        headers: response.headers
                    });
                }
            } catch (e) {}
        }
        return response;
    };

    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function(method, url, ...rest) {
        this._reqUrl = url;
        return originalXHROpen.call(this, method, url, ...rest);
    };

    XMLHttpRequest.prototype.send = function(...args) {
        this.addEventListener('readystatechange', function() {
            if (this.readyState === 4 && this.status === 200) {
                const contentType = this.getResponseHeader('content-type') || '';
                if (contentType.includes('application/json')) {
                    try {
                        let text = this.responseText;
                        if (text.includes('"isSoldOut":true') || text.includes('"disabled":true') || text.includes('"soldOut":true')) {
                            console.log('[抢购助手] 拦截到 XHR 售罄数据，正在执行篡改！', this._reqUrl);
                            text = text.replace(/"isSoldOut":true/g, '"isSoldOut":false')
                                       .replace(/"disabled":true/g, '"disabled":false')
                                       .replace(/"soldOut":true/g, '"soldOut":false');

                            // 用劫持 getter 的方式修改 this.responseText 给框架层消化
                            Object.defineProperty(this, 'responseText', { get: function() { return text; } });
                            Object.defineProperty(this, 'response', { get: function() { return JSON.parse(text); } });
                        }
                    } catch (e) {}
                }
            }
        });
        originalXHRSend.apply(this, args);
    };

})();
