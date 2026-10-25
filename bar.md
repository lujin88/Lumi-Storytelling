# 质量标杆（bar）

`design-system/` 管"能用什么"，这一页管"要做到什么程度"。由 UX 调研员从参考里拆出来，Lu 合并后生效。视觉校正按这一页判定通过或不通过。

Lumi 是把项目笔记变成面试／汇报故事的桌面网页工具（`brief.md`）。参考按它的六个模块找：第 1 步收集素材、第 2 步找到故事（含故事评分）、第 3 步页面和讲稿、第 4 步追问准备、第 5 步下载文件、设置页，外加贯穿各页的吉祥物 Lumi。参考全部来自 Mobbin Web 库，2026-10-25 查看；每个模块 1–3 个，只挑和 Lumi 同一种工作（AI 起草、评分、出幻灯片、配置密钥、导出）的屏。

## 参考
每条一行：哪个产品｜哪一屏或哪个流程｜Mobbin 链接｜为什么选它。必须具体到某一屏，不能只写产品名。

| 产品 | 哪一屏 / 流程 | 链接 | 为什么选它 |
|---|---|---|---|
| Chronicle（Web） | Creating with AI (paste text)：第 2 屏「Paste content」、第 3 屏「Storyline」、第 4 屏生成中的标题页 | https://mobbin.com/flows/bca3dce5-4889-4366-9ce5-b938ba440579 | 和 Lumi 第 1→2→3 步同一条路：贴笔记 → 编号大纲（每段可选「6 points in grid」）→ 生成演示。生成中只在右下角一行「Creating chapters (4/5 done) · Stop」，页面不盖层 |
| GoFundMe（Web） | 「Tell donors your story」（4 of 6） | https://mobbin.com/screens/d09dcb10-d11b-4cd1-aeb2-228ab6081186 | 分步向导里写自己的故事：左栏只有步数和标题，右栏一个输入框，下面一块「Strengthen your story」给判断（Great work!）和 4 个可改的方面，右下一个 Continue |
| Semrush（Web） | Content Optimizer 侧栏（Content score 86%） | https://mobbin.com/screens/47b3a583-3685-4dfd-8fb7-604128bde422 | 评分卡的完整写法：环形分数 + 一句话判断「Ready to rank」+ 行业对比 + 「Improvements (by importance)」按重要性排的修复项，每项一行可点 |
| Grammarly（Web） | 文档编辑器 + Review suggestions（92 Overall score） | https://mobbin.com/screens/82d0d01f-8aa2-4fe4-a658-1498c92fb1ae | 分数在文档顶部一个小 pill 里，展开才看到 5 个维度各一条进度条；建议卡上是「Accept / Dismiss」两个动作，接受前不改正文 |
| Remote（Web） | 职位描述「Revise with AI」结果面板 | https://mobbin.com/screens/44344cb5-9817-4d0e-b696-e8ba936b2f82 | AI 改写先放在右侧面板，底部「Try again / Use this」，用户点 Use this 才进正文：草稿和正文分得清 |
| Gamma（Web） | Generating a Gamma (generate)：「Create with AI」入口、Outline 编号大纲、主题缩略图 | https://mobbin.com/flows/057f03fc-927f-4b48-bd1b-91413b8dc962 | 大纲是编号卡片 + 每张 3–4 条要点，底栏写「5 cards total」和一个 Generate；主题选择是带名字的缩略图网格；入口页吉祥物（猫）从「Recommended」卡后探头，气泡「Not sure? Start here!」指向推荐项 |
| Manus（Web） | Editing slides：左侧缩略图列 + 模板选择弹窗 | https://mobbin.com/flows/6710c791-12f9-43c7-9ddd-5cea25cd674e | 幻灯片缩略图是整页等比缩小、同宽、编号在下方、当前页描边；模板弹窗每个模板一张缩略图加名字；底部一行讲稿输入 |
| Magnific（Web） | Generating an AI presentation：风格网格 + 底部编号胶片条 | https://mobbin.com/flows/4e0505bc-539c-4f8d-876e-f01a14fde7f2 | 和 Lumi 第 3 步一样有「风格」和「每页一行」：胶片条每张缩略图左下角一个编号块，当前页蓝框；风格是两列缩略图，选中的描边 |
| Workable（Web） | Starting a video interview (preview)：第 3 屏答题页 | https://mobbin.com/flows/1b962f65-d4a4-447d-9fa5-6fcb548fbdea | 追问准备的同类布局：左栏按小节分组的编号问题列表（当前题高亮），中间问题卡写「Answer time / Number of takes」这类元信息，右侧作答区 |
| Wellfound（Web） | Answering a Q&A（个人资料问答） | https://mobbin.com/flows/0f5e0bbb-c5c9-4472-bd3a-89cd7fefd06b | 一题一卡：问题 + 输入框（0/250 计数）+ Save / Skip；答完的题收成一行，右侧「Edit · Remove」文字链接 |
| Midday（Web） | Downloading files（Vault 列表多选下载） | https://mobbin.com/flows/cfedd50d-0a5b-4d6c-b6a1-b6b979b0e74f | 每行文件名 + 标签 + 大小；勾选后底部浮一条「4 selected · Deselect all · Download ↓」，点击后按钮原位变 loading |
| Basecamp（Web） | Exporting data：「What would you like to export?」+「Here's your Basecamp export」 | https://mobbin.com/flows/1c92b658-10da-4e2b-a3f2-93174be87d2d | 导出清单上方「Select all / Select none」，一个绿色主按钮；导出完是单独一屏只有一个 Download 按钮和生成时间 |
| Braintrust（Web） | Adding an AI provider：AI providers 表 + 「Configure Anthropic API key」弹窗 | https://mobbin.com/flows/bbe9399b-4c4e-4f21-a397-b614e71f627c | 和 Lumi 设置页同一张表：每行服务商 logo + 名字 + 环境变量名、Status（灰字「Not configured」／「✓ Configured」）、Last updated、编辑笔；弹窗里密钥遮住、「Test key」次要按钮在前、Save 主按钮在后；成功只一条右下 toast |
| Adaline（Web） | Adding a provider：Providers 列表 + 「Add OpenAI」弹窗 | https://mobbin.com/flows/0e7b63ea-086c-472a-bbbb-277bcaeb4bee | 同一种表的另一种写法：列表每行一个 ⊕，弹窗只有 Name、API key、可选 Base URL；已配置的在该服务商下缩进一行显示名字和日期 |
| Duolingo（Web） | 课后「Come back tomorrow for streak day 3!」 | https://mobbin.com/screens/0b6352b1-dfe8-4cf4-9001-a282ae01b66f | 吉祥物和它解释的东西放一起：Duo 在提示句下方、周历卡上方，约占左半屏高度的 1/4（估算），不盖任何内容 |
| Homerun（Web） | 「Before we get started…」入职问卷首屏 | https://mobbin.com/screens/e097ff5f-509b-415d-ab20-6b7e0669a2ea | 左文右图的首屏：吉祥物单独占右半的浅底，高度约和左侧标题块相当（估算）；同 Lumi 第 1 步的布局 |

