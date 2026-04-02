# Workspace UI 设计反馈

日期：2026-04-01

## 文档定位

这份反馈的目的很简单：

- 说明当前入口页哪些方向是对的，应该保留
- 说明下一轮设计具体要改什么
- 说明 3 个工作区里分别应该重点体现哪些场景
- 说明这轮先不要展开哪些内容

## 总体结论

当前 `3 个 workspace` 的结构是对的，建议保留：

1. `Operations`
2. `Support`
3. `Growth`

这轮不需要增加更多一级页面。

下一轮设计的重点不是改信息架构，而是把这 3 个工作区做得更清楚、更像实际工作入口，而不是普通模块入口。

目前入口页的问题主要有 4 个：

1. 顶部信息层级还不清楚
2. 每张卡片更像模块介绍，不像工作入口
3. `Growth` 目前仍然以 `Coming Soon` 方式呈现，价值主线不够明确
4. 页面还没有明确体现“结果、判断依据、后台过程、审计记录”这几层关系

## 1. 顶部信息架构

顶部这一块建议简单处理，不要塞太多平台术语。

我们做的是全球 ISP 业务，所以这里更重要的是把“品牌、客户层级、当前工作区、当前用户”表达清楚。

建议顶部按下面这 4 层来设计：

1. `品牌`
2. `客户层级`
3. `当前工作区`
4. `当前用户`

建议的客户层级是：

`Region -> ISP -> Sub Group -> Subscriber -> Location -> Home / Office`

含义上可以理解为：

- `品牌`：例如 `Heights Telecom` 或 `Veklus`
- `Region`：地区
- `ISP`：客户主体
- `Sub Group`：ISP 下的分组、事业部、渠道组或运营组
- `Subscriber`：subscriber 或 account 级对象
- `Location`：场所
- `Home / Office`：具体家庭或办公室

这里的反馈重点是：

- 左上角可以继续保留品牌，例如 `Heights Telecom` 或 `Veklus`
- 顶部中间应该体现客户层级，而不是只放一个模糊的范围词
- `Workspace` 要单独显示，不要和客户层级混在一起
- 右上角保留登录操作人员信息

建议做法：

- 第一行：品牌 + 登录操作人员
- 第二行：客户层级 + 当前工作区

示例：

- 第一行：`Heights Telecom` | `Logged in as ops-admin@acme.com`
- 第二行：`APAC / ISP / Sub Group / User / Location / Home` | `Workspace: Support`

如果这一行太长，也可以把第二行拆成左右两块：

- 左侧：客户层级 breadcrumb
- 右侧：当前 `Workspace`

这里不建议在普通工作区顶部过多强调 `Tenant`、`Organization`、`Scope` 这些平台术语，因为对设计师来说，先把“层级关系”画对更重要。

## 2. 入口页反馈

当前 `Choose your workspace` 这个方向可以保留，但需要更明确表达这是“进入工作区”，不是“进入功能模块”。

每张卡片建议都包含这 4 类信息：

1. 一句定位
2. 主要处理对象
3. 关键场景
4. 进入按钮

如果需要放示例问题，也可以放，但它们是辅助，不是主角。

卡片重点应该是：

- 这个工作区主要做什么
- 为什么用户会进入这个工作区
- 这里最典型的 1 到 2 个场景是什么

不建议把卡片做成一堆功能点罗列，因为那样会重新退回传统 dashboard 导航页。

### 关于预设场景和预设问题

这一点建议在设计里明确处理。

我们知道当前 backend 还没有真正完整的自然语言能力，所以这一阶段使用
`pre-defined scenarios` 或 `starter prompts` 是可以接受的。

但这里有一个明显风险：

- 如果设计方式不对，用户会误以为我们只是把 `static dashboard` 换成了
  `fixed query`

这会和我们真正想表达的方向有落差。我们想表达的是：

- 用户是从一个问题开始
- 系统根据这个问题组织结果
- 页面是“由问题驱动生成的结果视图”，而不是一个固定报表页换了个标题

因此建议在 UI 上做下面几件事，来减少“fixed query”感：

1. 入口页上的示例问题要叫：
   - `Starter Prompts`
   - `Suggested Questions`
   - `Suggested Investigations`
   
   不要叫：
   - `Saved Reports`
   - `Fixed Queries`
   - `Templates`

2. 用户点进某个场景后，顶部必须保留可见的 `Prompt / Query Bar`，而不是直接跳进一个看起来完全固定的页面。

3. 进入结果页后，页面标题、结果区、右侧栏都应该看起来是在回应“当前这个问题”，而不是一个长期固定 dashboard。

4. 每个结果页最好允许用户继续：
   - 改写问题
   - 缩小范围
   - 切换维度
   - 继续追问

   即使这些动作背后暂时还不是完整自然语言，也要在交互上体现“这是可继续展开的问题流”，而不是一次性的固定入口。

5. 建议页面里适度显示“当前问题”与“当前结果”之间的关系，例如：
   - 顶部显示当前 query
   - 中间区按这个 query 生成结果
   - 右侧栏解释系统如何得出当前结果

这部分的设计目标不是“假装已经实现了完整 AI 对话”，而是避免让用户误解成“只是把菜单换成了几个预设问题”。

## 3. 右侧栏要求

右侧栏建议作为下一轮设计的固定结构保留下来。

它的作用不是为了“显得智能”，而是为了把系统能力表达清楚。

右侧栏固定建议有这 3 段：

1. `Reasoning`
2. `Backend Actions`
3. `Audit Log`

