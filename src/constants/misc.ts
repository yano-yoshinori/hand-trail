export const DEFAULT_TEXT_SIZE = 22

export const MIN_RESOLUTION = {
  width: 1920,
  height: 1080,
}

// 直線にするかフリーハンドにするかの閾値
export const STRAIGHT_LINE_THRESHOLD = 5

export const STORAGE_KEYS = {
  // 線の上にカーソルがあるときだけ選択できるモード
  perPixelTargetFind: 'perPixelTargetFind',
} as const
