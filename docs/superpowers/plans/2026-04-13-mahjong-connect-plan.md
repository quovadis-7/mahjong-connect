# 连连看游戏 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一款情侣主题的翻牌记忆游戏，支持 3 种棋盘大小，配对成功弹窗展示图文，全部配对后展示情书。

**Architecture:** 单页 React 应用，`useReducer` 管理三阶段状态机（selecting → playing → finished）。游戏逻辑（棋盘初始化、洗牌）抽离为纯函数，reducer 处理所有状态转换，组件只负责渲染。

**Tech Stack:** React 18, Vite 5, TypeScript 5, Tailwind CSS v3, Vitest

---

## 文件结构总览

```
/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tailwind.config.js
├── postcss.config.js
├── scripts/
│   └── generate-svgs.js          # 生成 32 张 SVG 占位图
├── public/
│   └── images/demo/              # p01.svg ~ p32.svg
└── src/
    ├── vite-env.d.ts
    ├── main.tsx
    ├── index.css                  # 全局样式 + 翻牌 CSS 动画
    ├── App.tsx
    ├── data/
    │   ├── cards.ts               # 32 张牌配置（imagePath + matchText）
    │   └── letter.ts              # 结尾情书文案
    ├── game/
    │   ├── gameTypes.ts           # 类型定义
    │   ├── boardUtils.ts          # 洗牌、初始化棋盘（纯函数）
    │   ├── boardUtils.test.ts
    │   ├── gameReducer.ts         # useReducer 状态机
    │   └── gameReducer.test.ts
    └── components/
        ├── SelectScreen.tsx       # 选择棋盘大小页
        ├── GameBoard.tsx          # 棋盘容器 + 进度
        ├── Card.tsx               # 单张牌 + 3D 翻牌动画
        ├── MatchDialog.tsx        # 配对成功弹窗
        └── FinishLetter.tsx       # 结尾情书展示
```

---

## Task 1: 项目脚手架

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `index.html`
- Create: `src/vite-env.d.ts`
- Create: `src/main.tsx`
- Create: `src/index.css`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "mahjong-connect",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.1",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.1",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.6.2",
    "autoprefixer": "^10.4.20",
    "jsdom": "^25.0.1",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.14",
    "typescript": "^5.5.3",
    "vite": "^5.4.8",
    "vitest": "^2.1.3"
  }
}
```

- [ ] **Step 2: 创建 vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
```

- [ ] **Step 3: 创建 tsconfig.json**

```json
{
  "files": [],
  "references": [{ "path": "./tsconfig.app.json" }]
}
```

- [ ] **Step 4: 创建 tsconfig.app.json**

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}
```

- [ ] **Step 5: 创建 tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        kuaile: ['"ZCOOL KuaiLe"', 'cursive'],
        mashan: ['"Ma Shan Zheng"', 'cursive'],
      },
      colors: {
        rose: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 6: 创建 postcss.config.js**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 7: 创建 index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>专属记忆游戏</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=ZCOOL+KuaiLe&family=Ma+Shan+Zheng&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 8: 创建 src/vite-env.d.ts**

```typescript
/// <reference types="vite/client" />
```

- [ ] **Step 9: 创建 src/main.tsx**

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 10: 创建 src/index.css（全局样式 + 翻牌动画）**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    background-color: #fff1f2;
    font-family: 'ZCOOL KuaiLe', cursive;
  }
}

/* 3D 翻牌动画 */
.card-wrapper {
  perspective: 800px;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.5s ease;
}

.card-inner.flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border-radius: 0.5rem;
  overflow: hidden;
}

.card-front {
  transform: rotateY(180deg);
}

/* 信件展开动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.letter-appear {
  animation: fadeInUp 0.8s ease forwards;
}
```

- [ ] **Step 11: 安装依赖**

```bash
npm install
```

Expected: 所有依赖安装成功，无错误

- [ ] **Step 12: Commit**

```bash
git add package.json vite.config.ts tsconfig.json tsconfig.app.json tailwind.config.js postcss.config.js index.html src/vite-env.d.ts src/main.tsx src/index.css
git commit -m "chore: project scaffolding with React, Vite, TypeScript, Tailwind"
```

---

## Task 2: 类型定义

**Files:**
- Create: `src/game/gameTypes.ts`

- [ ] **Step 1: 创建 src/game/gameTypes.ts**

```typescript
export type BoardSize = 'small' | 'medium' | 'large'

export interface CardConfig {
  id: number
  imagePath: string
  matchText: string
}

export interface Tile {
  tileId: number
  cardId: number
  isFlipped: boolean
  isMatched: boolean
}

export interface PendingMatch {
  tileId1: number
  tileId2: number
  cardId: number
}

export type GamePhase = 'selecting' | 'playing' | 'finished'

export interface GameState {
  phase: GamePhase
  boardSize: BoardSize | null
  /** tileId of the currently "waiting" tile (first flip, not yet matched) */
  flipped: number | null
  tiles: Tile[]
  pendingMatch: PendingMatch | null
}
```

- [ ] **Step 2: Commit**

```bash
git add src/game/gameTypes.ts
git commit -m "feat: add game type definitions"
```

---

## Task 3: 数据层（牌配置 + 情书）

**Files:**
- Create: `src/data/cards.ts`
- Create: `src/data/letter.ts`

- [ ] **Step 1: 创建 src/data/cards.ts**

```typescript
import type { CardConfig } from '../game/gameTypes'

export const CARDS: CardConfig[] = [
  { id: 1,  imagePath: '/images/demo/p01.svg', matchText: '第一次送你玫瑰，你笑得比花还美。' },
  { id: 2,  imagePath: '/images/demo/p02.svg', matchText: '每一跳心跳，都写着你的名字。' },
  { id: 3,  imagePath: '/images/demo/p03.svg', matchText: '摘一颗星给你，照亮你每个夜晚。' },
  { id: 4,  imagePath: '/images/demo/p04.svg', matchText: '月亮弯弯，弯进了我心里。' },
  { id: 5,  imagePath: '/images/demo/p05.svg', matchText: '你是我每天早上睁眼的理由。' },
  { id: 6,  imagePath: '/images/demo/p06.svg', matchText: '遇见你，像蝴蝶破茧的那一刻。' },
  { id: 7,  imagePath: '/images/demo/p07.svg', matchText: '想变成一只鸟，每天绕着你飞。' },
  { id: 8,  imagePath: '/images/demo/p08.svg', matchText: '像猫一样，赖在你身边不走了。' },
  { id: 9,  imagePath: '/images/demo/p09.svg', matchText: '愿意为你摇尾巴，一辈子。' },
  { id: 10, imagePath: '/images/demo/p10.svg', matchText: '就算世界是海，你也是我游向的方向。' },
  { id: 11, imagePath: '/images/demo/p11.svg', matchText: '想做你的大树，替你遮风挡雨。' },
  { id: 12, imagePath: '/images/demo/p12.svg', matchText: '再高的山，有你在身边就不怕。' },
  { id: 13, imagePath: '/images/demo/p13.svg', matchText: '想把软软的云，都塞进你的怀里。' },
  { id: 14, imagePath: '/images/demo/p14.svg', matchText: '每场雨后，我要陪你等彩虹。' },
  { id: 15, imagePath: '/images/demo/p15.svg', matchText: '你是我黑暗里最亮的那道光。' },
  { id: 16, imagePath: '/images/demo/p16.svg', matchText: '在我心里，你永远是最重要的那个人。' },
  { id: 17, imagePath: '/images/demo/p17.svg', matchText: '有一天，要把这枚戒指亲手戴在你手上。' },
  { id: 18, imagePath: '/images/demo/p18.svg', matchText: '每封信里，都是说不完的想你。' },
  { id: 19, imagePath: '/images/demo/p19.svg', matchText: '我们的故事，是这世界上最美的旋律。' },
  { id: 20, imagePath: '/images/demo/p20.svg', matchText: '想把你所有的样子，都拍下来收藏。' },
  { id: 21, imagePath: '/images/demo/p21.svg', matchText: '你就是上天送给我最好的礼物。' },
  { id: 22, imagePath: '/images/demo/p22.svg', matchText: '每一个生日，我都想陪在你身边。' },
  { id: 23, imagePath: '/images/demo/p23.svg', matchText: '一杯茶的时间，足够我想你很久。' },
  { id: 24, imagePath: '/images/demo/p24.svg', matchText: '愿你的路，永远灯火通明。' },
  { id: 25, imagePath: '/images/demo/p25.svg', matchText: '放风筝的那天，我就想一直牵着你的手。' },
  { id: 26, imagePath: '/images/demo/p26.svg', matchText: '想带你飞到最高处，一起看世界。' },
  { id: 27, imagePath: '/images/demo/p27.svg', matchText: '无论多黑的海，你是我的灯塔。' },
  { id: 28, imagePath: '/images/demo/p28.svg', matchText: '每片雪花都不同，你也是独一无二的。' },
  { id: 29, imagePath: '/images/demo/p29.svg', matchText: '春天的樱花，不如你笑起来好看。' },
  { id: 30, imagePath: '/images/demo/p30.svg', matchText: '轻轻落下来，就像你走进我心里。' },
  { id: 31, imagePath: '/images/demo/p31.svg', matchText: '无论走到哪里，你都是我的方向。' },
  { id: 32, imagePath: '/images/demo/p32.svg', matchText: '和你在一起，每天都像放烟花。' },
]
```

