# 第 2 步：全身 Lumi vs 现状

## 结论

推荐采用 **全身 Lumi**。

现状的 StoryScore 小脸适合回答“现在的故事质量如何”；全身 Lumi 适合回答“谁正在陪我梳理，以及现在处于思考、反馈还是完成状态”。两者保留各自职责后，角色不会只是装饰，也不需要把分数卡改成更大的吉祥物组件。

比较稿只改变第 2 步的 Lumi 尺度与位置。问题行、StoryScore 内容、Composer、字体、按钮、浅色主题与 D「暮色书库」色阶都不改。桌面首行的纵向位置不变；390px 下首行下移 32px，以换取完整身体，但正文仍保留 358px 全宽。

## 观察与建议分开

### 已观察到的现状

- 当前 `main` 的第 2 步只有 StoryScore 内的 Lumi 小脸；它准确表达分数，但没有承载思考或成功反馈的全身舞台。
- 1512px 与 1905px 下，问题行横跨整个内容面，右侧有足够空间容纳一个教练栏。
- 390px 下，StoryScore 已是独立一行，正文宽度不能再缩成双栏。
- 旧 #35 同时改了多个步骤、问题行状态、Composer 与下载页，无法单独回答“第 2 步是否需要全身 Lumi”。本稿只保留其中仍有效的固定舞台原则。

### 本次建议

- 1200px 及以上：StoryScore 与全身 Lumi 组成右侧教练栏；问题继续在左侧单一阅读轴中。
- 721–1199px：StoryScore 与 160 × 180px Lumi 组成正常文档流中的横向教练带；问题列表继续使用全宽。
- 720px 及以下：StoryScore 保持全宽；64 × 56px 的完整 Lumi 放在第一章节标题右侧，不另建卡片。
- StoryScore 小脸继续显示分数情绪；全身 Lumi 承载 standing / thinking / jump 状态。不要把两者合并。

## 视觉概念

**概念：安静的共同编辑者。** Lumi 像坐在书桌另一侧的编辑伙伴：她在故事旁边出现，不压住故事本身。D 主题沿用已选的暖灰书库色阶和台面 / 光晕；浅色主题使用更轻的暖纸色台面。素材始终保持 100% 不透明度，角色本身不做夜间变色。

气质关键词：**温暖、安静、可信、陪伴、编辑感、黏土触感**。

## 颜色

应用颜色不因这项布局决定而改变。

| 角色 | 浅色 | D · 暮色书库 |
| --- | --- | --- |
| 页面 / base | `#F7F5F0` | `#211E1D` |
| 侧栏 / rail | 当前浅色 token | `#292523` |
| 内容面 / paper | 当前浅色 token | `#302B29` |
| 控件面 / surface | `#FFFFFF` | `#393330` |
| 抬升面 / elevated | 当前浅色 token | `#433C38` |
| 主文字 / ink | `#252A38` | `#F5F0EB` |
| 次文字 / muted | `#677181` | `#C7BDB6` |
| 必要边界 / line | `#E3E1DB` | `#998D85` |

Lumi 舞台使用独立 token：

| Token | 浅色 | D · 暮色书库 |
| --- | --- | --- |
| `stage-fill` | `#E5E1D9B8` | `#51484270` |
| `stage-ambient` | `#F5EFE788` | `#D5BFAE24` |
| `stage-highlight` | `#FFFFFFCC` | `#D8C7BA52` |
| `stage-shadow` | `0 20px 34px #5F51451A` | `0 18px 32px #00000030` |
| `media-shadow` | `drop-shadow(0 20px 24px #6154481C)` | `drop-shadow(0 18px 24px #00000042)` |

D 的正文、状态与必要边界 WCAG 表由 #75 固定，共 21 项全部通过；最低为 elevated 上的必要边界 `3.35:1`。本稿没有新增文字颜色，台面与 Lumi 都是装饰层，不承载信息或点击状态。

## 字体

沿用产品现有 sans 栈，不新增字体。

- 页面标题：24px / 600。
- 章节标题：16px / 600。
- 问题：14px / 500；当前问题可用 600。
- 回答：13px。
- StoryScore 标签、状态与说明：12–13px。
- 数字与状态继续使用现有等宽数字设置；Lumi 周围不新增标题、标签或说明文字。

## 布局与间距

| 视口 | 故事列 | 教练区 | Lumi 舞台 | 列间距 | 首行 y |
| --- | --- | --- | --- | --- | --- |
| 1905 | 1097px | 400px | 400 × 460px | 48px | 125.4px，和现状相同 |
| 1512 | 848px | 320px | 320 × 360px | 32px | 125.4px，和现状相同 |
| 721–1199 | 全宽 | StoryScore + 160px Lumi 的文档流教练带 | 160 × 180px | 24px | 随教练带下移 |
| 390 | 358px 全宽 | StoryScore 全宽；Lumi 在章节标题右侧 | 64 × 56px | 章节网格 12px | 293.4px，现状为 261.4px |