设计目的分别是：

- `Reasoning`：解释系统为什么得出当前判断
- `Backend Actions`：解释系统后台做了哪些动作或检查
- `Audit Log`：体现什么时间发生了什么，方便追踪

这一块建议做成短句或时间线，不要写成长段落。

## 4. 各工作区的具体反馈

### 4.1. Operations

这个工作区应该重点体现的是：

- 全网风险发现
- 群体异常分析
- rollout、region、model 等维度的关联判断

建议的定位文案方向：

`发现并解释全网风险`

主要对象建议：

- `incident`
- `cohort`
- `region`
- `location`

这轮建议重点体现的具体场景：

- `Post-Rollout Hidden Regression Detection`
- `Regional Incident Interpretation`

这里不建议优先把类似下面这种技术项当作主场景：

- `DPI & traffic anomaly detection`

原因很简单：

- 这更像实现能力
- 不像用户能直接理解的工作任务
- 会让页面更像技术监控台，而不是运营工作区

进入这个工作区后的页面，建议重点表现：

- 风险摘要
- 异常群体
- firmware / region / model 的关联
- 高风险 location 列表
- 右侧的判断依据和后台过程

### 4.2. Support

这个工作区不应该只体现“工单处理”，还应该体现：

- 本地主动处理
- 关键时刻保护

建议的定位文案方向：

`处理个案与 location 问题`

主要对象建议：

- `case`
- `location`
- `home`
- `gateway`

这轮建议重点体现 2 个具体场景即可：

#### Case A：`Autonomous Wi-Fi Recovery`

这个场景用来体现系统已经完成本地检测、动作、验证和闭环。

页面里建议重点表现：

- location summary
- case summary
- 识别到的问题
- 已执行的动作
- verification result
- final outcome

右侧可以体现：

- 为什么判断是本地 Wi-Fi 问题
- 调用了哪些后台检查和动作
- 什么时候触发、什么时候验证、什么时候关闭

#### Case B：`Critical Session Protection`

这个场景必须明确体现出来。

原因是：

- 这是我们想强调的关键时刻保护
- 它不能被 `Pre-Churn Rescue` 取代
- 它也不能被放进 `Growth` 里模糊处理

页面里建议重点表现：

- 被保护的目标或时刻
- 风险状态
- 保护状态
- 当前是预防中还是已经出现可见影响
- 最终结果

这里的重点不是“营销保护能力”，而是让设计师理解：这是一个明确的 case view，需要在 UI 上单独成立。

这两个场景放在一起，`Support` 工作区已经能清楚体现：

- 会处理
- 会保护

`External Service Degradation Disambiguation` 可以放到下一轮再补，不需要这次一起展开。

### 4.3. Growth

这个工作区不应该再做成 `Coming Soon`。

原因是：

- `Growth` 不是附属能力
- 它是和 troubleshooting 并列的一条价值主线
- 它代表的是 CSP 侧的上售、留存和增长机会，而不是 end-user satisfaction 页面

The "Growth" function is not designed for end-user satisfaction; rather, it is a tool for CSPs to identify upsell opportunities and mitigate churn risks. We focus on actionable scenarios such as:
• Plan Upgrades: Identifying users who frequently hit peak bandwidth limits and proactively promoting higher-tier speed plans.
• Service Expansion: Using device profiling and user behavior to target specific value-added services, such as Parental Controls or Elder Care (future roadmap).
• Data Monetization: Leveraging accumulated data for targeted marketing. For example, identifying households with high concentrations of luxury devices to promote high-end products or detecting younger demographics to offer lifestyle-specific digital services.

建议的定位文案方向：

`识别上售机会与流失预防机会`

主要对象建议：

- `opportunity`
- `segment`
- `offer`
- `campaign`

这轮建议重点体现的具体场景：

#### Case：`Pre-Churn Rescue / Plan Upgrade Opportunity`

这个场景的重点不是“广告投放”，而是：

- 哪些 location 有升级机会
- 哪些对象有流失风险
- 系统为什么把它们识别出来
- 推荐什么动作

页面里建议重点表现：

- opportunity summary
- candidate locations
- why this location
- recommended offer
- expected business impact

这里不建议这轮优先展开：

- `Data Monetization`
- 太偏 ad-tech 的 device fingerprint targeting 叙事

原因是这些内容会把当前主线带偏，也不适合这一轮先做成主展示页面。

## 5. 这轮聚焦建议

为了避免失焦，这轮不建议一次铺太多 case。

如果要更聚焦，建议优先把下面 3 个代表性场景做扎实：

1. `Operations`：`Post-Rollout Hidden Regression Detection`
2. `Support`：`Critical Session Protection`
3. `Growth`：`Pre-Churn Rescue / Plan Upgrade Opportunity`

`Autonomous Wi-Fi Recovery` 可以保留在 `Support` 工作区里作为第二个场景，但不需要和主场景同等展开。

## 6. 总结

当前 3 个 workspace 的结构方向是对的，建议保留。

下一轮最重要的不是加页面，而是把下面几件事做清楚：

- 顶部层级更清楚
- 每个 workspace 的定位更清楚
- 右侧栏固定表达判断依据、后台过程和审计记录
- 在每个 workspace 里用更具体的场景承载页面内容

尤其重要的是：下一轮必须在 `Support` 工作区里明确加入
`Critical Session Protection`，这样整体设计才能真正体现出系统不仅会处理问题和发现增长机会，也会主动保护高价值时刻。
