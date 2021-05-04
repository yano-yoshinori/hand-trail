import { fabric } from 'fabric'
import UAParser from 'ua-parser-js'

var userAgent = new UAParser()

/**
 * fabric.IText の日本語入力 bug fix
 *
 * TODO 変換候補ウィンドウが変なところに出る
 * DONE firefox で2文字目を打ったときに変換中が解除される
 */
const FabricText = fabric.util.createClass(fabric.Text, {
  // ロック中かどうか
  allLock: false,

  // 変換中の文字選択位置
  selectionStartInComposition: 0,

  initHiddenTextarea: function () {
    // super
    this.callSuper('initHiddenTextarea', arguments)
    fabric.util.addListener(
      this.hiddenTextarea,
      'compositionstart',
      this.onCompositionStart.bind(this)
    )
    fabric.util.addListener(
      this.hiddenTextarea,
      'compositionupdate',
      this.onCompositionUpdate.bind(this)
    )
    fabric.util.addListener(this.hiddenTextarea, 'compositionend', this.onCompositionEnd.bind(this))
  },

  // override
  _updateTextarea: function () {
    if (!this.hiddenTextarea) {
      return
    }

    if (userAgent.getBrowser().name !== 'Firefox') {
      // firefox の場合、これが原因で日本語変換中状態が解除される
      this.hiddenTextarea.value = this.text
    }

    this.hiddenTextarea.selectionStart = this.selectionStart
    this.hiddenTextarea.selectionEnd = this.selectionEnd
  },

  onCompositionStart: function () {
    this.selectionStartInComposition = this.selectionStart

    if (userAgent.getBrowser().name === 'Firefox') {
      this.hiddenTextarea.value = this.text
    }
  },

  onCompositionUpdate: function (e) {
    this.setSelectionStart(this.selectionStartInComposition)
    this.insertChars(e.data)
  },

  onCompositionEnd: function (e) {
    this.setSelectionStart(this.selectionStartInComposition)
    this.insertChars(e.data)
  },

  // TODO コントロール枠を消す
  // 枠を固定ボタンのアイコンをトグル
  lockAll: function () {
    var lock = !this.allLock
    this.lockMovementX = lock
    this.lockMovementY = lock
    this.lockRotation = lock
    this.lockScalingX = lock
    this.lockScalingY = lock
    this.lockScalingFlip = lock
    this.allLock = lock
  },
})

export default FabricText
