// 今日の場合は時刻だけ
// 今日じゃない場合は日付だけ
// 今年じゃない場合は年も含む
export const formatDate = (timestamp: number) => {
  const now = new Date()
  const time = new Date(timestamp)

  if (now.getFullYear() === time.getFullYear()) {
    // 今年
    if (now.getMonth() === time.getMonth() && now.getDate() === time.getDate()) {
      // 今日
      return `Today ${time.getHours()}:${String(time.getMinutes()).padStart(2, '0')}`
    } else {
      // 今日以外
      return `${time.getMonth() + 1}/${time.getDate()}`
    }
  }

  // 今年じゃない
  return `${time.getFullYear()}/${time.getMonth() + 1}/${time.getDate()}`
}

const { userAgent, maxTouchPoints } = navigator
const lowerUserAgent = userAgent.toLowerCase()

export const IS_IPHONE = Boolean(lowerUserAgent.match(/iphone/))
export const IS_IPAD =
  Boolean(lowerUserAgent.match(/ipad/)) ||
  (Boolean(lowerUserAgent.match(/macintosh/)) && maxTouchPoints && maxTouchPoints > 1)
export const IS_ANDROID = Boolean(lowerUserAgent.match(/android/))
export const IS_MAC = Boolean(lowerUserAgent.match(/macintosh/))

export const IS_TOUCH_DEVICE = IS_IPHONE || IS_IPAD || IS_ANDROID
