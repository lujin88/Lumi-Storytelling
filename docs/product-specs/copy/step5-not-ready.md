# 第 5 步（下载页）：还没准备好

文案在 `step5-not-ready.json`，开发照抄进 `index.html` 的 `publishViewV2`，用 `t(zh, en)`。

「什么算没准备好」由 Lu 定（A：只有空项目；B：低分也算）。在 Lu 回复前按 A 写。

| 位置 | 现在 | 没准备好时 | key |
|---|---|---|---|
| 页面标题 | 你的故事，准备好了。 / Your story is ready. | 你的故事还没准备好。 / Your story isn’t ready yet. | `publish.notReady.title` |
| 标题下一行 | 草稿只存在这个浏览器里，下载一份带走。 / Drafts live only in this browser. Take a copy. | 先回到「收集素材」，把你知道的写下来。 / Go back to Gather and write down what you know. | `publish.notReady.subtitle` |
| 评分卡右边的状态 | 已准备 / Ready | 不显示 | 无 |

- 状态不显示：标题已经说了没准备好，再放一个「未准备」是重复的；`dl-ready` 用的是 `ok` 色，换成别的字也不该再用这个颜色。
- 标题下一行：只对 A（空项目）成立。如果 Lu 选 B，有内容的低分故事不该被叫回「收集素材」，这一行要另写，标题可以不变。
- 「收集素材 / Gather」是第 1 步现在的名字（`index.html`），步骤改名时这一行跟着改。

## 母语审校清单

| key | zh | en |
|---|---|---|
| `publish.notReady.title` | 你的故事还没准备好。 | Your story isn’t ready yet. |
| `publish.notReady.subtitle` | 先回到「收集素材」，把你知道的写下来。 | Go back to Gather and write down what you know. |
