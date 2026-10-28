# 缺 key 引导（ConnectionPrompt）文案

文案在 `connection-prompt.json`，开发照抄进 `index.html`，用 `t(zh, en)`。规格：#57 `design-system/components/ConnectionPrompt/README.md`。

规格列了 6 个键。为了「分 provider 说清楚缺哪一把」，`connection.blocked` 和 `connection.degraded` 按 provider 拆成带后缀的键；规格预览里出现但没列键的三处（帮助展开按钮、本地保存说明、FAQ 正文）也补了键。

## 横幅（设置页以外，用户点了要用这个服务的功能之后）

| 什么时候 | 文案 | key |
|---|---|---|
| 第 3 步改稿，Claude 没连上（`aiReady('claude')` 为假） | 这一步要用 Claude，你的 Claude API 密钥还没连上。 / This step needs Claude, and your Claude API key isn’t connected yet. | `connection.blocked.claude` |
| 第 3 步改图，OpenAI 没连上 | 这一步要用 OpenAI 处理图片，你的 OpenAI API 密钥还没连上。 / This step uses OpenAI for images, and your OpenAI API key isn’t connected yet. | `connection.blocked.openai` |
| 点麦克风，浏览器没有语音识别，Gemini 没连上 | 这个浏览器不支持语音识别，要用 Gemini 转写。你的 Gemini API 密钥还没连上。 / This browser can’t recognise speech, so voice input needs Gemini. Your Gemini API key isn’t connected yet. | `connection.blocked.gemini` |
| 点麦克风，用浏览器自带识别，Gemini 没连上（降级） | 正在用浏览器自带的语音识别。连上 Gemini，转写更准。 / Using your browser’s speech recognition. Connect Gemini for more accurate transcripts. | `connection.degraded.gemini` |
| 以上四种的末尾链接；以及服务商拒绝密钥（`aiError.kind` 为 `key`/`credit`）时，代替现在的「打开设置」 | 去设置连接 {provider} / Connect {provider} in Settings | `connection.open-settings` |

- 写「密钥还没连上」而不是「没有填密钥」：`aiReady` 为假包括两种情况，没填，或填了但检查没通过。两种都对得上「没连上」。
- 「转写更准」沿用现在横幅和帮助页第 2 条已有的说法，没有新加比较。
- `{provider}` 用 `providerName(id)`，不翻译。
- 服务商拒绝密钥时，前半句仍用现在 `providerErrorText` 的报错，只换末尾链接。

## 设置页里，被跳转到的那一行

| 位置 | 文案 | key |
|---|---|---|
| 输入框下面的展开按钮 | 在哪里拿密钥，怎么填？ / Where do I get a key, and how do I add it? | `connection.key-help` |
| 展开第 1 步（外链，末尾接 `arrow-right-up-line` 图标，和 `prov-doc` 一样，不在文案里写 ↗） | 在 {site} 创建 {provider} API 密钥 / Create a {provider} API key in {site} | `connection.get-key` |
| 展开第 2 步 | 复制密钥，粘贴到上面的输入框，再点「连接」。 / Copy the key, paste it into the field above, then select Connect. | `connection.paste-key` |
| 展开末尾，网页打开（`KEYS_PERSIST` 为真） | 密钥只存在这个浏览器里，调用 {provider} 时直接发给它，不经过别处，也不会导出。 / The key stays in this browser. It goes straight to {provider} when Lumi calls it, nowhere else, and is never exported. | `connection.key-stored` |
| 展开末尾，双击文件打开 | 双击打开时不会保存密钥，关掉页面后要重新填。 / Opened as a file, Lumi doesn’t save the key, so you’ll enter it again next time. | `connection.key-not-stored` |

`{site}` 和链接放进 provider 元数据（规格要求设置和帮助读同一份）。三个链接都在官方文档里核对过（2026-10-27）：

| provider | `{site}` | 创建密钥的页面 | 出处 |
|---|---|---|---|
| Claude | Claude Console | https://platform.claude.com/settings/keys | https://platform.claude.com/docs/en/get-api-key |
| OpenAI | OpenAI Platform | https://platform.openai.com/api-keys | https://developers.openai.com/api/docs/quickstart 里的链接 |
| Gemini | Google AI Studio | https://aistudio.google.com/apikey | https://ai.google.dev/gemini-api/docs/api-key |

- 「连接」和设置页按钮现在的字一致（`settingsViewV3`）。按钮状态是「重新检查」时这一步也照写「连接」：只有没连上的行会被跳转过来。
- 本地保存的说法改准了：原来写「不会上传」，但每次调用时密钥会从浏览器直接发给对应服务商（decisions.md 2026-10-23「Claude, OpenAI and Gemini are called from the browser with the user's key」；`index.html` 里三家都是浏览器直连，本地 `server/` 不经手密钥）。新说法：只存在这个浏览器、调用时直接发给这家服务、不经过别处、不会导出。没写「Lumi 没有服务器」：本地 `server/`（127.0.0.1:4317）是存在的，只是不碰密钥。
- 双击文件打开那句没有「不会上传」，事实不变，不改。
- 即梦不用密钥（用本机登录），不加展开说明。

## 帮助页 FAQ

**替换现有第 3 条「怎么知道 API 连上了？」，放在原来的位置，不新增一条**（项目经理定，2026-10-27）。