- [ ] **Step 2: 创建 src/data/letter.ts**

```typescript
export const LOVE_LETTER = `亲爱的，

每翻开一张牌，都是我想对你说的一句话。
谢谢你耐心地把它们一张一张找到。

还记得我们第一次牵手的那天吗？
我紧张得连呼吸都忘了，
却又觉得，这双手以后再也不想放开了。

后来的日子里，
你陪我看过很多场日落，
走过很多段路，
吃过很多顿饭，
也笑过很多次。

每一个瞬间，我都想用心记住。
不是因为害怕忘记，
而是因为太喜欢，所以想一遍遍回味。

你不一定是完美的，
但你是最适合我的那个人。
那种感觉，就像拼图的最后一块，
轻轻一按，啪——刚好。

谢谢你出现在我的生命里。
谢谢你愿意留下来。


                              爱你的人
                              留于某个想你的夜晚`
```

- [ ] **Step 3: Commit**

```bash
git add src/data/cards.ts src/data/letter.ts
git commit -m "feat: add card configs and love letter content"
```

---

## Task 4: 生成 SVG 占位图

**Files:**
- Create: `scripts/generate-svgs.js`
- Generate: `public/images/demo/p01.svg` ~ `p32.svg`

- [ ] **Step 1: 创建 scripts/generate-svgs.js**

