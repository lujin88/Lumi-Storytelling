# 服务商报错：停用（404）和拒绝（403）文案

文案在 `provider-errors.json`，开发照抄进 `index.html` 的 `providerErrorText`，用 `t(zh, en)`。`{provider}` 就是代码里的 `${n}`（`providerName(id)`，不翻译）。

来源：#69（`b647969`）新加的 `gone` 和 `denied`。QA 审 #69 时指出 `gone` 有两处不对（#69 评论 6449823769），项目经理 2026-10-27 定在这批改：
1. 设置页检查密钥查的是模型列表（`PROVIDER_CHECK`：三家都是 `/models`），和用户选的模型无关，这时用户本来就在设置页，叫他「去设置换一个模型」没用。
2. 「换一家服务商」做不到：写稿只有 Claude 一家。

所以 `gone` 按出现的地方拆成三句，不再提换服务商。

| 什么时候 | 文案 | key |
|---|---|---|
| 设置页「连接」检查密钥，返回 404（`connectProvider`） | {provider} 停用了 Lumi 检查密钥用的接口，跟你的密钥无关。Lumi 更新后才能连上。 / {provider} has retired the endpoint Lumi uses to check keys. Your key isn’t the problem; Lumi needs an update before it can connect. | `provider-error.gone.check` |
| 页面上调用 AI 返回 404（`providerCall`），这家在设置里有不止一个模型可选（`models[id].length > 1`，现在是 Claude、OpenAI） | {provider} 停用了你选的模型。去设置换一个模型，再试一次。 / {provider} has retired the model you chose. Pick another one in Settings, then try again. | `provider-error.gone.model` |
| 页面上调用 AI 返回 404，这家只有一个模型（现在是 Gemini） | {provider} 停用了 Lumi 用的模型。Lumi 更新后才能再用。 / {provider} has retired the model Lumi uses. Lumi needs an update before you can use it again. | `provider-error.gone.only-model` |
| 返回 403，且不是密钥问题（#69 未改，只是新句子，列进审校） | {provider} 拒绝了这次请求，可能是地区或账号权限的问题。 / {provider} refused this request. It may be your region or account permissions. | `provider-error.denied` |

- **「打开设置」按钮**：#69 让 `gone` 后面都带「打开设置」。只有 `gone.model` 带；`gone.only-model` 去设置也改不了，不带。设置页里的 `gone.check` 本来就在设置页，也不带。
- 「Lumi 更新后」：Lumi 是本地文件，接口或唯一的模型停了，只有改代码才能好。没写什么时候更新，不承诺时间。
- 404 在页面调用里也可能是接口本身停了，不是模型。两种都要改代码或换模型，`gone.model` 先让用户试换模型，换了还不行再说。待确认：要不要区分，看服务商返回内容，由开发定。

## 检查
- `copycheck.py --pairs docs/product-specs/copy/provider-errors.json`：0 个错误，0 个警告。
