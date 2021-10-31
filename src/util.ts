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