```javascript
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '../public/images/demo')
mkdirSync(outDir, { recursive: true })

const bg = '#fff1f2'

const svgs = [
  // p01 玫瑰
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="12" fill="${bg}"/><ellipse cx="50" cy="48" rx="18" ry="16" fill="#f48fb1"/><ellipse cx="50" cy="34" rx="10" ry="14" fill="#e91e63"/><ellipse cx="36" cy="44" rx="10" ry="14" fill="#f06292" transform="rotate(-40 36 44)"/><ellipse cx="64" cy="44" rx="10" ry="14" fill="#f06292" transform="rotate(40 64 44)"/><ellipse cx="40" cy="58" rx="10" ry="12" fill="#f48fb1" transform="rotate(20 40 58)"/><ellipse cx="60" cy="58" rx="10" ry="12" fill="#f48fb1" transform="rotate(-20 60 58)"/><circle cx="50" cy="48" r="10" fill="#c2185b"/><rect x="47" y="62" width="6" height="20" rx="3" fill="#66bb6a"/><ellipse cx="40" cy="76" rx="10" ry="5" fill="#66bb6a" transform="rotate(-30 40 76)"/></svg>`,
  // p02 爱心
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="12" fill="${bg}"/><path d="M50 75 C50 75 18 56 18 36 A16 16 0 0 1 50 28 A16 16 0 0 1 82 36 C82 56 50 75 50 75Z" fill="#e91e63"/><path d="M50 68 C50 68 24 52 24 36 A12 12 0 0 1 50 30 A12 12 0 0 1 76 36 C76 52 50 68 50 68Z" fill="#f48fb1" opacity="0.5"/></svg>`,
  // p03 星星
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="12" fill="${bg}"/><polygon points="50,15 61,38 87,38 66,56 74,80 50,64 26,80 34,56 13,38 39,38" fill="#fdd835"/><polygon points="50,22 59,40 79,40 64,53 70,73 50,60 30,73 36,53 21,40 41,40" fill="#ffee58" opacity="0.6"/></svg>`,
  // p04 月亮
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="12" fill="${bg}"/><circle cx="52" cy="50" r="28" fill="#fdd835"/><circle cx="66" cy="38" r="24" fill="${bg}"/><circle cx="38" cy="62" r="4" fill="#f9a825" opacity="0.5"/><circle cx="44" cy="48" r="2.5" fill="#f9a825" opacity="0.4"/><circle cx="32" cy="52" r="3" fill="#f9a825" opacity="0.3"/></svg>`,
  // p05 太阳
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="12" fill="${bg}"/><circle cx="50" cy="50" r="22" fill="#ffb300"/>${Array.from({length:8},(_,i)=>{const a=i*45*Math.PI/180,x1=50+28*Math.cos(a),y1=50+28*Math.sin(a),x2=50+38*Math.cos(a),y2=50+38*Math.sin(a);return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#ffca28" stroke-width="5" stroke-linecap="round"/>`}).join('')}<circle cx="50" cy="50" r="16" fill="#ffd54f"/></svg>`,
  // p06 蝴蝶
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="12" fill="${bg}"/><ellipse cx="32" cy="40" rx="22" ry="16" fill="#ce93d8" transform="rotate(-20 32 40)"/><ellipse cx="68" cy="40" rx="22" ry="16" fill="#ce93d8" transform="rotate(20 68 40)"/><ellipse cx="34" cy="60" rx="14" ry="10" fill="#ba68c8" transform="rotate(15 34 60)"/><ellipse cx="66" cy="60" rx="14" ry="10" fill="#ba68c8" transform="rotate(-15 66 60)"/><ellipse cx="32" cy="40" rx="14" ry="10" fill="#e1bee7" opacity="0.5" transform="rotate(-20 32 40)"/><ellipse cx="68" cy="40" rx="14" ry="10" fill="#e1bee7" opacity="0.5" transform="rotate(20 68 40)"/><path d="M50 35 Q48 50 46 65" stroke="#5d4037" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M50 35 Q52 50 54 65" stroke="#5d4037" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M50 30 Q44 22 38 18" stroke="#5d4037" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M50 30 Q56 22 62 18" stroke="#5d4037" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
  // p07 小鸟
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="12" fill="${bg}"/><ellipse cx="50" cy="55" rx="22" ry="18" fill="#42a5f5"/><circle cx="50" cy="36" r="14" fill="#42a5f5"/><ellipse cx="30" cy="52" rx="18" ry="10" fill="#1e88e5" transform="rotate(-15 30 52)"/><ellipse cx="70" cy="52" rx="18" ry="10" fill="#1e88e5" transform="rotate(15 70 52)"/><circle cx="44" cy="32" r="3" fill="white"/><circle cx="44" cy="32" r="1.5" fill="#212121"/><path d="M50 38 L44 42 L56 42 Z" fill="#ff8f00"/><path d="M42 70 L46 78 L50 70" stroke="#ff8f00" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M50 70 L54 78 L58 70" stroke="#ff8f00" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
  // p08 猫咪
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="12" fill="${bg}"/><circle cx="50" cy="58" r="26" fill="#ffb74d"/><polygon points="26,40 32,20 42,38" fill="#ffb74d"/><polygon points="74,40 68,20 58,38" fill="#ffb74d"/><polygon points="28,40 33,25 40,39" fill="#f48fb1"/><polygon points="72,40 67,25 60,39" fill="#f48fb1"/><circle cx="40" cy="56" r="7" fill="white"/><circle cx="60" cy="56" r="7" fill="white"/><ellipse cx="40" cy="56" rx="3" ry="5" fill="#1a237e"/><ellipse cx="60" cy="56" rx="3" ry="5" fill="#1a237e"/><circle cx="41" cy="54" r="1.5" fill="white"/><circle cx="61" cy="54" r="1.5" fill="white"/><path d="M50 62 Q46 66 42 64" stroke="#e91e63" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M50 62 Q54 66 58 64" stroke="#e91e63" stroke-width="2" fill="none" stroke-linecap="round"/><ellipse cx="50" cy="61" rx="4" ry="3" fill="#f06292"/><line x1="30" y1="60" x2="15" y2="56" stroke="#795548" stroke-width="1.5"/><line x1="30" y1="63" x2="15" y2="63" stroke="#795548" stroke-width="1.5"/><line x1="30" y1="66" x2="15" y2="70" stroke="#795548" stroke-width="1.5"/><line x1="70" y1="60" x2="85" y2="56" stroke="#795548" stroke-width="1.5"/><line x1="70" y1="63" x2="85" y2="63" stroke="#795548" stroke-width="1.5"/><line x1="70" y1="66" x2="85" y2="70" stroke="#795548" stroke-width="1.5"/></svg>`,
  // p09 小狗
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="12" fill="${bg}"/><circle cx="50" cy="55" r="24" fill="#bcaaa4"/><ellipse cx="30" cy="48" rx="10" ry="18" fill="#a1887f" transform="rotate(-10 30 48)"/><ellipse cx="70" cy="48" rx="10" ry="18" fill="#a1887f" transform="rotate(10 70 48)"/><circle cx="41" cy="52" r="6" fill="white"/><circle cx="59" cy="52" r="6" fill="white"/><circle cx="41" cy="52" r="3" fill="#3e2723"/><circle cx="59" cy="52" r="3" fill="#3e2723"/><circle cx="42" cy="50" r="1.5" fill="white"/><circle cx="60" cy="50" r="1.5" fill="white"/><ellipse cx="50" cy="62" rx="8" ry="5" fill="#d7ccc8"/><ellipse cx="50" cy="61" rx="5" ry="3.5" fill="#e91e63"/><circle cx="43" cy="58" r="2.5" fill="#bcaaa4"/><circle cx="57" cy="58" r="2.5" fill="#bcaaa4"/><circle cx="50" cy="56" r="2.5" fill="#bcaaa4"/></svg>`,
  // p10 小鱼
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="12" fill="${bg}"/><ellipse cx="48" cy="50" rx="28" ry="16" fill="#4dd0e1"/><path d="M76 50 L90 38 L90 62 Z" fill="#26c6da"/><path d="M76 50 L88 42 L88 58 Z" fill="#80deea"/><ellipse cx="44" cy="46" rx="6" ry="8" fill="#80deea" opacity="0.6" transform="rotate(-20 44 46)"/><ellipse cx="52" cy="56" rx="5" ry="7" fill="#80deea" opacity="0.4" transform="rotate(15 52 56)"/><circle cx="28" cy="46" r="4" fill="white"/><circle cx="28" cy="46" r="2" fill="#1a237e"/><circle cx="29" cy="45" r="1" fill="white"/></svg>`,
  // p11 大树
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="12" fill="${bg}"/><rect x="44" y="65" width="12" height="22" rx="4" fill="#795548"/><circle cx="50" cy="45" r="28" fill="#66bb6a"/><circle cx="36" cy="38" r="18" fill="#81c784"/><circle cx="64" cy="38" r="18" fill="#81c784"/><circle cx="50" cy="28" r="16" fill="#a5d6a7"/></svg>`,
  // p12 山峰
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="12" fill="${bg}"/><polygon points="50,15 85,78 15,78" fill="#78909c"/><polygon points="50,15 72,55 28,55" fill="#eceff1"/><polygon points="30,35 60,78 8,78" fill="#90a4ae"/><polygon points="30,35 48,60 12,60" fill="#eceff1" opacity="0.7"/></svg>`,
  // p13 云朵
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="12" fill="${bg}"/><circle cx="38" cy="55" r="18" fill="#b3e5fc"/><circle cx="56" cy="50" r="22" fill="#b3e5fc"/><circle cx="72" cy="58" r="14" fill="#b3e5fc"/><rect x="24" y="55" width="62" height="20" rx="0" fill="#b3e5fc"/><rect x="24" y="60" width="62" height="18" rx="8" fill="#b3e5fc"/><circle cx="38" cy="55" r="14" fill="#e1f5fe"/><circle cx="56" cy="50" r="17" fill="#e1f5fe"/><circle cx="70" cy="57" r="11" fill="#e1f5fe"/></svg>`,
  // p14 彩虹
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="12" fill="${bg}"/><path d="M10 75 A40 40 0 0 1 90 75" stroke="#ef5350" stroke-width="6" fill="none"/><path d="M16 75 A34 34 0 0 1 84 75" stroke="#ff9800" stroke-width="6" fill="none"/><path d="M22 75 A28 28 0 0 1 78 75" stroke="#fdd835" stroke-width="6" fill="none"/><path d="M28 75 A22 22 0 0 1 72 75" stroke="#66bb6a" stroke-width="6" fill="none"/><path d="M34 75 A16 16 0 0 1 66 75" stroke="#42a5f5" stroke-width="6" fill="none"/><path d="M40 75 A10 10 0 0 1 60 75" stroke="#9c27b0" stroke-width="6" fill="none"/></svg>`,
  // p15 蜡烛
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="12" fill="${bg}"/><rect x="38" y="55" width="24" height="32" rx="4" fill="#eeeeee"/><rect x="38" y="55" width="24" height="32" rx="4" fill="url(#cg)"/><defs><linearGradient id="cg" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#bdbdbd"/><stop offset="40%" stop-color="#ffffff"/><stop offset="100%" stop-color="#e0e0e0"/></linearGradient></defs><rect x="48" y="50" width="4" height="8" rx="2" fill="#795548"/><ellipse cx="50" cy="42" rx="7" ry="10" fill="#ffca28" opacity="0.8"/><ellipse cx="50" cy="38" rx="4" ry="7" fill="#ff8f00"/><ellipse cx="50" cy="36" rx="2" ry="4" fill="#fff9c4"/></svg>`,
  // p16 王冠
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="12" fill="${bg}"/><polygon points="15,70 15,40 30,55 50,25 70,55 85,40 85,70" fill="#fdd835"/><polygon points="15,70 15,40 30,55 50,25 70,55 85,40 85,70" fill="url(#cg2)"/><defs><linearGradient id="cg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff176"/><stop offset="100%" stop-color="#f9a825"/></linearGradient></defs><rect x="15" y="68" width="70" height="10" rx="3" fill="#f9a825"/><circle cx="50" cy="25" r="5" fill="#ef5350"/><circle cx="15" cy="40" r="4" fill="#42a5f5"/><circle cx="85" cy="40" r="4" fill="#66bb6a"/><circle cx="50" cy="60" r="4" fill="#ef5350"/></svg>`,
  // p17 钻戒
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="12" fill="${bg}"/><circle cx="50" cy="58" r="22" fill="none" stroke="#bdbdbd" stroke-width="8"/><circle cx="50" cy="58" r="22" fill="none" stroke="#e0e0e0" stroke-width="4"/><polygon points="50,20 62,34 50,42 38,34" fill="#90caf9"/><polygon points="50,20 62,34 50,30" fill="#bbdefb"/><polygon points="50,42 62,34 50,30" fill="#64b5f6"/><polygon points="50,42 38,34 50,30" fill="#42a5f5"/><polygon points="50,20 38,34 50,30" fill="#90caf9"/></svg>`,
  // p18 信封
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="12" fill="${bg}"/><rect x="15" y="30" width="70" height="50" rx="5" fill="white" stroke="#f48fb1" stroke-width="2"/><path d="M15 30 L50 58 L85 30" stroke="#f48fb1" stroke-width="2" fill="none"/><path d="M15 30 L50 58 L85 30" fill="#fff0f3"/><path d="M15 80 L38 58" stroke="#f48fb1" stroke-width="2"/><path d="M85 80 L62 58" stroke="#f48fb1" stroke-width="2"/><path d="M50 65 C50 65 42 58 42 53 A8 8 0 0 1 58 53 C58 58 50 65 50 65Z" fill="#e91e63"/></svg>`,
  // p19 音符
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="12" fill="${bg}"/><ellipse cx="36" cy="72" rx="12" ry="9" fill="#e91e63" transform="rotate(-15 36 72)"/><ellipse cx="66" cy="65" rx="12" ry="9" fill="#e91e63" transform="rotate(-15 66 65)"/><line x1="46" y1="72" x2="46" y2="28" stroke="#e91e63" stroke-width="4" stroke-linecap="round"/><line x1="76" y1="65" x2="76" y2="22" stroke="#e91e63" stroke-width="4" stroke-linecap="round"/><line x1="46" y1="28" x2="76" y2="22" stroke="#e91e63" stroke-width="4" stroke-linecap="round"/></svg>`,
  // p20 相机
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="12" fill="${bg}"/><rect x="12" y="36" width="76" height="50" rx="8" fill="#424242"/><rect x="12" y="36" width="76" height="50" rx="8" fill="#616161"/><path d="M36 36 L40 24 L60 24 L64 36" fill="#424242"/><circle cx="50" cy="62" r="16" fill="#37474f"/><circle cx="50" cy="62" r="12" fill="#263238"/><circle cx="50" cy="62" r="8" fill="#1a237e"/><circle cx="50" cy="62" r="5" fill="#3949ab"/><circle cx="48" cy="60" r="2" fill="white" opacity="0.5"/><circle cx="76" cy="44" r="5" fill="#ffca28"/></svg>`,
  // p21 礼盒
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="12" fill="${bg}"/><rect x="15" y="48" width="70" height="38" rx="4" fill="#ef5350"/><rect x="15" y="35" width="70" height="16" rx="4" fill="#e53935"/><rect x="47" y="35" width="6" height="51" fill="#fdd835"/><path d="M50 35 C50 35 35 22 30 28 C25 34 50 35 50 35" fill="#fdd835"/><path d="M50 35 C50 35 65 22 70 28 C75 34 50 35 50 35" fill="#fff176"/><circle cx="50" cy="30" r="5" fill="#ff8f00"/></svg>`,
  // p22 蛋糕
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="12" fill="${bg}"/><rect x="18" y="55" width="64" height="32" rx="5" fill="#f48fb1"/><ellipse cx="50" cy="55" rx="32" ry="8" fill="#f8bbd0"/><path d="M18 63 Q30 58 42 63 Q54 68 66 63 Q78 58 82 63 L82 67 Q70 72 58 67 Q46 62 34 67 Q22 72 18 67 Z" fill="white" opacity="0.6"/><rect x="38" y="36" width="5" height="18" rx="2" fill="#ef9a9a"/><rect x="57" y="38" width="5" height="16" rx="2" fill="#80cbc4"/><ellipse cx="40" cy="35" rx="4" ry="6" fill="#ffca28" opacity="0.8"/><ellipse cx="59" cy="37" rx="4" ry="6" fill="#ff8a65" opacity="0.8"/><ellipse cx="40" cy="33" rx="2" ry="3" fill="#ff8f00"/><ellipse cx="59" cy="35" rx="2" ry="3" fill="#e64a19"/></svg>`,
  // p23 茶杯
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="12" fill="${bg}"/><path d="M22 45 L28 80 L72 80 L78 45 Z" fill="white" stroke="#f48fb1" stroke-width="2"/><path d="M22 45 L78 45" stroke="#f48fb1" stroke-width="2"/><ellipse cx="50" cy="45" rx="28" ry="6" fill="#f8bbd0"/><path d="M78 50 Q90 50 88 62 Q86 72 76 68" fill="none" stroke="#f48fb1" stroke-width="3" stroke-linecap="round"/><path d="M35 35 Q34 26 38 22" stroke="#b2dfdb" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M50 32 Q49 22 53 17" stroke="#b2dfdb" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M65 35 Q64 26 68 22" stroke="#b2dfdb" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>`,
  // p24 灯笼
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="12" fill="${bg}"/><rect x="44" y="12" width="12" height="10" rx="3" fill="#fdd835"/><ellipse cx="50" cy="50" rx="24" ry="32" fill="#ef5350"/><ellipse cx="50" cy="50" rx="20" ry="28" fill="#e53935"/><line x1="26" y1="50" x2="74" y2="50" stroke="#ffca28" stroke-width="2.5"/><line x1="30" y1="34" x2="70" y2="34" stroke="#ffca28" stroke-width="2"/><line x1="30" y1="66" x2="70" y2="66" stroke="#ffca28" stroke-width="2"/><ellipse cx="50" cy="18" rx="6" ry="4" fill="#fdd835"/><rect x="46" y="80" width="8" height="10" rx="3" fill="#fdd835"/><line x1="46" y1="90" x2="40" y2="95" stroke="#fdd835" stroke-width="2"/><line x1="54" y1="90" x2="60" y2="95" stroke="#fdd835" stroke-width="2"/></svg>`,
  // p25 风筝
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="12" fill="${bg}"/><polygon points="50,12 78,50 50,75 22,50" fill="#ef5350"/><polygon points="50,12 78,50 50,44" fill="#ef9a9a"/><polygon points="50,44 78,50 50,75" fill="#e53935"/><line x1="22" y1="50" x2="78" y2="50" stroke="white" stroke-width="1.5" opacity="0.5"/><line x1="50" y1="12" x2="50" y2="75" stroke="white" stroke-width="1.5" opacity="0.5"/><path d="M50 75 Q58 82 54 88 Q50 94 56 98" stroke="#795548" stroke-width="2" fill="none" stroke-linecap="round"/><ellipse cx="57" cy="86" rx="5" ry="3" fill="#ffb74d" transform="rotate(-30 57 86)"/><ellipse cx="54" cy="92" rx="5" ry="3" fill="#ff8a65" transform="rotate(20 54 92)"/></svg>`,
  // p26 热气球
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="12" fill="${bg}"/><ellipse cx="50" cy="44" rx="28" ry="32" fill="#ef5350"/><path d="M22 44 Q22 16 50 12 Q78 16 78 44 Q78 58 50 76 Q22 58 22 44" fill="#ef5350"/><path d="M36 12 L36 76" stroke="white" stroke-width="2" opacity="0.3"/><path d="M50 10 L50 76" stroke="white" stroke-width="2" opacity="0.3"/><path d="M64 12 L64 76" stroke="white" stroke-width="2" opacity="0.3"/><path d="M22 38 Q50 44 78 38" stroke="white" stroke-width="2" opacity="0.3" fill="none"/><path d="M22 56 Q50 62 78 56" stroke="white" stroke-width="2" opacity="0.3" fill="none"/><path d="M38 76 L38 84 L62 84 L62 76" stroke="#795548" stroke-width="2" fill="none"/><rect x="38" y="82" width="24" height="10" rx="3" fill="#795548"/></svg>`,
  // p27 灯塔
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="12" fill="${bg}"/><polygon points="38,80 44,22 56,22 62,80" fill="white"/><polygon points="38,80 44,22 56,22 62,80" fill="url(#lg)"/><defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ef5350"/><stop offset="25%" stop-color="#ef5350"/><stop offset="25%" stop-color="white"/><stop offset="50%" stop-color="white"/><stop offset="50%" stop-color="#ef5350"/><stop offset="75%" stop-color="#ef5350"/><stop offset="75%" stop-color="white"/><stop offset="100%" stop-color="white"/></linearGradient></defs><rect x="40" y="16" width="20" height="10" rx="2" fill="#fdd835"/><circle cx="50" cy="16" r="6" fill="#ffca28"/><rect x="30" y="78" width="40" height="10" rx="3" fill="#78909c"/><path d="M42 16 Q30 20 28 26" stroke="#fdd835" stroke-width="2" fill="none" opacity="0.7"/><path d="M58 16 Q70 20 72 26" stroke="#fdd835" stroke-width="2" fill="none" opacity="0.7"/></svg>`,
  // p28 雪花
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="12" fill="${bg}"/>${Array.from({length:6},(_,i)=>{const a=i*60*Math.PI/180;const x2=(50+36*Math.cos(a)).toFixed(1),y2=(50+36*Math.sin(a)).toFixed(1);const bx1=(50+20*Math.cos(a+0.5)).toFixed(1),by1=(50+20*Math.sin(a+0.5)).toFixed(1),bx2=(50+28*Math.cos(a+0.5)).toFixed(1),by2=(50+28*Math.sin(a+0.5)).toFixed(1);const cx1=(50+20*Math.cos(a-0.5)).toFixed(1),cy1=(50+20*Math.sin(a-0.5)).toFixed(1),cx2=(50+28*Math.cos(a-0.5)).toFixed(1),cy2=(50+28*Math.sin(a-0.5)).toFixed(1);return `<line x1="50" y1="50" x2="${x2}" y2="${y2}" stroke="#81d4fa" stroke-width="4" stroke-linecap="round"/><line x1="${bx1}" y1="${by1}" x2="${bx2}" y2="${by2}" stroke="#81d4fa" stroke-width="2.5" stroke-linecap="round"/><line x1="${cx1}" y1="${cy1}" x2="${cx2}" y2="${cy2}" stroke="#81d4fa" stroke-width="2.5" stroke-linecap="round"/>`}).join('')}<circle cx="50" cy="50" r="6" fill="#4fc3f7"/></svg>`,
  // p29 樱花
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="12" fill="${bg}"/>${Array.from({length:5},(_,i)=>{const a=(i*72-90)*Math.PI/180;const cx=(50+18*Math.cos(a)).toFixed(1),cy=(50+18*Math.sin(a)).toFixed(1);return `<ellipse cx="${cx}" cy="${cy}" rx="12" ry="18" fill="#f48fb1" transform="rotate(${i*72} ${cx} ${cy})"/>`}).join('')}<circle cx="50" cy="50" r="10" fill="#fff176"/><circle cx="50" cy="50" r="6" fill="#ffca28"/>${Array.from({length:5},(_,i)=>{const a=(i*72-90)*Math.PI/180;const x=(50+7*Math.cos(a)).toFixed(1),y=(50+7*Math.sin(a)).toFixed(1);return `<circle cx="${x}" cy="${y}" r="1.5" fill="#e91e63"/>`}).join('')}</svg>`,
  // p30 羽毛
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="12" fill="${bg}"/><path d="M50 85 Q25 60 30 30 Q35 10 50 15 Q65 10 70 30 Q75 60 50 85" fill="#ce93d8"/><path d="M50 85 Q25 60 30 30 Q35 10 50 15" fill="#e1bee7"/><line x1="50" y1="85" x2="50" y2="15" stroke="#9c27b0" stroke-width="2"/><path d="M50 70 Q38 62 34 52" stroke="#ba68c8" stroke-width="1.5" fill="none"/><path d="M50 60 Q38 52 36 42" stroke="#ba68c8" stroke-width="1.5" fill="none"/><path d="M50 50 Q40 42 38 32" stroke="#ba68c8" stroke-width="1.5" fill="none"/><path d="M50 70 Q62 62 66 52" stroke="#9c27b0" stroke-width="1.5" fill="none"/><path d="M50 60 Q62 52 64 42" stroke="#9c27b0" stroke-width="1.5" fill="none"/><path d="M50 50 Q60 42 62 32" stroke="#9c27b0" stroke-width="1.5" fill="none"/></svg>`,
  // p31 指南针
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="12" fill="${bg}"/><circle cx="50" cy="50" r="34" fill="white" stroke="#bdbdbd" stroke-width="2"/><circle cx="50" cy="50" r="30" fill="white" stroke="#e0e0e0" stroke-width="1"/><text x="50" y="26" text-anchor="middle" font-size="10" fill="#e53935" font-weight="bold">N</text><text x="50" y="80" text-anchor="middle" font-size="10" fill="#757575">S</text><text x="76" y="54" text-anchor="middle" font-size="10" fill="#757575">E</text><text x="24" y="54" text-anchor="middle" font-size="10" fill="#757575">W</text><polygon points="50,24 54,50 50,56 46,50" fill="#e53935"/><polygon points="50,76 54,50 50,56 46,50" fill="#757575"/><circle cx="50" cy="50" r="4" fill="#424242"/></svg>`,
  // p32 烟花
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="12" fill="${bg}"/>${Array.from({length:12},(_,i)=>{const a=i*30*Math.PI/180;const colors=['#ef5350','#ff9800','#fdd835','#66bb6a','#42a5f5','#9c27b0','#e91e63','#00bcd4','#ff5722','#8bc34a','#03a9f4','#673ab7'];const x2=(50+30*Math.cos(a)).toFixed(1),y2=(50+30*Math.sin(a)).toFixed(1);return `<line x1="50" y1="50" x2="${x2}" y2="${y2}" stroke="${colors[i]}" stroke-width="3" stroke-linecap="round"/><circle cx="${x2}" cy="${y2}" r="3" fill="${colors[i]}"/>`}).join('')}${Array.from({length:8},(_,i)=>{const a=(i*45+15)*Math.PI/180;const colors2=['#ffb300','#e91e63','#00acc1','#7cb342','#fb8c00','#d81b60','#0097a7','#558b2f'];const x2=(50+42*Math.cos(a)).toFixed(1),y2=(50+42*Math.sin(a)).toFixed(1);return `<circle cx="${x2}" cy="${y2}" r="2.5" fill="${colors2[i]}"/>`}).join('')}<circle cx="50" cy="50" r="5" fill="#fdd835"/></svg>`,
]

svgs.forEach((svg, i) => {
  const num = String(i + 1).padStart(2, '0')
  writeFileSync(join(outDir, `p${num}.svg`), svg)
})
console.log(`Generated ${svgs.length} SVGs in ${outDir}`)
```

