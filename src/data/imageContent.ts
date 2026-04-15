// src/data/imageContent.ts

export const R2_BASE = 'https://assets.soul-portrait.top/mahjong-connect/pic'

export interface ImageContent {
  id: string        // '01' ~ '35'
  matchText: string // 配对成功后弹窗文案
}

export const IMAGE_CONTENTS: ImageContent[] = [
  { id: '01', matchText: '坐在溪边共进平王线的午餐，你的腿慵懒地搭在我腿上，安逸且自在' },
  { id: '02', matchText: '你带我去你常去的那就按摩店，放松到差点睡着' },
  { id: '03', matchText: '一起拍结婚照的花絮，是我们最美的定格，此生无憾' },
  { id: '04', matchText: '送给你的花，还有那句在西塘牌子上留下的话' },
  { id: '05', matchText: '第二次去禹王庙还愿，其实我们早已经闭环' },
  { id: '06', matchText: '有你月相名字和生日的摆件，所念皆星河，星河皆是你' },
  { id: '07', matchText: '宁波电梯里你的随手一拍，就是我们爱的留念' },
  { id: '08', matchText: '你最爱的那家餐厅，风景绝美，那天让你不高兴了，对不起，宝贝' },
  { id: '09', matchText: '第二次去唱K，你对我说这辈子不会离开我的' },
  { id: '10', matchText: '在迈伺特时给你买零食，你吃得开心我也很喜欢' },
  { id: '11', matchText: '你第一次带我去龙游，去到你最喜欢的地方，在水库前我们大声呐喊' },
  { id: '12', matchText: '你最开心的一次，人生第一次演唱会，七夕，许嵩，简直完美' },
  { id: '13', matchText: '平王线的起点，那天天很蓝，太阳很暖，我们很开心' },
  { id: '14', matchText: '送你的粉邂逅，陪你做的指甲，你的这个生日有我参与' },
  { id: '15', matchText: '秋天去满觉陇捡秋，是属于我们的浪漫' },
  { id: '16', matchText: '我们一起完成的拼图，一起做事情简直不要太开心' },
  { id: '17', matchText: '有你参与定制的乐高人偶，还原你最美的样子' },
  { id: '18', matchText: '无数次陪你上班下班，虽然相隔千里，却总想可以贴近你' },
  { id: '19', matchText: '你生病去陪你输液买的衢州烤饼，后来每次再路过都会想起我们' },
  { id: '20', matchText: '第一次正大光明去你家吃饭，希望可以成为家常便饭' },
  { id: '21', matchText: '你送我的32岁生日盒子，是你精挑细选，我珍惜你的用心，说气话是我不对' },
  { id: '22', matchText: '第一次去满觉陇，那天烟雨濛濛，人很少很安静，爱意弥漫的下午' },
  { id: '23', matchText: '海海人生，舒服的一下午，躺在你腿上睡觉，你看我喂小鱼' },
  { id: '24', matchText: '为演唱会精心打扮的紫色妹妹，美的在发光' },
  { id: '25', matchText: '去良渚酒店的那次，第二天我走的很早，从此答应不再比你先离开留你自己' },
  { id: '26', matchText: '去香港前一晚，你给我挑的睡衣，真的很舒服，超喜欢' },
  { id: '27', matchText: '第一顿你为我做的饭，在黄龙体育场的停车场你车里我们吃的很香' },
  { id: '28', matchText: '中途下车在河边拍照，你说很早之前就想过拍这种照片，我们实现了' },
  { id: '29', matchText: '逛完水族市场买给你的一束花花，你很喜欢，喜欢这种安静又悠闲的时光' },
  { id: '30', matchText: '亚朵楼顶的风光，跟你一起在这里度过了很多时光' },
  { id: '31', matchText: '跟你去你很喜欢的西东杂货，挑了好看的杯子和餐具' },
  { id: '32', matchText: '很多次把背影留给你，又不舍得回头，我也很不喜欢离别，多想能跟你永远在一起' },
  { id: '33', matchText: '捡秋的纪念，会一直珍藏，这样看来真的很好看呢' },
  { id: '34', matchText: '请假去杭州找你，我们一起喝酒，说心里话，也疯狂亲热' },
  { id: '35', matchText: '31岁生日你送我的礼物，是很喜欢的，小小的又很精致' },
]

export function getImageUrl(id: string): string {
  return `${R2_BASE}/${id}.jpg`
}