**Mobbin 不够的地方和替代来源**
- **动效**：Mobbin 只有静态截图，看不到 Lumi 的 wave／cheer／jump 怎么动、多长、是否循环。动效按 harness-core 的 docs/motion.md 和项目层 `design-system/` 判，角色动画的做法参考 Duolingo 自己写的两篇：https://blog.duolingo.com/world-character-visemes 、https://blog.duolingo.com/building-character/ （状态机驱动、答对才播反应、空闲时眨眼点头）。这一页不写动效数值。
- **中文排版和双语**：Mobbin Web 库里这类产品都是英文界面，中文行高、字号、每行字数没有可量的参考，相关数值暂按 `design-system/tokens.json`，标「待确认」。
- **文案**：参考里的按钮和提示文字只用来看「放在哪、几个字」，用词归项目层文案规则（`design-system/` 下，待建）和 UX Copywriter。

## 机制（5–7 条）
每条都要能看一眼判断对错，并写明从哪张参考里量出来的。不写形容词（"高级""干净""有层次感"都不算）。

| # | 机制 | 怎么检查 | 出自哪张参考 |
|---|---|---|---|
| 1 | **AI 草稿有可见标记，用户改过才消失。** Lumi 起草的答案（第 2 步六问、第 4 步「你的回答」）带「初稿」chip；用户编辑过的行没有 chip；没有标记就等于用户自己写的，不允许 | 载入示例或起草后，逐行看：Lumi 写的每一行都有「初稿」chip；改任意一行后 chip 消失；chip 用 `design-system/` 的状态 chip，不是填色块 | Remote（AI 改写留在侧栏，「Use this」才进正文）；Grammarly（建议卡「Accept / Dismiss」，接受前不动正文）；Chronicle 第 3 屏右下「Storyline created · Retry · Accept」 |
| 2 | **评分卡 = 数字 + 一句话判断 + 按重要性排的修复项。** 分数旁边必须有一句用词判断（不是只写「只看完整度」）；展开后每个维度一行，缺口最大的排最上，每行有一个能跳到对应问题的「修」链接 | 打开第 2 步评分卡：收起态能看到分数和一句判断；展开态数每行：都有维度名 + 状态 + 一个文字链接；点链接后对应问题行变成当前行。顺序：缺材料 > 待确认 > 已答 | Semrush（86% + 「Ready to rank」+「Improvements (by importance)」）；Grammarly（92 + 五个维度各一条）；GoFundMe（「Strengthen your story · Great work!」+ 4 个方面） |
| 3 | **生成中是一行字，不是一层灰。** Claude／OpenAI 调用进行时：一行状态（做什么 + 进度或件数）+ 文字链接「取消」，固定在 composer 上方；页面内容不变灰、不加遮罩、不弹窗 | 发起一次起草或审稿，截图：正文文字对比度和平时一样（`getComputedStyle` 的 opacity 为 1，无 overlay 元素）；状态只占一行，高度 ≤ 一个 `control-h`（40px）；有「取消」 | Chronicle 第 4 屏（标题页可读，右下「Creating chapters (4/5 done) · Stop」）、Importing content 屏（同样一行 + Stop）；Google Gemini canvas「Creating slides… · Ready in a few mins」在画布内一行 |
| 4 | **幻灯片缩略图是整页等比缩小，同宽、带编号、当前页描边。** 每张缩略图四条边都在，页内文字不被裁；所有缩略图同一宽度；编号紧贴缩略图；当前页（或正在编辑的页）有 1–2px `action-line` 描边，其他没有 | 第 3 步和第 5 步预览：截图放大看每张缩略图的右边和下边是否被裁；量所有缩略图宽度是否相等；数描边的缩略图只有 1 张。参考里缩略图宽约为视口宽的 12–13%（Manus ≈ 90/768，Magnific ≈ 100/768，估算），Lumi 的 224px/1440 ≈ 15%，在同一量级 | Manus（左侧缩略图列，编号在下，第 3 张蓝框）；Magnific（底部胶片条，编号块在左下角，第 1 张蓝框） |
| 5 | **设置表每行四件事：状态词、灰／正常、遮住的密钥、先连再存。** 每个服务商一行：状态用圆点 + 词（未连接／已连接），未连接整行次要色，已连接显示 ✓ 和什么时候连的；密钥输入框默认遮住、有显示切换；「连接」是次要按钮，密钥为空时禁用；成功只有一条一行的提示，错误留在那一行里 | 打开设置页：数每行有没有圆点 + 状态词；输入密钥前「连接」是否禁用；输入时是否遮住；连接成功后是否出现 ✓ + 时间；故意输错密钥，错误是否在该行内而不是页面顶部 | Braintrust（Status「Not configured」灰字／「✓ Configured」+ Last updated「just now」；弹窗「Test key」在「Save」前；toast「Secret saved successfully」）；Adaline（已配置项缩进一行显示名字和日期） |
| 6 | **下载清单：默认全选，每行有类型，按钮只有一个，旁边写清会得到什么。** 每行文件名 + 扩展名（参考还有大小）；全部默认勾选；只有一个主按钮；按钮内或紧邻处写当前选了几个、1 个时下载它本身、多个时打包成 ZIP | 第 5 步：数勾选框默认全勾；数填色按钮 = 1；取消勾到只剩 1 个和 0 个，看按钮文字或旁边说明是否跟着变，0 个时按钮禁用 | Midday（底部「4 selected · Deselect all · Download ↓」，取消全选后条消失）；Basecamp（「Select all / Select none」+ 一个主按钮；导出完单独一屏只一个 Download）；Adobe Express（Download 面板一个主按钮，格式旁「Recommended」标签） |
| 7 | **吉祥物一屏一处，挨着它解释的东西，不比旁边内容高。** 每一屏最多一个 Lumi；它紧贴自己说明的内容（第 1 步的表单、第 2 步评分卡、第 5 步文件卡）；高度不超过它旁边那块内容的高度；不压在任何文字或控件上 | 第 1、2、5 步各截一张：数 Lumi 出现次数 = 1；量 Lumi 外框高度 ÷ 相邻内容块高度 ≤ 1（参考里 Homerun ≈ 1、Duolingo ≈ 1/4、Gamma 猫 ≈ 1/3，均为估算）；Lumi 外框和任何文字／按钮外框不相交 | Gamma「Create with AI」（猫从 Recommended 卡后探头，气泡指向它）；Duolingo（Duo 在提示句和周历之间）；Homerun（右半单独一块浅底放吉祥物） |

## 适用范围
- 这一页管哪些屏或模块：第 1 步收集素材、第 2 步找到故事（含评分卡）、第 3 步页面和讲稿、第 4 步追问准备、第 5 步下载文件、设置页；以及 Lumi 在这些页上的位置、数量和大小（机制 7）。宽度按 `AGENTS.md` 的检查宽度。
- 不管哪些：导出文件本身（HTML 演示、讲稿 `.md`）的版式；Lumi 动画的时长、曲线、循环（归 harness-core 的 docs/motion.md 和项目层 `design-system/`）；720px 以下的手机布局（参考全是桌面 Web，待确认）；帮助页和 GitHub Pages 发布指引。