- [ ] **Step 2: 运行脚本生成 SVG**

```bash
node scripts/generate-svgs.js
```

Expected: `Generated 32 SVGs in .../public/images/demo`

- [ ] **Step 3: 验证生成结果**

```bash
ls public/images/demo/ | wc -l
```

Expected: `32`

- [ ] **Step 4: Commit**

```bash
git add scripts/generate-svgs.js public/images/demo/
git commit -m "feat: add SVG generation script and 32 placeholder card images"
```

---

## Task 5: boardUtils（TDD）

**Files:**
- Create: `src/game/boardUtils.test.ts`
- Create: `src/game/boardUtils.ts`

- [ ] **Step 1: 写失败的测试 src/game/boardUtils.test.ts**

```typescript
import { describe, it, expect } from 'vitest'
import { shuffle, getPairCount, getCols, initTiles } from './boardUtils'
import { CARDS } from '../data/cards'

describe('shuffle', () => {
  it('returns array with same elements in any order', () => {
    const arr = [1, 2, 3, 4, 5]
    const result = shuffle(arr)
    expect(result).toHaveLength(5)
    expect([...result].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5])
  })

  it('does not mutate original array', () => {
    const arr = [1, 2, 3]
    shuffle(arr)
    expect(arr).toEqual([1, 2, 3])
  })

  it('returns a new array reference', () => {
    const arr = [1, 2, 3]
    expect(shuffle(arr)).not.toBe(arr)
  })
})

describe('getPairCount', () => {
  it('returns 18 for small', () => expect(getPairCount('small')).toBe(18))
  it('returns 24 for medium', () => expect(getPairCount('medium')).toBe(24))
  it('returns 32 for large', () => expect(getPairCount('large')).toBe(32))
})

describe('getCols', () => {
  it('returns 6 for small', () => expect(getCols('small')).toBe(6))
  it('returns 8 for medium', () => expect(getCols('medium')).toBe(8))
  it('returns 8 for large', () => expect(getCols('large')).toBe(8))
})

describe('initTiles', () => {
  it('creates 36 tiles for small (6x6)', () => {
    expect(initTiles(CARDS, 'small')).toHaveLength(36)
  })

  it('creates 48 tiles for medium (6x8)', () => {
    expect(initTiles(CARDS, 'medium')).toHaveLength(48)
  })

  it('creates 64 tiles for large (8x8)', () => {
    expect(initTiles(CARDS, 'large')).toHaveLength(64)
  })

  it('each cardId appears exactly twice', () => {
    const tiles = initTiles(CARDS, 'small')
    const counts = new Map<number, number>()
    tiles.forEach(t => counts.set(t.cardId, (counts.get(t.cardId) ?? 0) + 1))
    counts.forEach(count => expect(count).toBe(2))
  })

  it('all tiles start unflipped and unmatched', () => {
    const tiles = initTiles(CARDS, 'small')
    tiles.forEach(t => {
      expect(t.isFlipped).toBe(false)
      expect(t.isMatched).toBe(false)
    })
  })

  it('tileIds are sequential from 0', () => {
    const tiles = initTiles(CARDS, 'small')
    expect(tiles.map(t => t.tileId)).toEqual(Array.from({ length: 36 }, (_, i) => i))
  })

  it('uses all 32 cards for large board', () => {
    const tiles = initTiles(CARDS, 'large')
    const cardIds = new Set(tiles.map(t => t.cardId))
    expect(cardIds.size).toBe(32)
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

```bash
npm test
```

Expected: FAIL — `boardUtils` module not found

- [ ] **Step 3: 实现 src/game/boardUtils.ts**

```typescript
import type { CardConfig, Tile, BoardSize } from './gameTypes'

