# 第 5 步下载报错（#72 导出超大小）文案

文案在 `export-errors.json`，开发照抄进 `index.html`，用 `t(zh, en)`。需求：项目经理 2026-10-27（#72 线程）：嵌进演示文件的视频加起来超过上限时不下载，在「下载」按钮旁显示报错；下载过程中其他异常也要接住，不能静默失败。

| 什么时候 | 文案 | key |
|---|---|---|
| 勾了「演示文件」，视频总大小超过上限，下载前就拦下 | 下载没成功：演示文件里的视频加起来太大，浏览器处理不了。回到「页面和讲稿」，移除几个视频或换成小一点的，再下载。 / Download failed. The videos in the presentation add up to more than the browser can handle. In Slides & script, remove some videos or use smaller ones, then download again. | `export.videos-too-large` |
| 下载过程中其他异常（原因不明） | 下载没成功，再试一次。 / Download failed. Try again. | `export.failed` |

- 第 5 步按钮上的字是「下载 / Download」，所以报错用「下载」，不用「导出」。
- 「页面和讲稿 / Slides & script」是第 3 步的名字，视频在那一步每张幻灯片的编辑弹窗里移除（按钮「移除视频 / Remove video」）。步骤名改了这里跟着改。
- 不写具体 MB 数（项目经理 2026-10-27：上限以后可能变）。
- 原因不明的异常用 `export.failed`，不用 `export.videos-too-large`：没查出是视频太大，就不能告诉用户是视频太大。
- 勾了好几个文件时会打包成一个 ZIP，超过上限时整个 ZIP 都不下载，所以开头写「下载没成功」，不写「演示文件没下载」。

## 检查
- `python3 harness-core/scripts/copycheck/copycheck.py --pairs docs/product-specs/copy/export-errors.json`：0 个错误，0 个警告（harness-core main）。

## 母语审校
已加进 `native-review-2026-10-27.md`。
