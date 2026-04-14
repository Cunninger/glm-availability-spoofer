# 求个star

# GLM Availability Spoofer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tampermonkey](https://img.shields.io/badge/Tampermonkey-Beta-00485B.svg)](https://www.tampermonkey.net/)

> ⚠️ **免责声明**：本脚本仅供学习研究浏览器数据拦截技术使用。脚本仅修改前端显示状态，不涉及任何自动化点击、接口破解或协议层攻击。使用本脚本可能导致账号封禁或订单异常，作者不承担任何责任。

## 🎯 使用方法（提前占位策略）

**核心战术：提前进场，解除前端限制，卡点付款**

1. **提前进入**商品页面（倒计时未开始时）
2. 脚本会自动**解锁购买按钮**（篡改 `isSoldOut` / `disabled` 等字段，按钮由灰变亮）
3. **首次点击**会弹出**空的付款框**（这是正常的！此时服务端时间锁未释放，但前端已就绪）
4. **等到开抢时间点**，再次点击按钮即可正常进入付款流程

**实战反馈**：脚本只是帮你提前站好位置、去掉前端遮罩，能否抢到依然取决于网络延迟和服务端并发处理能力。

## ⚠️ 重要说明

**这不是外挂，只是"去障眼法"**
- ✅ 解除前端**视觉层面的禁用状态**（按钮灰色→可点击）
- ❌ **无法绕过**服务端真实库存校验和时间锁
- 🎲 最终能否成交，仍取决于：网络延迟 + 服务端并发处理能力 + 缘分

**风险提示**
- 脚本仅保证前端按钮可点击，不保证后端一定有货
- 首次点击弹出空付款框是预期行为，说明脚本生效但时间未到
- 建议使用国内网络环境，降低延迟

## 🌍 备选方案

如果国内版抢不到，建议直接购买**国际版 (bigmodel.cn 国际站)**：

| 对比项 | 国内版 | 国际版 |
|--------|--------|--------|
| 抢购难度 | 🔥 极高（需卡点） | ✅ 现货直购 |
| 价格差异 | 参考价 | 差距不大 |
| 监管环境 | 严格 | 相对宽松 |
| 服务稳定性 | 高并发易崩 | 通常更稳定 |

**建议**：脚本失效或网络卡顿时，直接转战国际版，体验可能更好。

## 🔧 技术原理

通过三级拦截架构修改 API 响应数据，强制前端认为"有货"：

```javascript
// 1. JSON.parse 原型劫持    → 拦截 SSR 初始注入数据
// 2. Fetch API 响应拦截     → 拦截现代异步请求  
// 3. XMLHttpRequest 兜底    → 拦截遗留 AJAX 请求
```

自动将以下字段强制修改：
| 原字段 | 修改后 |
|--------|--------|
| `isSoldOut: true` | `isSoldOut: false` |
| `soldOut: true` | `soldOut: false` |
| `disabled: true` | `disabled: false` |
| `stock: 0` | `stock: 999` |

## ⚙️ 浏览器设置要求

**必须使用 篡改猴测试版（Tampermonkey Beta）**

安装后需手动开启权限：
1. 浏览器地址栏输入 `chrome://extensions/`
2. 找到 **Tampermonkey Beta** → 点击**详情**
3. 开启 **"允许运行用户脚本"**（默认关闭，必须手动打开，否则脚本不会生效）

## 📦 安装步骤

1. 安装 [Tampermonkey Beta](https://chrome.google.com/webstore/detail/tampermonkey-beta/gcalenpjmijncebpfijmoaglllgpjagf)（Chrome 测试版）
2. 完成上述【浏览器设置要求】开启权限
3. 复制js脚本，添加到油猴插件

<img width="379" height="550" alt="image" src="https://github.com/user-attachments/assets/3b929849-943c-49fd-aaa7-75e276c213ec" />

4. 访问 `bigmodel.cn` 商品页面，按【使用方法】操作

## 📝 更新日志

- **v2.1** - 添加变量名压缩，优化拦截逻辑
- **v2.0** - 初始版本，三级拦截架构

## 贡献

欢迎提交 PR 优化拦截逻辑或适配新的 API 变化。

## 许可

MIT License - 详见 [LICENSE](LICENSE) 文件

---

**声明**: 本项目仅用于技术研究，请在 24 小时内删除。
