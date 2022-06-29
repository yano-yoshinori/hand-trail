export const DEFAULT_TEXT_SIZE = 18
export const DEFAULT_HEIGHT = window.innerHeight * 2

// 直線にするかフリーハンドにするかの閾値
export const STRAIGHT_LINE_THRESHOLD = 5

export const STORAGE_KEYS = {
  // 線の上にカーソルがあるときだけ選択できるモード
  perPixelTargetFind: 'perPixelTargetFind',
  fontSize: 'fontSize',
  canvasHeight: 'canvasHeight',
} as const

export const HEADER_HEIGHT = 44

export const SCROLL_BAR_WIDTH = 17

// fabric data がコピーされたことをマークするための文字列
export const FABRIC_DATA_IN_CLIPBOARD = 'FABRIC_DATA'

export const FABRIC_CANVAS_OPTIONS = {
  isDrawingMode: true,
  selectionFullyContained: true,
  backgroundColor: '#545554',
  imageSmoothingEnabled: false,
  // allowTouchScrolling: IS_IPAD || IS_ANDROID,
} as const
