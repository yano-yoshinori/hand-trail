import _ from 'lodash'
import { fabric } from 'fabric'

import FabricCanvas from './fabric-components/FabricCanvas'
import FabricText from './fabric-components/FabricText'
import { DEFAULT_TEXT_SIZE } from './constants/misc'

var keycodes = {
  TAB: 9,
  CTRL: 17,
  SPACE: 32,
  ESC: 27,
  BACKSPACE: 8,
  SHIFT: 16,
  COMMAND_L: 91,
  COMMAND_R: 93,
  ALT_L: 18,
}

const EXCLUDE_KEY_CODES = [
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Space',
  'Backspace',
  'Tab',
]

const { body } = document
let editor

// 文字をにじませないようにする
// ref: https://github.com/fabricjs/fabric.js/issues/4113#issuecomment-316644627
fabric.devicePixelRatio = 2

export default class Canvas {
  constructor(canvasEl) {
    editor = new FabricCanvas(canvasEl, {
      isDrawingMode: true,
      // imageSmoothingEnabled: true,
    })
    global.editor = editor

    var lastTextPos = { x: 0, y: 0 },
      lastText = null

    // 最後のマウス位置
    var mousePos = { x: 0, y: 0 },
      // マウスカーソルが動いたかどうかを記録
      isMoved = false,
      // マウスカーソルが動いたかどうかのしきい値
      OFFSET = 10

    this.buildPixy()

    document.addEventListener('keydown', (e) => {
      if (EXCLUDE_KEY_CODES.includes(e.code)) {
        e.preventDefault()
        return
      }

      if (e.ctrlKey) {
        editor.drawStart(e)
      }
    })

    document.addEventListener('keyup', (e) => {
      //   if (!ht.inputMode) {
      //     return
      //   }

      if (e.keyCode === keycodes.CTRL && editor.isDrawingMode) {
        editor.drawEnd(e)
        this.switchPixy()
      }

      // modifier キーのときは文字入力しない
      if (
        _.includes(
          [keycodes.ALT_L, keycodes.COMMAND_R, keycodes.COMMAND_L, keycodes.SHIFT, keycodes.CTRL],
          e.keyCode
        )
      ) {
        return
      }

      if (EXCLUDE_KEY_CODES.concat(['Tab']).includes(e.key)) {
        e.preventDefault()

        if (e.code === 'Tab') {
          // change mode
          editor.isDrawingMode = !editor.isDrawingMode
          this.switchPixy()
          return
        }

        return
      }

      var text = null,
        char = e.key

      if (isMoved || !lastText) {
        isMoved = false
        text = new FabricText(char, {
          lockUniScaling: true,
          hasControls: false, // TODO select mode にしたときは true にする
          fill: editor.freeDrawingBrush.color,
          fontSize: DEFAULT_TEXT_SIZE,
          // editable: true,
          // inCompositionMode: true,
        })
        text.set('top', mousePos.y)
        text.set('left', mousePos.x)
        editor.add(text)
        editor.setActiveObject(text)
      } else {
        text = lastText
        text.set('text', text.get('text') + char)
        //text.insertChars(char);
        //text.setSelectionEnd(9999);
        editor.renderAll()
      }
      lastText = text

      lastTextPos.x = mousePos.x
      lastTextPos.y = mousePos.y
    })

    body.addEventListener('mousemove', (e) => {
      mousePos.x = e.clientX
      mousePos.y = e.clientY - 42 // header offset

      if (this.inputModeLabel) {
        this.inputModeLabel.set('left', mousePos.x - 10)
        this.inputModeLabel.set('top', mousePos.y)
      }

      if (this.modeIcon) {
        this.modeIcon.set('left', mousePos.x - 30)
        this.modeIcon.set('top', mousePos.y - 20)
      }

      // ht.pixy.set({
      //     left: mousePos.x - 12,
      //     top: mousePos.y + 28
      // });

      editor.renderAll()

      // 10px ずれたら IText オブジェクトを新たに作る
      if (
        mousePos.x < lastTextPos.x - OFFSET ||
        lastTextPos.x + OFFSET < mousePos.x ||
        mousePos.y < lastTextPos.y - OFFSET ||
        lastTextPos.y + OFFSET < mousePos.y
      ) {
        isMoved = true
      }
    })

    body.addEventListener('mousedown', () => {
      this.inputModeLabel.set('vislble', false)
      this.modeIcon.set('visible', false)
    })

    body.addEventListener('mouseup', () => {
      this.inputModeLabel.set('visible', true)
      this.modeIcon.set('visible', true)
    })
  }

  buildPixy() {
    this.inputModeLabel = new FabricText('[', {
      opacity: 0.1,
      fontSize: 22,
    })
    editor.add(this.inputModeLabel)
    global.inputModeLabel = this.inputModeLabel

    this.modeIcon = new FabricText('pen', {
      opacity: 0.1,
      fontSize: 16,
    })
    editor.add(this.modeIcon)
    global.modeIcon = this.modeIcon
  }

  switchPixy() {
    if (editor.isDrawingMode) {
      this.modeIcon.set('text', 'pen')
    } else {
      this.modeIcon.set('text', 'select')
    }
    editor.renderAll()
  }
}