export function getPairCount(boardSize: BoardSize): number {
  const map: Record<BoardSize, number> = { small: 18, medium: 24, large: 32 }
  return map[boardSize]
}

export function getCols(boardSize: BoardSize): number {
  const map: Record<BoardSize, number> = { small: 6, medium: 8, large: 8 }
  return map[boardSize]
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function initTiles(cards: CardConfig[], boardSize: BoardSize): Tile[] {
  const pairCount = getPairCount(boardSize)
  const selected = shuffle(cards).slice(0, pairCount)
  const shuffledPairs = shuffle([...selected, ...selected])
  return shuffledPairs.map((card, index) => ({
    tileId: index,
    cardId: card.id,
    isFlipped: false,
    isMatched: false,
  }))
}
```

- [ ] **Step 4: 运行测试确认通过**

```bash
npm test
```

Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/game/boardUtils.ts src/game/boardUtils.test.ts
git commit -m "feat: add boardUtils with shuffle and initTiles (TDD)"
```

---

## Task 6: gameReducer（TDD）

**Files:**
- Create: `src/game/gameReducer.test.ts`
- Create: `src/game/gameReducer.ts`

- [ ] **Step 1: 写失败的测试 src/game/gameReducer.test.ts**

```typescript
import { describe, it, expect } from 'vitest'
import { gameReducer, initialState } from './gameReducer'
import type { GameState } from './gameTypes'

describe('START_GAME', () => {
  it('transitions to playing phase with correct board', () => {
    const state = gameReducer(initialState, {
      type: 'START_GAME',
      payload: { boardSize: 'small' },
    })
    expect(state.phase).toBe('playing')
    expect(state.boardSize).toBe('small')
    expect(state.tiles).toHaveLength(36)
    expect(state.flipped).toBeNull()
    expect(state.pendingMatch).toBeNull()
  })
})

describe('FLIP_TILE', () => {
  function startGame(size: 'small' | 'medium' | 'large' = 'small') {
    return gameReducer(initialState, { type: 'START_GAME', payload: { boardSize: size } })
  }

  it('flips tile and sets flipped when no tile is waiting', () => {
    const s0 = startGame()
    const s1 = gameReducer(s0, { type: 'FLIP_TILE', payload: { tileId: 0 } })
    expect(s1.tiles[0].isFlipped).toBe(true)
    expect(s1.flipped).toBe(0)
    expect(s1.pendingMatch).toBeNull()
  })

  it('ignores already-flipped tile', () => {
    const s0 = startGame()
    const s1 = gameReducer(s0, { type: 'FLIP_TILE', payload: { tileId: 0 } })
    const s2 = gameReducer(s1, { type: 'FLIP_TILE', payload: { tileId: 0 } })
    expect(s2.flipped).toBe(0) // unchanged
  })

  it('blocks flipping when pendingMatch is active', () => {
    const s0 = startGame()
    const stateWithPending: GameState = {
      ...s0,
      pendingMatch: { tileId1: 0, tileId2: 1, cardId: 1 },
    }
    const s1 = gameReducer(stateWithPending, { type: 'FLIP_TILE', payload: { tileId: 2 } })
    expect(s1.tiles[2].isFlipped).toBe(false)
  })

  it('sets pendingMatch when matching pair is flipped', () => {
    const s0 = startGame()
    const tiles = s0.tiles
    const cardId = tiles[0].cardId
    const id1 = tiles.findIndex(t => t.cardId === cardId)
    const id2 = tiles.findIndex((t, i) => t.cardId === cardId && i !== id1)

    const s1 = gameReducer(s0, { type: 'FLIP_TILE', payload: { tileId: id1 } })
    const s2 = gameReducer(s1, { type: 'FLIP_TILE', payload: { tileId: id2 } })

    expect(s2.pendingMatch).not.toBeNull()
    expect(s2.pendingMatch?.cardId).toBe(cardId)
    expect(s2.pendingMatch?.tileId1).toBe(id1)
    expect(s2.pendingMatch?.tileId2).toBe(id2)
    expect(s2.flipped).toBeNull()
  })

  it('replaces flipped when non-matching tile is flipped', () => {
    const s0 = startGame()
    const tiles = s0.tiles
    const id1 = 0
    const id2 = tiles.findIndex((t, i) => i !== 0 && t.cardId !== tiles[0].cardId)

    const s1 = gameReducer(s0, { type: 'FLIP_TILE', payload: { tileId: id1 } })
    const s2 = gameReducer(s1, { type: 'FLIP_TILE', payload: { tileId: id2 } })

    expect(s2.flipped).toBe(id2)
    expect(s2.tiles[id1].isFlipped).toBe(true) // stays flipped
    expect(s2.pendingMatch).toBeNull()
  })
})

describe('CONFIRM_MATCH', () => {
  it('marks both tiles as matched and clears pendingMatch', () => {
    const s0 = gameReducer(initialState, { type: 'START_GAME', payload: { boardSize: 'small' } })
    const tiles = s0.tiles
    const cardId = tiles[0].cardId
    const id1 = tiles.findIndex(t => t.cardId === cardId)
    const id2 = tiles.findIndex((t, i) => t.cardId === cardId && i !== id1)

    const s1 = gameReducer(s0, { type: 'FLIP_TILE', payload: { tileId: id1 } })
    const s2 = gameReducer(s1, { type: 'FLIP_TILE', payload: { tileId: id2 } })
    const s3 = gameReducer(s2, { type: 'CONFIRM_MATCH' })

    expect(s3.tiles[id1].isMatched).toBe(true)
    expect(s3.tiles[id2].isMatched).toBe(true)
    expect(s3.pendingMatch).toBeNull()
    expect(s3.phase).toBe('playing')
  })

  it('transitions to finished when all tiles matched', () => {
    // Build a state where only 2 tiles remain unmatched
    const s0 = gameReducer(initialState, { type: 'START_GAME', payload: { boardSize: 'small' } })
    const cardId = s0.tiles[0].cardId
    const id1 = s0.tiles.findIndex(t => t.cardId === cardId)
    const id2 = s0.tiles.findIndex((t, i) => t.cardId === cardId && i !== id1)

    // Mark all tiles except this pair as matched
    const almostDone: GameState = {
      ...s0,
      tiles: s0.tiles.map(t =>
        t.tileId === id1 || t.tileId === id2 ? t : { ...t, isMatched: true }
      ),
    }
    const s1 = gameReducer(almostDone, { type: 'FLIP_TILE', payload: { tileId: id1 } })
    const s2 = gameReducer(s1, { type: 'FLIP_TILE', payload: { tileId: id2 } })
    const s3 = gameReducer(s2, { type: 'CONFIRM_MATCH' })

    expect(s3.phase).toBe('finished')
  })

  it('is a no-op when pendingMatch is null', () => {
    const s0 = gameReducer(initialState, { type: 'START_GAME', payload: { boardSize: 'small' } })
    const s1 = gameReducer(s0, { type: 'CONFIRM_MATCH' })
    expect(s1).toBe(s0)
  })
})

describe('RESTART', () => {
  it('resets state to initial', () => {
    const s0 = gameReducer(initialState, { type: 'START_GAME', payload: { boardSize: 'small' } })
    const s1 = gameReducer(s0, { type: 'RESTART' })
    expect(s1).toEqual(initialState)
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

```bash
npm test
```

Expected: FAIL — `gameReducer` module not found

- [ ] **Step 3: 实现 src/game/gameReducer.ts**

```typescript
import type { GameState, BoardSize } from './gameTypes'
import { CARDS } from '../data/cards'
import { initTiles } from './boardUtils'

export type GameAction =
  | { type: 'START_GAME'; payload: { boardSize: BoardSize } }
  | { type: 'FLIP_TILE'; payload: { tileId: number } }
  | { type: 'CONFIRM_MATCH' }
  | { type: 'RESTART' }

export const initialState: GameState = {
  phase: 'selecting',
  boardSize: null,
  tiles: [],
  flipped: null,
  pendingMatch: null,
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME': {
      const { boardSize } = action.payload
      return {
        phase: 'playing',
        boardSize,
        tiles: initTiles(CARDS, boardSize),
        flipped: null,
        pendingMatch: null,
      }
    }

    case 'FLIP_TILE': {
      if (state.pendingMatch !== null) return state

      const { tileId } = action.payload
      const tile = state.tiles[tileId]
      if (!tile || tile.isFlipped || tile.isMatched) return state

      const newTiles = state.tiles.map(t =>
        t.tileId === tileId ? { ...t, isFlipped: true } : t
      )

      if (state.flipped === null) {
        return { ...state, tiles: newTiles, flipped: tileId }
      }

      const firstTile = newTiles[state.flipped]
      const secondTile = newTiles[tileId]

      if (firstTile.cardId === secondTile.cardId) {
        return {
          ...state,
          tiles: newTiles,
          flipped: null,
          pendingMatch: {
            tileId1: state.flipped,
            tileId2: tileId,
            cardId: firstTile.cardId,
          },
        }
      }

      return { ...state, tiles: newTiles, flipped: tileId }
    }

    case 'CONFIRM_MATCH': {
      if (!state.pendingMatch) return state

      const { tileId1, tileId2 } = state.pendingMatch
      const newTiles = state.tiles.map(t =>
        t.tileId === tileId1 || t.tileId === tileId2
          ? { ...t, isMatched: true }
          : t
      )
      const allMatched = newTiles.every(t => t.isMatched)

      return {
        ...state,
        tiles: newTiles,
        pendingMatch: null,
        phase: allMatched ? 'finished' : 'playing',
      }
    }

    case 'RESTART': {
      return { ...initialState }
    }

    default:
      return state
  }
}
```

- [ ] **Step 4: 运行测试确认全部通过**

```bash
npm test
```

Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/game/gameReducer.ts src/game/gameReducer.test.ts
git commit -m "feat: add gameReducer state machine (TDD)"
```

