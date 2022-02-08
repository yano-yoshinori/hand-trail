import { fabric } from 'fabric'

const FABRIC_CANVAS_OPTIONS = {
  isDrawingMode: true,
  selectionFullyContained: true,
  backgroundColor: '#545554',
  // imageSmoothingEnabled: true,
  // allowTouchScrolling: IS_IPAD || IS_ANDROID,
}

export class Canvas {
  private fabricCanvas: fabric.Canvas
  private currentMousePos: { x: number; y: number } = { x: 0, y: 0 }

  constructor(canvasEl: HTMLCanvasElement, options: {}) {
    this.fabricCanvas = new fabric.Canvas(canvasEl, { ...FABRIC_CANVAS_OPTIONS, ...options })

    this.fabricCanvas.on('mouse:move', this.onMouseMove)
  }

  onMouseMove = (e: fabric.IEvent) => {
    const { x, y } = e.pointer ?? { x: 0, y: 0 }

    this.currentMousePos.x = x
    this.currentMousePos.y = y
  }

  resize(width: number, height: number) {
    //
  }

  clear() {
    //
  }

  zoom(value: number, width: number, height: number) {
    //
  }

  changeColor(color: string) {
    //
  }

  addPixy() {
    //
  }

  switchPixy() {
    //
  }

  createTextbox(text: string | undefined, mousePos: fabric.Point, rows: number) {
    //
  }
}
