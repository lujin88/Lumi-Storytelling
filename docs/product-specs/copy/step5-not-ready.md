# 第 5 步（下载页）：还没准备好

文案在 `step5-not-ready.json`，开发照抄进 `index.html` 的 `publishViewV2`，用 `t(zh, en)`。

「什么算没准备好」由 Lu 定（A：只有空项目；B：低分也算）。在 Lu 回复前按 A 写。

| 位置 | 现在 | 没准备好时 | key |
|---|---|---|---|
| 页面标题 | 你的故事，准备好了。 / Your story is ready. | 你的故事还没准备好。 / Your story isn’t ready yet. | `publish.notReady.title` |
| 标题下一行 | 草稿只存在这个浏览器里，下载一份带走。 / Drafts live only in this browser. Take a copy. | 先回到「收集素材」，把你知道的写下来。 / Go back to Gather and write down what you know. | `publish.notReady.subtitle` |
| 评分卡分数下面一行 | {weak} 项可加强 · 下载后仍可继续编辑 / {weak} could be stronger · You can keep editing after downloading | 还没有内容可以评分 / Nothing to score yet | `publish.notReady.scoreNote` |
| 评分卡右边的状态 | 已准备 / Ready | 不显示 | 无 |

- 状态不显示：标题已经说了没准备好，再放一个「未准备」是重复的；`dl-ready` 用的是 `ok` 色，换成别的字也不该再用这个颜色。
- 标题下一行：只对 A（空项目）成立。如果 Lu 选 B，有内容的低分故事不该被叫回「收集素材」，这一行要另写，标题可以不变。
- 评分卡这一行整行换掉，「下载后仍可继续编辑」也不留：空项目没有东西可以下载后再编辑。不加句号，和现在这一行一致。「最终评分 0/10」不变。
- 「收集素材 / Gather」是第 1 步现在的名字（`index.html`），步骤改名时这一行跟着改。

## 写了素材、但一题都没对上

第 1 步有素材，第 2 步的问题一个都没有答案（没有「你的回答」也没有「从材料中找到」）。标题和「已准备」不显示照旧，换下面两行：

| 位置 | 文案 | key |
|---|---|---|
| 标题下一行 | 素材里还找不到这些问题的答案。先到「找到故事」答几个。 / Your notes don’t answer the story questions yet. Answer a few in Find the story. | `publish.notReady.subtitleNoAnswers` |
| 评分卡分数下面一行 | 还没有答案可以评分 / No answers to score yet | `publish.notReady.scoreNoteNoAnswers` |

- 评分卡也要换：这类用户写过素材，「还没有内容可以评分」对他同样不准。
- 「找到故事 / Find the story」是第 2 步现在的名字（`index.html`），改名时跟着改。
- 两种状态怎么分由开发按数据判断：没有素材 → 上一节；有素材、0 个问题有答案 → 这一节。

## 母语审校清单

| key | zh | en |
|---|---|---|
| `publish.notReady.title` | 你的故事还没准备好。 | Your story isn’t ready yet. |
| `publish.notReady.subtitle` | 先回到「收集素材」，把你知道的写下来。 | Go back to Gather and write down what you know. |
| `publish.notReady.scoreNote` | 还没有内容可以评分 | Nothing to score yet |
| `publish.notReady.subtitleNoAnswers` | 素材里还找不到这些问题的答案。先到「找到故事」答几个。 | Your notes don’t answer the story questions yet. Answer a few in Find the story. |
| `publish.notReady.scoreNoteNoAnswers` | 还没有答案可以评分 | No answers to score yet |
