import { fabric } from 'fabric'
import _ from 'lodash'

interface History {
  type: string
  targets: fabric.Object[]
  lastValue?: number | string
}

type Callback = (enabled: boolean) => void

class Histories {
  items: History[] = []
  // cursor: number = 0
  callback: Callback

  constructor(callback: Callback) {
    this.callback = callback
  }

  push(item: History) {
    this.items.push(item)
    this.callback(this.items.length > 0)
  }

  undo() {
    if (this.items.length === 0) return 0

    const item = this.items.pop()

    if (!item) return 0

    const { type, targets, lastValue } = item

    switch (type) {
      case 'line:created':
      case 'path:created':
      case 'text:created': {
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
      case 'line:removed':
      case 'path:removed':
      case 'text:removed': {
        const target = _.first(targets)
        const { editor }: any = global
        editor.add(target)
        break
      }
      case 'object:color-changed': {
        targets.forEach(function (target) {
          if (!target.type) return

          if (['line', 'path'].includes(target.type)) {
            target.set('stroke', lastValue as string)
          } else if (target.type === 'textbox') {
            target.set('fill', lastValue as string)
          }
        })
        const { editor }: any = global
        editor.renderAll()
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
