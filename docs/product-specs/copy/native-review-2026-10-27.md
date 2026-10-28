# 母语审校清单（2026-10-27 这一批）

项目经理 2026-10-27 定：#68 的视频提示词文案和 #69 的服务商报错一起审，不分两次。中文、英文各一遍。审完回「通过」，或者指出哪句别扭、建议怎么改。说明在同目录的 `video-prompt.md` 和 `provider-errors.md`。

## 视频提示词和格式说明（#68，`video-prompt.json`）

| key | 中文 | English |
|---|---|---|
| `video-prompt.copy` | 复制视频提示词 | Copy video prompt |
| `video-prompt.generating` | Claude 正在为这张幻灯片写视频提示词… | Claude is writing a video prompt for this slide… |
| `video-prompt.copied` | 已复制视频提示词 | Video prompt copied |
| `video-prompt.copy-failed` | 没能自动复制。选中下面的提示词，手动复制。 | Couldn’t copy automatically. Select the prompt below and copy it. |
| `video-prompt.failed` | 没能写出视频提示词，再试一次。 | Lumi couldn’t write the video prompt. Try again. |
| `video-prompt.blocked` | 写视频提示词要用 Claude，你的 Claude API 密钥还没连上。 | The video prompt needs Claude, and your Claude API key isn’t connected yet. |
| `video-format.title` | 视频格式 | Video format |
| `video-format.steps` | 复制提示词，在你常用的视频工具里生成视频，再点「换成视频」放到这张幻灯片上。 | Copy the prompt, make the video in any tool you like, then select Use a video to add it to this slide. |
| `video-format.type` | 格式：{formats} | Format: {formats} |
| `video-format.shape` | 画面：横屏 {ratio}，和幻灯片一样 | Shape: landscape {ratio}, same as the slides |
| `video-format.length` | 时长：{length} 以内 | Length: up to {length} |
| `video-format.size` | 大小：{size} 以内 | Size: up to {size} |
| `video.too-large` | 视频太大了，控制在 {size} 以内。 | Video too large. Keep it under {size}. |
| `video.unsupported` | 这个格式放不了，换成 {formats} 再试。 | This format won’t play here. Use {formats} instead. |

## 服务商报错（#69，`provider-errors.json`）

| key | 中文 | English |
|---|---|---|
| `provider-error.gone.check` | {provider} 停用了 Lumi 检查密钥用的接口，跟你的密钥无关。Lumi 更新后才能连上。 | {provider} has retired the endpoint Lumi uses to check keys. Your key isn’t the problem; Lumi needs an update before it can connect. |
| `provider-error.gone.model` | {provider} 停用了你选的模型。去设置换一个模型，再试一次。 | {provider} has retired the model you chose. Pick another one in Settings, then try again. |
| `provider-error.gone.only-model` | {provider} 停用了 Lumi 用的模型。Lumi 更新后才能再用。 | {provider} has retired the model Lumi uses. Lumi needs an update before you can use it again. |
| `provider-error.denied` | {provider} 拒绝了这次请求，可能是地区或账号权限的问题。 | {provider} refused this request. It may be your region or account permissions. |

`{provider}` 是服务商名（Claude、OpenAI、Gemini），不翻译。`{formats}` `{ratio}` `{length}` `{size}` 的数字等开发量出来再填。
