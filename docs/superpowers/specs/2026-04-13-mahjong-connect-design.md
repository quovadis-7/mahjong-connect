# 连连看游戏设计文档

**日期：** 2026-04-13
**项目：** mahjong-connect
**类型：** 情侣礼物型翻牌记忆游戏

---

## 1. 项目概述

一款以情侣为目标用户的定制化礼物型翻牌记忆游戏。玩家翻开牌面，找到相同图案的一对牌，触发配对弹窗展示图文内容，全部配对完成后展示一封完整的情书。

---

## 2. 技术栈

- **框架：** React 18 + Vite + TypeScript
- **样式：** Tailwind CSS
- **状态管理：** `useReducer` 单页面状态机
- **图片资源：** 32 张预置 SVG（`/public/images/demo/p01.svg` ~ `p32.svg`，需生成）

---

## 3. 游戏规则

- 翻开任意一张背面朝上的牌，牌保持翻开状态（不会自动翻回）
- 翻开第二张牌时：
  - **相同图案** → 弹出配对弹窗，展示该对图片与预设文案
  - **不同图案** → 两张牌均保持翻开，继续等待玩家操作
- 玩家点击弹窗「知道了」→ 两张牌从视图中消失，原位置留空
- 所有牌配对完成 → 进入结尾页，展示完整情书

---

## 4. 棋盘布局

| 选项 | 格子数 | 对数 | 使用图片数 |
|------|--------|------|-----------|
| 小   | 6×6=36 | 18   | 随机 18 张 |
| 中   | 6×8=48 | 24   | 随机 24 张 |
| 大   | 8×8=64 | 32   | 全部 32 张 |

- 每局开始时根据所选对数从 32 张图片中随机抽取，打乱排列
- 棋盘列数固定为选项对应宽度（6 或 8），行数自动匹配

---

## 5. 数据结构

```typescript
// 牌配置（静态数据，32 条）
type CardConfig = {
  id: number        // 1~32
  imagePath: string // "/images/demo/p01.svg"
  matchText: string // 配对成功弹窗文案
}

// 棋盘格子（运行时）
type Tile = {
  tileId: number    // 棋盘唯一索引
  cardId: number    // 对应 CardConfig.id（同 cardId = 一对）
  isFlipped: boolean
  isMatched: boolean
}
```

---

## 6. 状态机

**游戏阶段：**
```
selecting → playing → finished
```

**核心状态字段：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `phase` | `'selecting' \| 'playing' \| 'finished'` | 当前游戏阶段 |
| `boardSize` | `'small' \| 'medium' \| 'large'` | 玩家选择的布局 |
| `tiles` | `Tile[]` | 当前棋盘所有格子 |
| `flipped` | `number \| null` | 当前「等待匹配」的格子索引（最多 1 个）。玩家翻第一张时设置；翻第二张时比较：匹配则进入 `pendingMatch` 并清空，不匹配则以新翻的牌替换（旧牌保持正面朝上但不再参与比较） |
| `matched` | `Set<number>` | 已配对消除的 cardId 集合 |
| `pendingMatch` | `number \| null` | 触发弹窗的 cardId（弹窗显示时） |

**防误触：** 弹窗打开期间或两张牌翻开待处理时，禁止点击其他牌。

---

## 7. 页面与组件结构

```
src/
  data/
    cards.ts           # 32 张牌的配置数据（imagePath + matchText）
    letter.ts          # 结尾情书文案
  game/
    gameTypes.ts       # 类型定义
    gameReducer.ts     # useReducer 状态机
    boardUtils.ts      # 棋盘初始化、洗牌工具函数
  components/
    SelectScreen.tsx   # 选择棋盘大小页
    GameBoard.tsx      # 游戏棋盘容器
    Card.tsx           # 单张牌（带翻牌动画）
    MatchDialog.tsx    # 配对成功弹窗
    FinishLetter.tsx   # 结尾信件展示
  App.tsx
```

---

## 8. 视觉风格

- **主色调：** 暖粉、米白、玫瑰金，栗色/深红点缀
- **字体：** ZCOOL KuaiLe / Ma Shan Zheng（中文圆润风格）
- **牌背：** 统一花纹图案（心形或花瓣纹样），带 CSS 3D flip 翻牌动画
- **弹窗：** 圆角卡片，柔和阴影，信纸质感背景
- **结尾信件：** 全屏展示，信封展开动效，手写风格排版
- **SVG 图片：** 需生成 32 张风格统一的插画风 SVG（暂用占位图，后期可替换）

---

## 9. 页面流程

### 选择页（SelectScreen）
- 展示游戏标题与三个布局选项卡片
- 点击选项即开始游戏

### 游戏页（GameBoard）
- 顶部：已配对进度（X / 总对数）
- 中部：棋盘格子
- 翻牌时播放 3D flip 动画
- 配对成功时弹出 MatchDialog

### 配对弹窗（MatchDialog）
- 展示该对图片
- 展示对应预设文案
- 「知道了」按钮确认消除

### 结尾页（FinishLetter）
- 信封展开动画
- 展示完整情书内容
- 「再玩一次」按钮回到选择页

---

## 10. 图片生成策略

暂时在 `public/images/demo/` 目录下生成 32 张风格统一的 SVG 占位图（简单插画风，如花朵、动物、食物、符号等），后期可由用户替换为自定义图片。

---

## 11. 不在本期范围内

- 计时器 / 计分系统
- 多关卡 / 难度设置
- 音效
- 移动端适配（优先 PC）
- 用户自定义图片上传
