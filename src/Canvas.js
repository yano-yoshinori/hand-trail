import _ from 'lodash'
import { fabric } from 'fabric'

import FabricCanvas from './fabric-components/FabricCanvas'
import { DEFAULT_TEXT_SIZE, STORAGE_KEYS, STRAIGHT_LINE_THRESHOLD } from './constants/misc'
import { createListen, getHistoryInstance } from './models/History'

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
  // 'ArrowLeft',
  // 'ArrowRight',
  // 'ArrowUp',
  // 'ArrowDown',
  // 'Space',
  // 'Backspace',
  // 'Tab',
  // 'Delete',
  // 'Enter',
]

const { body } = document
const { localStorage } = window
let editor

// 文字をにじませないようにする
// ref: https://github.com/fabricjs/fabric.js/issues/4113#issuecomment-316644627
fabric.devicePixelRatio = 2

const FABRIC_CANVAS_OPTIONS = {
  isDrawingMode: true,
  selectionFullyContained: true,
  backgroundColor: '#545554',
  // imageSmoothingEnabled: true,
}

const FREE_DRAWING_BRUSH_PROPS = {
  color: 'white',
  width: 2,
}

export default class Canvas {
  lastFreeDrawingPos = null
  lastFreeDrawingCircle = null

  constructor(canvasEl) {
    editor = new FabricCanvas(canvasEl, FABRIC_CANVAS_OPTIONS)
    global.editor = editor

    const { color, width } = FREE_DRAWING_BRUSH_PROPS
    editor.freeDrawingBrush.color = color
    editor.freeDrawingBrush.width = width

    editor.on('selection:created', handleSelectionChange)
    editor.on('selection:updated', handleSelectionChange)
    // editor.on('selection:cleared', this.handleSelectionClear)

    editor.on('path:created', (e) => {
      const { path } = e

      if (path.path.length < STRAIGHT_LINE_THRESHOLD) {
        if (this.lastFreeDrawingPos) {
          const line = new fabric.Line(
            [this.lastFreeDrawingPos.left, this.lastFreeDrawingPos.top, path.left, path.top],
            {
              stroke: editor.freeDrawingBrush.color,
              strokeWidth: FREE_DRAWING_BRUSH_PROPS.width,
            }
          )

          editor.add(line)
          getHistoryInstance().push({ type: 'line:created', targets: [line] })
          line.on('removed', createListen('line:removed', [line]))
        }

        this.lastFreeDrawingPos = {
          left: path.left,
          top: path.top,
        }

        this.lastFreeDrawingCircle.set('opacity', 0.5)
        this.lastFreeDrawingCircle.set('left', path.left)
        this.lastFreeDrawingCircle.set('top', path.top)
        this.lastFreeDrawingCircle.bringToFront()

        editor.remove(path)
        return
      } else {
        this.lastFreeDrawingPos = null
        this.lastFreeDrawingCircle.set('opacity', 0)

        getHistoryInstance().push({ type: 'path:created', targets: [path] })
        path.on('removed', createListen('path:removed', [path]))
      }

      // 手書きはクリック領域が広いので、邪魔にならないように一番奥に送る
      // TODO これをすると最後のオブジェクトを削除が動かなくなる
      path.sendToBack()

      if (localStorage.getItem(STORAGE_KEYS.perPixelTargetFind) === 'true') {
        path.perPixelTargetFind = true

        path.on('mouseover', function () {
          path.set('strokeWidth', FREE_DRAWING_BRUSH_PROPS.width * 3)
        })

        path.on('mouseout', function () {
          path.set('strokeWidth', FREE_DRAWING_BRUSH_PROPS.width)
        })
      }
    })

    var lastTextPos = { x: 0, y: 0 },
      lastText = null

    // 最後のマウス位置
    var mousePos = { x: 0, y: 0 },
      // マウスカーソルが動いたかどうかを記録
      isMoved = false,
      // マウスカーソルが動いたかどうかのしきい値
      OFFSET = 20

    // this.inputModeLabel = new fabric.Text('[', {
    //   opacity: 0.2,
    //   fontSize: 22,
    //   selectable: false,
    //   fill: 'white',
    // })
    // global.inputModeLabel = this.inputModeLabel

    this.modeIcon = new fabric.Text('pen', {
      opacity: 0.2,
      fontSize: 16,
      selectable: false,
      fill: 'white',
    })
    global.modeIcon = this.modeIcon

    this.addPixy()

    this.lastFreeDrawingCircle = new fabric.Circle({
      left: 0,
      top: 0,
      radius: 4,
      fill: 'red',
      opacity: 0,
      originX: 'center',
      originY: 'center',
    })
    editor.add(this.lastFreeDrawingCircle)

    function handleSelectionChange(e) {
      if (editor.isDrawingMode) {
        return
      }

      if (e.target.type === 'textbox') {
        isMoved = false
        lastText = e.target

        const input = document.querySelector('[name=hiddenInput]')
        input.value = e.target.text
      } else if (e.target.type === 'path') {
        e.target.set('hasControls', true)
      }
    }

    document.addEventListener('keydown', (e) => {
      if (
        e.key === 'Delete' ||
        // metaKey は keydown のときしかとれない
        (e.key === 'Backspace' && e.metaKey)
      ) {
        const items = editor.getActiveObjects()
        items.forEach((item) => {
          editor.remove(item)
        })
        editor.discardActiveObject()
        return
      }

      if (EXCLUDE_KEY_CODES.includes(e.code)) {
        e.preventDefault()
        return
      }

      // if (['Control', 'Alt', 'Shift'].includes(e.key)) {
      //   editor.drawStart(e)
      // }
    })

    document.addEventListener('keyup', (e) => {
      //   if (!ht.inputMode) {
      //     return
      //   }

      // if (['Control', 'Alt', 'Shift'].includes(e.key) && editor.isDrawingMode) {
      //   editor.drawEnd(e)
      //   this.switchPixy()
      //   return
      // }

      // if (e.key === 'Backspace') {
      //   const item = editor.item(editor.size() - 1)
      //   editor.remove(item)
      //   return
      // }

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
          editor.discardActiveObject()
          this.switchPixy()
          return
        }

        return
      }

      const input = document.querySelector('[name=hiddenInput]')
      let textbox = null,
        text = input.value // e.key

      if (isMoved || !lastText) {
        if (text) {
          isMoved = false
          textbox = new fabric.Textbox(text, {
            lockUniScaling: true,
            hasControls: false, // TODO select mode にしたときは true にする
            fill: editor.freeDrawingBrush.color,
            fontSize: DEFAULT_TEXT_SIZE,
            // editable: false,
          })
          textbox.set('left', mousePos.x + 2)
          textbox.set('top', mousePos.y + 46)
          editor.add(textbox)
          editor.setActiveObject(textbox)
          lastText = textbox

          getHistoryInstance().push({ type: 'text:created', targets: [textbox] })
          textbox.on('removed', createListen('text:removed', [textbox]))
        }
      } else {
        if (text) {
          getHistoryInstance().push({
            type: 'text:updated',
            targets: [lastText],
            lastValue: lastText.get('text'),
          })

          textbox = lastText
          textbox.set('text', text)
        } else {
          editor.remove(lastText)
          lastText = null
        }
        // text.set('text', text.get('text') + char)
        //text.insertChars(char);
        //text.setSelectionEnd(9999);
        editor.renderAll()
      }

      lastTextPos.x = mousePos.x
      lastTextPos.y = mousePos.y
    })

    body.addEventListener('mousemove', (e) => {
      mousePos.x = e.pageX
      mousePos.y = e.pageY - 44 // header offset

      // if (this.inputModeLabel) {
      //   this.inputModeLabel.set('left', mousePos.x + 4)
      //   this.inputModeLabel.set('top', mousePos.y + 44)
      // }

      if (this.modeIcon) {
        this.modeIcon.set('left', mousePos.x + 5)
        this.modeIcon.set('top', mousePos.y + 18)
      }

      // ht.pixy.set({
      //     left: mousePos.x - 12,
      //     top: mousePos.y + 28
      // });

      editor.renderAll()

      // 10px ずれたら Textbox オブジェクトを新たに作る
      if (
        mousePos.x < lastTextPos.x - OFFSET ||
        lastTextPos.x + OFFSET < mousePos.x ||
        mousePos.y < lastTextPos.y - OFFSET ||
        lastTextPos.y + OFFSET < mousePos.y
      ) {
        isMoved = true
        document.querySelector('[name=hiddenInput]').value = ''
      }
    })

    body.addEventListener('mousedown', () => {
      // this.inputModeLabel.set('visible', false)
      this.modeIcon.set('visible', false)
    })

    body.addEventListener('mouseup', () => {
      // this.inputModeLabel.set('visible', true)
      this.modeIcon.set('visible', true)
    })
  }

  // handleSelectionClear(e) {
  //   const items = e.deselected
  //   items.forEach((item) => {
  //     item.set('hasControls', false)
  //   })
  // }

  addPixy() {
    // editor.add(this.inputModeLabel)
    editor.add(this.modeIcon)
  }

  switchPixy() {
    if (editor.isDrawingMode) {
      this.modeIcon.set('text', 'pen')
    } else {
      this.modeIcon.set('text', 'select')
    }
    editor.renderAll()
  }

  clear() {
    editor.clear()
    editor.set('backgroundColor', FABRIC_CANVAS_OPTIONS.backgroundColor)
    this.addPixy()
  }

  changeColor(color) {
    const objects = editor.getActiveObjects()

    getHistoryInstance().push({
      type: 'object:color-changed',
      targets: objects,
      lastValue: editor.freeDrawingBrush.color,
    })

    editor.freeDrawingBrush.color = color

    if (objects.length === 0) {
      return
    }

    objects.forEach((object) => {
      if (['line', 'path'].includes(object.type)) {
        object.set('stroke', color)
      } else if (object.type === 'textbox') {
        object.set('fill', color)
      }
    })

    editor.renderAll()
  }
}