---

## Task 7: Card 组件

**Files:**
- Create: `src/components/Card.tsx`

- [ ] **Step 1: 创建 src/components/Card.tsx**

```tsx
import type { Tile, CardConfig } from '../game/gameTypes'

interface CardProps {
  tile: Tile
  cardConfig: CardConfig
  onClick: (tileId: number) => void
}

function CardBack() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 75 100"
      className="w-full h-full"
    >
      <rect width="75" height="100" rx="6" fill="#c2185b" />
      <rect x="4" y="4" width="67" height="92" rx="5" fill="none" stroke="#f48fb1" strokeWidth="1.5" />
      <rect x="8" y="8" width="59" height="84" rx="4" fill="none" stroke="#f48fb1" strokeWidth="0.8" opacity="0.5" />
      {/* Center heart */}
      <path
        d="M37.5 62 C37.5 62 18 48 18 36 A12 12 0 0 1 37.5 30 A12 12 0 0 1 57 36 C57 48 37.5 62 37.5 62Z"
        fill="#f48fb1"
        opacity="0.9"
      />
      {/* Corner hearts */}
      {[
        [14, 16], [61, 16], [14, 84], [61, 84],
      ].map(([cx, cy], i) => (
        <path
          key={i}
          d={`M${cx} ${cy + 3} C${cx} ${cy + 3} ${cx - 5} ${cy - 1} ${cx - 5} ${cy - 3} A3.5 3.5 0 0 1 ${cx} ${cy + 1} A3.5 3.5 0 0 1 ${cx + 5} ${cy - 3} C${cx + 5} ${cy - 1} ${cx} ${cy + 3} ${cx} ${cy + 3}Z`}
          fill="#f48fb1"
          opacity="0.7"
        />
      ))}
      {/* Decorative dots */}
      {[
        [37, 16], [37, 84], [8, 50], [67, 50],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="2.5" fill="#f48fb1" opacity="0.6" />
      ))}
    </svg>
  )
}

export function Card({ tile, cardConfig, onClick }: CardProps) {
  const handleClick = () => {
    if (!tile.isMatched && !tile.isFlipped) {
      onClick(tile.tileId)
    }
  }

  return (
    <div
      className={`card-wrapper transition-[opacity,visibility] duration-500 ${
        tile.isMatched ? 'invisible opacity-0' : 'cursor-pointer'
      }`}
      onClick={handleClick}
    >
      <div className={`card-inner ${tile.isFlipped ? 'flipped' : ''}`}>
        {/* Back face */}
        <div className="card-face card-back shadow-md hover:shadow-lg transition-shadow">
          <CardBack />
        </div>
        {/* Front face */}
        <div className="card-face card-front bg-white shadow-md flex items-center justify-center p-2">
          <img
            src={cardConfig.imagePath}
            alt=""
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Card.tsx
git commit -m "feat: add Card component with 3D flip animation"
```

