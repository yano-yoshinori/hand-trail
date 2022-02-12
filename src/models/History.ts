import { fabric } from 'fabric'
import _ from 'lodash'

interface History {
  type: string
  targets: fabric.Object[]
  lastValue?: number | string | fabric.Point
}

interface LastValue {
  left: number | undefined
  top: number | undefined
  scaleX: number | undefined
  angle: number | undefined
  target: fabric.Object
}

type Callback = (enabled: boolean) => void

class Histories {
  private items: History[] = []
  // cursor: number = 0
  lastValues: LastValue[] = []
  callback: Callback

  constructor(callback: Callback) {
    this.callback = callback
  }

  hasHistory(): boolean {
    return this.items.length > 0
  }

  push(item: History) {
    this.items.push(item)
    this.callback(this.items.length > 0)
  }

  clear() {
    this.items.length = 0
  }

  setLastValues(objects: fabric.Object[]) {
    this.lastValues = objects.map((object) => {
      return {
        left: object.get('left'),
        top: object.get('top'),
        scaleX: object.get('scaleX'),
        angle: object.get('angle'),
        target: object,
      }
    })
  }

  getLastValue(object: fabric.Object) {
    const found = this.lastValues.find((value) => value.target === object)
    // console.log(found)
    return found
  }

  undo() {
    if (this.items.length === 0) return 0

    const item = this.items.pop()

    if (!item) return 0

    const { type, targets, lastValue } = item

    switch (type) {
      case 'created': {
        const target = _.first(targets)
        const { editor }: any = global

        target?.off('removed')
        editor.remove(target)
        target?.on('removed', createListen(type.replace('created', 'removed'), [target]))

        editor.renderAll()
        break
      }
      case 'text:updated': {
        const target = _.first(targets)
        const textbox = target as fabric.Textbox
        textbox?.set('text', lastValue as string)
        const { editor }: any = global
        editor.renderAll()
        break
      }
      case 'removed': {
        const target = _.first(targets)
        const { editor }: any = global
        editor.add(target)
        break
      }
      case 'color-changed': {
        targets.forEach(function (target) {
          if (!target.type) return

          if (['line', 'path'].includes(target.type)) {
            target.set('stroke', lastValue as string)
          } else if (target.type === 'i-text') {
            target.set('fill', lastValue as string)
          }
        })
        const { editor }: any = global
        editor.renderAll()
        break
      }
      case 'moved': {
        targets.forEach(function (target) {
          if (!target.type) return

          const point = lastValue as fabric.Point
          target.set('left', point.x)
          target.set('top', point.y)
        })
        const { editor }: any = global
        editor.renderAll()
        break
      }
      case 'scaled': {
        targets.forEach(function (target) {
          if (!target.type) return

          target.set('scaleX', lastValue as number)
          target.set('scaleY', lastValue as number)
        })
        const { editor }: any = global
        editor.renderAll()

        break
      }
      case 'rotated': {
        targets.forEach(function (target) {
          if (!target.type) return

          target.set('angle', lastValue as number)
        })
        const { editor }: any = global
        editor.renderAll()

        break
      }
    }

    return this.items.length
  }
}

let history: Histories

export const createHistoryInstance = (callback: Callback) => {
  if (history) return

  history = new Histories(callback)
}

export const getHistoryInstance = () => history

export function createListen(type: string, targets: fabric.Object[]) {
  return function () {
    getHistoryInstance().push({ type, targets })
  }
}

// function onPathRemoved(e:any) {
//   getHistoryInstance().push({ type: 'path:removed', targets: [e] })
// }

// function onLineRemoved(e: any) {
//   getHistoryInstance().push({ type: 'line:removed', targets: [e] })
// }

// function onTextRemoved(e: any) {
//   getHistoryInstance().push({ type: 'text:removed', targets: [e] })
// }

// export function getListener(type: string) {
//   switch (type) {
//     case 'path:removed':
//       return onPathRemoved
//     case 'line:removed':
//       return onLineRemoved
//     case 'text:removed':
//       return onTextRemoved
//   }
// }
