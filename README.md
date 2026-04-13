# GLM Availability Spoofer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tampermonkey](https://img.shields.io/badge/Tampermonkey-✔-00485B.svg)](https://www.tampermonkey.net/)

&gt; ⚠️ **免责声明**：本脚本仅供学习研究浏览器数据拦截技术使用，请勿用于实际购买流程干扰或任何违法用途。使用本脚本可能导致账号封禁或订单异常，作者不承担任何责任。

## 功能说明

通过拦截以下 API 修改响应数据，强制前端显示"有货"状态：

- ✅ `JSON.parse` 原型劫持（服务端注入数据）
- ✅ `Fetch API` 响应拦截
- ✅ `XMLHttpRequest` 兜底拦截

自动将以下字段强制修改：
| 原字段 | 修改后 |
|--------|--------|
| `isSoldOut: true` | `isSoldOut: false` |
| `soldOut: true` | `soldOut: false` |
| `disabled: true` | `disabled: false` |
| `stock: 0` | `stock: 999` |

## 安装

1. 安装 [Tampermonkey](https://www.tampermonkey.net/) 扩展
2. [点击安装脚本](https://raw.githubusercontent.com/你的用户名/glm-availability-spoofer/main/main.user.js) （需先上传文件到仓库）
3. 访问 `bigmodel.cn` 相关商品页面

## 技术原理

```javascript
// 三级拦截架构
1. JSON.parse 劫持    → 拦截 SSR 初始数据
2. Fetch 封装拦截     → 拦截现代异步请求  
3. XHR 事件监听       → 拦截遗留 AJAX