---

## Task 8: MatchDialog 组件

**Files:**
- Create: `src/components/MatchDialog.tsx`

- [ ] **Step 1: 创建 src/components/MatchDialog.tsx**

```tsx
import type { CardConfig } from '../game/gameTypes'

interface MatchDialogProps {
  cardConfig: CardConfig
  onConfirm: () => void
}

export function MatchDialog({ cardConfig, onConfirm }: MatchDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-rose-900/40 backdrop-blur-sm"
        onClick={onConfirm}
      />
      {/* Dialog card */}
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 mx-6 max-w-sm w-full flex flex-col items-center gap-5 border border-rose-200">
        {/* Decorative top line */}
        <div className="flex items-center gap-2 w-full justify-center mb-1">
          <span className="text-rose-300 text-xl">✦</span>
          <span className="text-rose-400 font-kuaile text-sm tracking-widest">配对成功</span>
          <span className="text-rose-300 text-xl">✦</span>
        </div>

        {/* Image */}
        <div className="w-28 h-28 rounded-xl overflow-hidden bg-rose-50 flex items-center justify-center shadow-inner border border-rose-100">
          <img
            src={cardConfig.imagePath}
            alt=""
            className="w-full h-full object-contain p-2"
          />
        </div>

        {/* Match text */}
        <p className="text-center text-rose-800 font-mashan text-lg leading-relaxed px-2">
          {cardConfig.matchText}
        </p>

        {/* Confirm button */}
        <button
          onClick={onConfirm}
          className="mt-2 px-10 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white font-kuaile text-base shadow-md hover:shadow-lg transition-all duration-200"
        >
          知道了 ♡
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/MatchDialog.tsx
git commit -m "feat: add MatchDialog component"
```

---

## Task 9: SelectScreen 组件

**Files:**
- Create: `src/components/SelectScreen.tsx`

- [ ] **Step 1: 创建 src/components/SelectScreen.tsx**

