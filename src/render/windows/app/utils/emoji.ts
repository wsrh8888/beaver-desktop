// 新的表情包导入
import yanHongPng from 'renderModule/assets/emoji/眼红.png'
import weiXiao1Png from 'renderModule/assets/emoji/微笑-1.png'
import shuiJiaoPng from 'renderModule/assets/emoji/睡觉.png'
import xiao1Png from 'renderModule/assets/emoji/笑-1.png'
import xiaoPng from 'renderModule/assets/emoji/笑.png'
import shengBingPng from 'renderModule/assets/emoji/生病.png'
import zhengZhong1Png from 'renderModule/assets/emoji/震惊-1.png'
import haiPa1Png from 'renderModule/assets/emoji/害怕-1.png'
import biZuiPng from 'renderModule/assets/emoji/闭嘴.png'
import haiPaPng from 'renderModule/assets/emoji/害怕.png'
import nanGuo1Png from 'renderModule/assets/emoji/难过-1.png'
import nanGuoPng from 'renderModule/assets/emoji/难过.png'
import jingYinPng from 'renderModule/assets/emoji/静音.png'
import mianWuBiaoQing1Png from 'renderModule/assets/emoji/面无表情-1.png'
import kouZhaoPng from 'renderModule/assets/emoji/口罩.png'
import qinWen1Png from 'renderModule/assets/emoji/亲吻-1.png'
import qinWen2Png from 'renderModule/assets/emoji/亲吻-2.png'
import qinWenPng from 'renderModule/assets/emoji/亲吻.png'
import reLianPng from 'renderModule/assets/emoji/热恋.png'
import xiaoKuPng from 'renderModule/assets/emoji/笑哭.png'
import shouShangPng from 'renderModule/assets/emoji/受伤.png'
import kaiXinPng from 'renderModule/assets/emoji/开心.png'
import kaiXin2Png from 'renderModule/assets/emoji/开心-2.png'
import kaiXin1Png from 'renderModule/assets/emoji/开心-1.png'
import mengBPng from 'renderModule/assets/emoji/懵B.png'
import moGuiPng from 'renderModule/assets/emoji/魔鬼.png'
import mianWuBiaoQingPng from 'renderModule/assets/emoji/面无表情.png'
import ku1Png from 'renderModule/assets/emoji/哭-1.png'
import kuPng from 'renderModule/assets/emoji/哭.png'
import touYunPng from 'renderModule/assets/emoji/头晕.png'
import ku1_1Png from 'renderModule/assets/emoji/酷-1.png'
import shengQiPng from 'renderModule/assets/emoji/生气.png'
import miMangPng from 'renderModule/assets/emoji/迷茫.png'
import kuPng2 from 'renderModule/assets/emoji/酷.png'
import zhongDu1Png from 'renderModule/assets/emoji/中毒-1.png'
import tianShiPng from 'renderModule/assets/emoji/天使.png'
import zhongDuPng from 'renderModule/assets/emoji/中毒.png'

export const emojiList = [{
  name: '[微笑]',
  icon: weiXiao1Png,
}, {
  name: '[亲吻]',
  icon: qinWenPng,
}, {
  name: '[亲吻1]',
  icon: qinWen1Png,
}, {
  name: '[亲吻2]',
  icon: qinWen2Png,
}, {
  name: '[睡觉]',
  icon: shuiJiaoPng,
}, {
  name: '[生病]',
  icon: shengBingPng,
}, {
  name: '[震惊]',
  icon: zhengZhong1Png,
}, {
  name: '[害怕]',
  icon: haiPaPng,
}, {
  name: '[害怕1]',
  icon: haiPa1Png,
}, {
  name: '[闭嘴]',
  icon: biZuiPng,
}, {
  name: '[难过]',
  icon: nanGuoPng,
}, {
  name: '[难过1]',
  icon: nanGuo1Png,
}, {
  name: '[静音]',
  icon: jingYinPng,
}, {
  name: '[面无表情]',
  icon: mianWuBiaoQingPng,
}, {
  name: '[面无表情1]',
  icon: mianWuBiaoQing1Png,
}, {
  name: '[口罩]',
  icon: kouZhaoPng,
}, {
  name: '[热恋]',
  icon: reLianPng,
}, {
  name: '[笑哭]',
  icon: xiaoKuPng,
}, {
  name: '[受伤]',
  icon: shouShangPng,
}, {
  name: '[开心]',
  icon: kaiXinPng,
}, {
  name: '[开心1]',
  icon: kaiXin1Png,
}, {
  name: '[开心2]',
  icon: kaiXin2Png,
}, {
  name: '[懵B]',
  icon: mengBPng,
}, {
  name: '[魔鬼]',
  icon: moGuiPng,
}, {
  name: '[哭]',
  icon: kuPng,
}, {
  name: '[哭1]',
  icon: ku1Png,
}, {
  name: '[头晕]',
  icon: touYunPng,
}, {
  name: '[酷]',
  icon: kuPng2,
}, {
  name: '[酷1]',
  icon: ku1_1Png,
}, {
  name: '[生气]',
  icon: shengQiPng,
}, {
  name: '[迷茫]',
  icon: miMangPng,
}, {
  name: '[中毒]',
  icon: zhongDuPng,
}, {
  name: '[中毒1]',
  icon: zhongDu1Png,
}, {
  name: '[天使]',
  icon: tianShiPng,
}, {
  name: '[眼红]',
  icon: yanHongPng,
}, {
  name: '[笑]',
  icon: xiaoPng,
}, {
  name: '[笑1]',
  icon: xiao1Png,
}]

export const emojiMap = (name: string) => {
  const emoji = emojiList.find(item => item.name === name)
  return emoji?.icon
}
