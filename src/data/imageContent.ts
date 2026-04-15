// src/data/imageContent.ts

export const R2_BASE = 'https://assets.soul-portrait.top/mahjong-connect/pic'

export interface ImageContent {
  id: string        // '01' ~ '35'
  matchText: string // 配对成功后弹窗文案
}

export const IMAGE_CONTENTS: ImageContent[] = [
  { id: '01', matchText: '第一次见你，心跳就提前泄露了秘密。' },
  { id: '02', matchText: '你笑起来的样子，是我最想收藏的风景。' },
  { id: '03', matchText: '每次想到你，嘴角就不受控制地上扬。' },
  { id: '04', matchText: '你是我在人群中一眼就想靠近的那道光。' },
  { id: '05', matchText: '和你在一起的时间，走得格外慢，慢得我舍不得。' },
  { id: '06', matchText: '你的名字，是我心里最温柔的那个词。' },
  { id: '07', matchText: '喜欢你，是我做过最没有悬念的决定。' },
  { id: '08', matchText: '你笑的时候，我觉得整个世界都安静了。' },
  { id: '09', matchText: '遇见你之前，我不知道原来心动是真实存在的。' },
  { id: '10', matchText: '你说的每句话，我都记得，一字不差。' },
  { id: '11', matchText: '跟你说话，我总担心自己笑得太明显。' },
  { id: '12', matchText: '你在的地方，才是我最想去的地方。' },
  { id: '13', matchText: '我喜欢你喜欢到，听到你名字都要心跳一下。' },
  { id: '14', matchText: '你是我藏在日记最后一页的那个名字。' },
  { id: '15', matchText: '在你身边，我连沉默都觉得是甜的。' },
  { id: '16', matchText: '你笑起来的时候，我忘了我要说什么。' },
  { id: '17', matchText: '我希望每一个特别的日子，都有你在旁边。' },
  { id: '18', matchText: '喜欢你，像是一件早就决定好的事。' },
  { id: '19', matchText: '你随手发的一张图，我看了不知道多少遍。' },
  { id: '20', matchText: '想到能见到你，连等待都变得轻盈。' },
  { id: '21', matchText: '你的眼睛，是我最难移开视线的地方。' },
  { id: '22', matchText: '和你说话的每一分钟，我都想让它再长一点。' },
  { id: '23', matchText: '我悄悄把你放在了最重要的位置。' },
  { id: '24', matchText: '只要是和你有关的事，我都想知道。' },
  { id: '25', matchText: '你是我朋友圈最常点进去看的那个人。' },
  { id: '26', matchText: '你走进来的瞬间，我的眼神就再也没离开过。' },
  { id: '27', matchText: '喜欢你，不需要理由，但每个细节都是证据。' },
  { id: '28', matchText: '遇见你，是我这段时间最开心的事。' },
  { id: '29', matchText: '你不在的时候，我总是不由自主地想起你。' },
  { id: '30', matchText: '和你在一起的每一天，都是我喜欢的那种日子。' },
  { id: '31', matchText: '你是我最想分享好消息的那个人。' },
  { id: '32', matchText: '每次看到你，我都觉得今天是个好日子。' },
  { id: '33', matchText: '你让我明白，原来喜欢一个人可以这么自然。' },
  { id: '34', matchText: '我把最好的心情，都留给了想到你的那一刻。' },
  { id: '35', matchText: '认识你，是我最近最值得庆幸的事。' },
]

export function getImageUrl(id: string): string {
  return `${R2_BASE}/${id}.jpg`
}
