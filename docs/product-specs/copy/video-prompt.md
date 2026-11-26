# 视频提示词和格式说明（任务 V2）文案

文案在 `video-prompt.json`，开发照抄进 `index.html`，用 `t(zh, en)`。决定：decisions.md 2026-10-27「Video: Lumi connects no video provider …」（#43 `3a99ee1`，Lu 选 A）。界面位置等 V1 设计（视觉设计师）定，这里只给文字。

## 复制视频提示词（第 3 步，每张幻灯片的编辑弹窗）

| 什么时候 | 文案 | key |
|---|---|---|
| 按钮 | 复制视频提示词 / Copy video prompt | `video-prompt.copy` |
| 点了按钮，Claude 在写（沿用 busy line，`aria-live="polite"`） | Claude 正在为这张幻灯片写视频提示词… / Claude is writing a video prompt for this slide… | `video-prompt.generating` |
| 写好并复制成功 | 已复制视频提示词 / Video prompt copied | `video-prompt.copied` |
| 写好了，但写剪贴板失败 | 没能自动复制。选中下面的提示词，手动复制。 / Couldn’t copy automatically. Select the prompt below and copy it. | `video-prompt.copy-failed` |
| 写失败（网络、返回空），不是密钥问题 | 没能写出视频提示词，再试一次。 / Lumi couldn’t write the video prompt. Try again. | `video-prompt.failed` |
| 没连 Claude（`aiReady('claude')` 为假） | 写视频提示词要用 Claude，你的 Claude API 密钥还没连上。 / The video prompt needs Claude, and your Claude API key isn’t connected yet. | `video-prompt.blocked` |

- 没连 Claude：句末接 #62 的 `connection.open-settings`（「去设置连接 {provider}」），写法照 #62 的 `connection.blocked.claude`。服务商拒绝密钥（`aiError.kind` 为 `key`/`credit`）时，前半句用现在的 `providerErrorText`，不用 `video-prompt.failed`。
- `copy-failed` 要求界面上能看到提示词原文：项目经理 2026-10-27 已定，V1 设计在弹窗里显示原文（可选中）。原因：Claude 写完再复制，中间隔了一次网络请求；有的浏览器要求复制紧跟着点击，隔开后会拒绝（Safari 尤其，未实测）。不留原文，这一行就没有退路。
- 「Claude 正在…」点名 Claude：#66 帮助页写了幻灯片内容会发给 Claude，这里让用户知道这一步也发了。

## 格式说明（同一个弹窗）

| 位置 | 文案 | key |
|---|---|---|
| 小标题 | 视频格式 / Video format | `video-format.title` |
| 一句话流程 | 复制提示词，在你常用的视频工具里生成视频，再点「换成视频」放到这张幻灯片上。 / Copy the prompt, make the video in any tool you like, then select Use a video to add it to this slide. | `video-format.steps` |
| 格式 | 格式：{formats} / Format: {formats} | `video-format.type` |
| 画面 | 画面：横屏 {ratio}，和幻灯片一样 / Shape: landscape {ratio}, same as the slides | `video-format.shape` |
| 时长 | 时长：{length} 以内 / Length: up to {length} | `video-format.length` |
| 大小 | 大小：{size} 以内 / Size: up to {size} | `video-format.size` |

**数字一律是占位符，等 V3 开发量出来再填，不写进文案**（项目经理 2026-10-27：「格式里的数字等开发量出来再填」）：

| 占位符 | 现在知道的 | 谁填 |
|---|---|---|
| `{formats}` | 待确认。现在上传框收 `video/mp4,video/webm,video/quicktime`（main `index.html`，`data-deck-video`），但浏览器能不能放、导出包能不能带，要开发量 | V3 |
| `{ratio}` | 待确认。main 的 CSS 里有 4 处 `aspect-ratio:16/9`，看起来是幻灯片比例，开发确认后填 | V3 |
| `{length}` | 待确认。没有任何出处。量不出硬上限的话，**这一行整行不显示**，不要编一个建议时长（项目经理 2026-10-27 同意） | V3 / 项目经理 |
| `{size}` | 待确认。现在代码里写死 40MB（「视频太大了，控制在 40MB 以内。」），没有出处，要按导出包和浏览器存储重新量 | V3 |

- 「换成视频」是弹窗里现有按钮的字（`换成视频` / `Use a video`），按钮字改了这里跟着改。
- 「你常用的视频工具」不点名任何服务商：decisions.md 写 Lumi 不连任何视频服务商。

## 上传报错

| 什么时候 | 文案 | key |
|---|---|---|
| 文件超过上限（**替换**现在写死 40MB 的那句） | 视频太大了，控制在 {size} 以内。 / Video too large. Keep it under {size}. | `video.too-large` |
| 格式浏览器放不了（新加） | 这个格式放不了，换成 {formats} 再试。 / This format won’t play here. Use {formats} instead. | `video.unsupported` |
| 放上了，也存进了浏览器（#72 加） | 已换成视频。 / Video added. | `video.added` |
| 放上了，但存进浏览器失败（IndexedDB 满了或被浏览器拒绝；这次还能看、能下载，刷新就没了）（#72 加） | 已换成视频，但浏览器没能保存它。刷新页面后，要重新上传。 / Video added, but the browser couldn’t save it. Upload it again after you reload the page. | `video.not-kept` |
| 放视频时出了别的错（原因不明）（#72 加） | 没能换成视频。再试一次，或者换一个文件。 / Couldn’t add the video. Try again or use another file. | `video.add-failed` |

- `{size}`、`{formats}` 和格式说明读同一个常量，两处数字不会对不上。
- `video.not-kept` 先说「已换成视频」：视频这次确实放上了，用户不用马上重传，只是刷新后会丢。
- `video.add-failed` 替换 #72 里的「这个视频读不出来，换一个文件再试。」。#72 `3b5a542` 的 `videoPlayable` 遇到坏文件或解不开的格式返回 false，走的是 `video.unsupported`，不会进这个 `.catch`；进 `.catch` 的只剩放视频时的意外错误，原因不明，所以不说「读不出来」。

## 要开发和设计注意
- **提示词用什么语言写**：用这张幻灯片内容的语言，不跟界面语言（项目经理 2026-10-27，依据 decisions.md「Lumi 用用户写的语言回复」）。归 V3 的 `prompts/video-prompt.md`。界面上不加「提示词是英文」之类的说明。
- **刷新后视频还在**：V3 做完后，PRD（`docs/product-specs/prd.md`）第 43、253 行「not saved to the browser yet」和 Backlog 第 509 行要改，归 PRD 的负责人。帮助页 #66 的「Claude：…幻灯片和讲稿」已经覆盖提示词这一步发的内容，不用改；上传的视频不发给任何服务，也不用加。

## 检查
- `python3 harness-core/scripts/copycheck/copycheck.py --pairs docs/product-specs/copy/video-prompt.json`：0 个错误，0 个警告（harness-core main，项目没有 `copy-rules.json`）。

## 母语审校清单

和 #69 的服务商报错合成一批，见 `native-review-2026-10-27.md`（项目经理 2026-10-27 定）。