| 位置 | 文案 | key |
|---|---|---|
| 问题 | 怎么填 API 密钥，怎么知道连上了？ / How do I add my API keys, and how do I know they work? | `help.connect-provider.q` |
| 回答 | Lumi 用你自己的 API 密钥调用 AI 服务，每个服务一把。点下面的服务名，会跳到设置里它那一行，输入框旁边就有拿密钥的步骤。连上后，那一行会显示「已连接」。 / Lumi calls AI services with your own API keys, one key per service. Select a service below to jump to its row in Settings. The steps to get a key are right beside the field. Once it’s connected, the row shows Connected. | `help.connect-provider.a` |
| 服务列表 | 每行：服务名（内部链接）+ 设置页同一行的用途说明，例如「Claude · 理解故事、写讲稿」。直接读 provider 元数据，不加新文案 | 无 |
| 回答末尾，网页打开 | 密钥只存在这个浏览器里，调用时直接发给对应的服务，不经过别处，也不会导出。 / Keys stay in this browser. Each one goes straight to its own service when Lumi calls it, nowhere else, and is never exported. | `help.connect-provider.stored` |
| 回答末尾，双击文件打开 | 双击打开时不会保存密钥，关掉页面后要重新填。 / Opened as a file, Lumi doesn’t save keys, so you’ll enter them again next time. | `help.connect-provider.not-stored` |

- 规格里写的标题是「连接服务和 API 密钥」。帮助页现有 5 条都是问句，这里也写成问句，同时覆盖原第 3 条的「怎么知道连上了」。
- 「已连接 / Connected」是设置页 `providerStatusLabel` 现在的状态词，状态词改了这里跟着改。原第 3 条后半句「连上后，改讲稿、生成图片会自动用它」不保留。
- 列表只列需要密钥的 Claude、OpenAI、Gemini。即梦不用密钥，不列。

## 设置页顶部说明（改现有文案）

现有 `settings-note`（网页打开那版）也写了「不会上传」，一起改。双击文件打开那版不变。

| 现在 | 改成 | key |
|---|---|---|
| 用你自己的 API 密钥。密钥只存在这个浏览器里，不会上传或导出。 / Bring your own API keys. They stay in this browser and are never uploaded or exported. | 用你自己的 API 密钥。密钥只存在这个浏览器里，调用时直接发给对应的服务，不经过别处，也不会导出。 / Bring your own API keys. They stay in this browser, go straight to each service when Lumi calls it, and are never exported. | `settings.keys-note` |

## 没写的

- 费用、额度、免费次数：没有来源，不写。
- 「Claude 评分」相关：不在本次范围。

## 母语审校清单

| key | zh | en |
|---|---|---|
| `connection.blocked.claude` | 这一步要用 Claude，你的 Claude API 密钥还没连上。 | This step needs Claude, and your Claude API key isn’t connected yet. |
| `connection.blocked.openai` | 这一步要用 OpenAI 处理图片，你的 OpenAI API 密钥还没连上。 | This step uses OpenAI for images, and your OpenAI API key isn’t connected yet. |
| `connection.blocked.gemini` | 这个浏览器不支持语音识别，要用 Gemini 转写。你的 Gemini API 密钥还没连上。 | This browser can’t recognise speech, so voice input needs Gemini. Your Gemini API key isn’t connected yet. |
| `connection.degraded.gemini` | 正在用浏览器自带的语音识别。连上 Gemini，转写更准。 | Using your browser’s speech recognition. Connect Gemini for more accurate transcripts. |
| `connection.open-settings` | 去设置连接 {provider} | Connect {provider} in Settings |
| `connection.key-help` | 在哪里拿密钥，怎么填？ | Where do I get a key, and how do I add it? |
| `connection.get-key` | 在 {site} 创建 {provider} API 密钥 | Create a {provider} API key in {site} |
| `connection.paste-key` | 复制密钥，粘贴到上面的输入框，再点「连接」。 | Copy the key, paste it into the field above, then select Connect. |
| `connection.key-stored` | 密钥只存在这个浏览器里，调用 {provider} 时直接发给它，不经过别处，也不会导出。 | The key stays in this browser. It goes straight to {provider} when Lumi calls it, nowhere else, and is never exported. |
| `connection.key-not-stored` | 双击打开时不会保存密钥，关掉页面后要重新填。 | Opened as a file, Lumi doesn’t save the key, so you’ll enter it again next time. |
| `help.connect-provider.q` | 怎么填 API 密钥，怎么知道连上了？ | How do I add my API keys, and how do I know they work? |
| `help.connect-provider.a` | Lumi 用你自己的 API 密钥调用 AI 服务，每个服务一把。点下面的服务名，会跳到设置里它那一行，输入框旁边就有拿密钥的步骤。连上后，那一行会显示「已连接」。 | Lumi calls AI services with your own API keys, one key per service. Select a service below to jump to its row in Settings. The steps to get a key are right beside the field. Once it’s connected, the row shows Connected. |
| `help.connect-provider.stored` | 密钥只存在这个浏览器里，调用时直接发给对应的服务，不经过别处，也不会导出。 | Keys stay in this browser. Each one goes straight to its own service when Lumi calls it, nowhere else, and is never exported. |
| `help.connect-provider.not-stored` | 双击打开时不会保存密钥，关掉页面后要重新填。 | Opened as a file, Lumi doesn’t save keys, so you’ll enter them again next time. |
| `settings.keys-note` | 用你自己的 API 密钥。密钥只存在这个浏览器里，调用时直接发给对应的服务，不经过别处，也不会导出。 | Bring your own API keys. They stay in this browser, go straight to each service when Lumi calls it, and are never exported. |
