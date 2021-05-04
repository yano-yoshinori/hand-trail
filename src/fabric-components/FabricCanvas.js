import { fabric } from 'fabric'

var lastDrawingMode = false

const FabricCanvas = fabric.util.createClass(fabric.Canvas, {
  drawStart: function (e) {
    // フリーハンドモードを on にする
    lastDrawingMode = global.editor.isDrawingMode
    global.editor.isDrawingMode = true
    this._onMouseDownInDrawingMode(e)
  },

  drawEnd: function (e) {
    // フリーハンドモードを off にする
    this._onMouseUpInDrawingMode(e)
    global.editor.isDrawingMode = lastDrawingMode
  },
})

export default FabricCanvas