- 桌面教练栏顶部与标题顶部对齐，`top: 24px` sticky。
- StoryScore 与 Lumi 之间为 20px。
- Lumi 舞台、媒体画布和可见角色像素是三层。切换 standing / thinking / jump 时，舞台矩形不变。
- 390px 的章节网格为 `24px + minmax(0,1fr) + 64px`，左右内边距各 16px；问题行仍占满内容宽度。
- 只使用已有 8 / 12 / 16 / 20 / 24 / 32 / 48 / 64px 节奏。

## 组件与交互

- **StoryScore**：结构、开合、键盘焦点与 `去补` 行为不变。
- **全身 Lumi**：非交互、无 hover、无 tooltip、无新文案。
- **静止状态**：显示 `assets/lumi/source/standing.webp`。
- **输入 / Claude 等待**：在同一舞台内切换 thinking；不改变舞台尺寸。
- **分数上升**：jump 只播放一次，然后回到当前静止或思考状态。首次渲染和分数下降不播放。
- **滚动与标签页**：舞台离开视口或页面隐藏时暂停；回来从中性帧恢复。
- **减少动态效果**：只显示静止 standing 或 thinking 帧，不加载自动播放媒体。

## 图像方向

只使用 `assets/lumi/source/` 中已批准的黏土 Lumi。保留脸、发型、星星、围巾、比例、颜色与材质，不重绘、不加夜间滤色、不降低角色透明度。台面 / 光晕由 CSS token 构成，不复制外部插画或品牌资产。

## 无障碍

- 全身 Lumi 使用 `alt=""`、`aria-hidden="true"`、`pointer-events:none`；可访问含义由 StoryScore 数字、忙碌文本与问题状态承担。
- 预留固定舞台尺寸，媒体加载或换状态时不产生布局偏移。
- 保留 StoryScore 的焦点环、44px 触控目标与原有键盘开合。
- 390px 下 Lumi 不侵入问题行、Composer 或底部按钮；自动截图验证无横向溢出。
- 实现后由视觉校正补测手机软键盘、StoryScore 展开、`去补` 滚动、减少动态效果与离屏暂停。

## 验证结果

`capture.cjs` 从当前 `main` `55421ba` 生成现状与候选，共 12 个状态：390 / 1512 / 1905 × 浅色 / D 深色 × 现状 / 全身 Lumi。

- 12 个状态横向溢出均为 0。
- 12 个状态页面错误均为 0。
- 桌面候选的第一问题行 y 与现状完全相同。
- 390px 候选的第一问题行下移 32px；页面宽度与 StoryScore 尺寸不变。
- Lumi 的实测舞台：390 为 `64 × 56`，1512 为 `320 × 360`，1905 为 `400 × 460`。
- `CHECKS.json` 保存每个状态的 page、StoryScore、舞台与首行矩形。

## 给开发工程师

1. 只增加第 2 步的页面局部包装：`story copy`、`coach rail / strip` 与固定 `Lumi stage`。不要改 QuestionList、StoryScore 或 Composer 内部结构。
2. 1200px 起使用右侧教练栏；721–1199px 使用正常文档流教练带；720px 以下把 64 × 56px 舞台放进第一章节标题的第三列。
3. 把舞台尺寸、台面颜色、光晕、阴影与列间距做成 token。不要把数值写在媒体状态逻辑中。
4. 同一个 stage 容纳 still、WebM 与 WebP；媒体统一 `object-fit: contain`、`object-position: center bottom`，source 100% opacity。
5. 保留小脸与全身 Lumi 两套角色：小脸跟 StoryScore，完整身体跟输入 / 等待 / 分数上升状态。
6. 复用现有 `lumiAnim` 状态机；thinking 优先于 standing，jump 一次后回到当前状态。所有状态受 reduced motion、页面可见性和 IntersectionObserver 控制。
7. 在 390 / 1512 / 1905 浅深色回归 StoryScore 关闭 / 展开、当前问题、Composer 聚焦和减少动态效果；实现 PR 由视觉校正按固定 SHA 对比本稿。

## 研究与来源

- [当前 `main` `55421ba`](https://github.com/lujin88/Lumi-Storytelling/commit/55421ba) — 本次现状基线。
- [PR #75：D 暮色书库](https://github.com/lujin88/Lumi-Storytelling/pull/75) — Lu 选择的深色方向、台面 / 光晕与完整 WCAG 表。
- [PR #35：旧全身 Lumi 布局](https://github.com/lujin88/Lumi-Storytelling/pull/35) — 只保留固定舞台和 score / full-body 分工；旧多页面改造不沿用。
- [`design-system/README.md`](../../../design-system/README.md) 与 [`design-system/tokens.json`](../../../design-system/tokens.json) — 现有字体、间距、组件与动效约束。
- [`assets/lumi/README.md`](../../../assets/lumi/README.md) 与 [`assets/lumi/source/standing.webp`](../../../assets/lumi/source/standing.webp) — 已批准角色外观与动画素材规则。
- [`decisions.md`](../../../decisions.md) — Lu 的角色素材、尺寸与检查宽度决定。
- [`CHECKS.json`](./CHECKS.json)、[`candidate.css`](./candidate.css)、[`capture.cjs`](./capture.cjs) — 本稿的可复现布局、测量与截图脚本。

本稿没有使用外部艺术作品、Pinterest 图片、品牌资产或受保护布局；它只组合当前产品结构、已批准 Lumi 素材与 Lu 已选的 D 色阶。