```tsx
import type { BoardSize } from '../game/gameTypes'

interface SelectScreenProps {
  onSelect: (boardSize: BoardSize) => void
}

const OPTIONS: { size: BoardSize; label: string; sub: string; tiles: string }[] = [
  { size: 'small',  label: '小局',  sub: '6 × 6',  tiles: '36 张 · 18 对' },
  { size: 'medium', label: '中局',  sub: '6 × 8',  tiles: '48 张 · 24 对' },
  { size: 'large',  label: '大局',  sub: '8 × 8',  tiles: '64 张 · 32 对' },
]

export function SelectScreen({ onSelect }: SelectScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-pink-100 flex flex-col items-center justify-center px-6 py-12 gap-10">
      {/* Title */}
      <div className="text-center">
        <div className="text-rose-400 text-3xl mb-2">✦ ♡ ✦</div>
        <h1 className="font-mashan text-5xl text-rose-700 mb-3">专属记忆游戏</h1>
        <p className="font-kuaile text-rose-400 text-lg tracking-wide">翻开每一张牌，找到属于你们的故事</p>
      </div>

      {/* Board size options */}
      <div className="flex flex-col sm:flex-row gap-5 w-full max-w-2xl">
        {OPTIONS.map(({ size, label, sub, tiles }) => (
          <button
            key={size}
            onClick={() => onSelect(size)}
            className="flex-1 group bg-white hover:bg-rose-50 border-2 border-rose-200 hover:border-rose-400 rounded-2xl p-6 flex flex-col items-center gap-3 shadow-md hover:shadow-xl transition-all duration-300 active:scale-95"
          >
            <span className="font-mashan text-3xl text-rose-600 group-hover:text-rose-700 transition-colors">
              {label}
            </span>
            <span className="font-kuaile text-2xl text-rose-800">{sub}</span>
            <span className="font-kuaile text-sm text-rose-400">{tiles}</span>
            <span className="mt-2 text-rose-300 text-xl group-hover:text-rose-500 transition-colors">♡</span>
          </button>
        ))}
      </div>

      <p className="font-kuaile text-rose-300 text-sm text-center">选择你想要的牌数，开始游戏</p>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/SelectScreen.tsx
git commit -m "feat: add SelectScreen component"
```

---

## Task 10: GameBoard 组件

**Files:**
- Create: `src/components/GameBoard.tsx`

- [ ] **Step 1: 创建 src/components/GameBoard.tsx**

```tsx
import type { GameState } from '../game/gameTypes'
import type { GameAction } from '../game/gameReducer'
import type { CardConfig } from '../game/gameTypes'
import { getCols } from '../game/boardUtils'
import { Card } from './Card'
import { MatchDialog } from './MatchDialog'

interface GameBoardProps {
  state: GameState
  dispatch: React.Dispatch<GameAction>
  cards: CardConfig[]
}

export function GameBoard({ state, dispatch, cards }: GameBoardProps) {
  const { tiles, pendingMatch, boardSize } = state
  const cols = getCols(boardSize!)

  const cardMap = new Map(cards.map(c => [c.id, c]))
  const matchedCount = tiles.filter(t => t.isMatched).length / 2
  const totalPairs = tiles.length / 2

  const pendingCard = pendingMatch ? cardMap.get(pendingMatch.cardId) : null

  const colClass: Record<number, string> = {
    6: 'grid-cols-6',
    8: 'grid-cols-8',
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-pink-100 flex flex-col items-center px-4 py-8 gap-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="font-mashan text-3xl text-rose-700 mb-1">专属记忆游戏</h2>
        <div className="flex items-center justify-center gap-2">
          <span className="font-kuaile text-rose-500 text-sm">
            已找到
          </span>
          <span className="font-kuaile text-rose-700 text-lg font-bold">
            {matchedCount}
          </span>
          <span className="font-kuaile text-rose-500 text-sm">
            / {totalPairs} 对
          </span>
        </div>
        {/* Progress bar */}
        <div className="mt-2 w-48 h-2 bg-rose-100 rounded-full overflow-hidden mx-auto">
          <div
            className="h-full bg-rose-400 rounded-full transition-all duration-500"
            style={{ width: `${(matchedCount / totalPairs) * 100}%` }}
          />
        </div>
      </div>

      {/* Board */}
      <div className={`grid ${colClass[cols]} gap-2`}>
        {tiles.map(tile => {
          const config = cardMap.get(tile.cardId)!
          return (
            <div key={tile.tileId} className="w-14 h-20 sm:w-16 sm:h-22">
              <Card
                tile={tile}
                cardConfig={config}
                onClick={tileId =>
                  dispatch({ type: 'FLIP_TILE', payload: { tileId } })
                }
              />
            </div>
          )
        })}
      </div>

      {/* Match dialog */}
      {pendingMatch && pendingCard && (
        <MatchDialog
          cardConfig={pendingCard}
          onConfirm={() => dispatch({ type: 'CONFIRM_MATCH' })}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/GameBoard.tsx
git commit -m "feat: add GameBoard component"
```

---

## Task 11: FinishLetter 组件

**Files:**
- Create: `src/components/FinishLetter.tsx`

- [ ] **Step 1: 创建 src/components/FinishLetter.tsx**

```tsx
import { LOVE_LETTER } from '../data/letter'

interface FinishLetterProps {
  onRestart: () => void
}

export function FinishLetter({ onRestart }: FinishLetterProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-pink-100 flex flex-col items-center justify-center px-6 py-12">
      {/* Letter container */}
      <div className="letter-appear w-full max-w-lg">
        {/* Envelope top decoration */}
        <div className="text-center mb-6">
          <div className="text-rose-400 text-4xl mb-2">✉</div>
          <div className="text-rose-300 text-sm font-kuaile tracking-widest">— 全部找到了 —</div>
        </div>

        {/* Letter paper */}
        <div
          className="bg-white rounded-2xl shadow-2xl p-10 border border-rose-100"
          style={{
            backgroundImage:
              'repeating-linear-gradient(transparent, transparent 31px, #fce4ec 31px, #fce4ec 32px)',
          }}
        >
          {/* Top decoration */}
          <div className="text-center mb-6">
            <span className="text-rose-300 text-2xl">✦ ♡ ✦</span>
          </div>

          {/* Letter content */}
          <p className="font-mashan text-rose-800 text-lg leading-loose whitespace-pre-line">
            {LOVE_LETTER}
          </p>

          {/* Bottom decoration */}
          <div className="text-center mt-8">
            <span className="text-rose-200 text-xl">— ♡ —</span>
          </div>
        </div>

        {/* Replay button */}
        <div className="text-center mt-8">
          <button
            onClick={onRestart}
            className="px-10 py-3 rounded-full bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white font-kuaile text-base shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
          >
            再玩一次 ♡
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/FinishLetter.tsx
git commit -m "feat: add FinishLetter component with letter reveal"
```

---

## Task 12: App.tsx — 连接所有模块

**Files:**
- Create: `src/App.tsx`

- [ ] **Step 1: 创建 src/App.tsx**

```tsx
import { useReducer } from 'react'
import { gameReducer, initialState } from './game/gameReducer'
import { CARDS } from './data/cards'
import { SelectScreen } from './components/SelectScreen'
import { GameBoard } from './components/GameBoard'
import { FinishLetter } from './components/FinishLetter'

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, initialState)

  if (state.phase === 'selecting') {
    return (
      <SelectScreen
        onSelect={boardSize =>
          dispatch({ type: 'START_GAME', payload: { boardSize } })
        }
      />
    )
  }

  if (state.phase === 'finished') {
    return <FinishLetter onRestart={() => dispatch({ type: 'RESTART' })} />
  }

  return <GameBoard state={state} dispatch={dispatch} cards={CARDS} />
}
```

- [ ] **Step 2: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire up App.tsx with state machine"
```

---

## Task 13: 验证与构建

- [ ] **Step 1: 全量测试**

```bash
npm test
```

Expected: All tests PASS (boardUtils + gameReducer)

- [ ] **Step 2: 启动开发服务器**

```bash
npm run dev
```

Expected: 在 http://localhost:5173 正常打开，显示选择页面

手动验证：
- 选择棋盘大小 → 进入游戏
- 点击牌面翻开 → 3D 翻牌动画
- 翻出一对匹配的牌 → 弹窗出现，显示文案
- 点击「知道了」→ 牌消失，空位保留
- 不匹配的牌保持翻开
- 全部配对 → 信件页展示
- 点击「再玩一次」→ 回到选择页

- [ ] **Step 3: 构建产物**

```bash
npm run build
```

Expected: `dist/` 目录生成，无 TypeScript 错误

- [ ] **Step 4: 最终 Commit**

```bash
git add -A
git commit -m "feat: complete mahjong connect game implementation"
```

---

## 后续可扩展方向（不在本期范围）

- 替换 `public/images/demo/` 中的 SVG 为自定义图片
- 修改 `src/data/cards.ts` 中的 `matchText` 为个人专属文案
- 修改 `src/data/letter.ts` 中的情书内容
- 添加翻牌音效
- 移动端适配优化
