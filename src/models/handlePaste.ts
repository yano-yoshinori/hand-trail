import assert from 'assert'
import { fabric } from 'fabric'
import _ from 'lodash'

import { closeToast, openToast } from '../components/Toast'
import {
  DEFAULT_TEXT_SIZE,
  FABRIC_DATA_IN_CLIPBOARD,
  HEADER_HEIGHT,
  STORAGE_KEYS,
} from '../constants/misc'
import { getClipboard } from './handleCopy'
import { upload } from './Upload'
import { getHistoryInstance } from './History'
import { listenModification } from '../Canvas'

export async function handlePaste(e: ClipboardEvent) {
  if (!e.clipboardData) return

  const items: DataTransferItem[] = Array.from(e.clipboardData.items)
  assert(items.length > 0)

  const item: DataTransferItem = _.first(items) as DataTransferItem
  assert(item)

  if (item.type.startsWith('image')) {
    pasteImage(item)
  } else {
    const text = await navigator.clipboard.readText()

    if (text.startsWith(FABRIC_DATA_IN_CLIPBOARD)) {
      pasteFabricObject()
    } else {
      pasteText(text)
    }
  }

  async function pasteFabricObject() {
    const { mousePos, editor }: any = global
    const data = getClipboard()

    data.clone(function (cloned: any) {
      const left = mousePos.x
      const top = mousePos.y + cloned.get('height') / 2

      if (cloned.type === 'activeSelection') {
        cloned.forEachObject(function (obj: any) {
          // TODO もともとのオブジェクトの位置関係がくずれてしまう
          obj.set({ left, top })
          editor.add(obj)
        })
      } else {
        cloned.set({ left, top })
        editor.add(cloned)
      }

      editor.setActiveObject(cloned)
      editor.renderAll()
    })
  }

  function pasteText(text: string) {
    const { mousePos, editor }: any = global

    const sFontSize = localStorage.getItem(STORAGE_KEYS.fontSize)
    const fontSize = sFontSize ? Number(sFontSize) : DEFAULT_TEXT_SIZE

    const textbox = new fabric.Textbox(text, {
      lockUniScaling: true,
      hasControls: false, // TODO select mode にしたときは true にする
      fill: editor.freeDrawingBrush.color,
      fontSize,
      // editable: false,
      left: mousePos.x,
      top: mousePos.y + HEADER_HEIGHT,
    })
    editor.add(textbox)
  }
}

async function pasteImage(item: DataTransferItem) {
  openToast('Uploading...', false)

  const { mousePos, editor, user }: any = global

  const blob = item.getAsFile()
  assert(blob)

  const url = await upload(user.uid, Date.now().toFixed(), blob)

  const image = new fabric.Image()
  image.setSrc(
    url,
    function () {
      image.set({
        left: mousePos.x,
        top: mousePos.y + HEADER_HEIGHT,
        originX: 'center',
        originY: 'center',
      })
      image.sendToBack()
      editor.add(image)
      editor.renderAll()
      getHistoryInstance().push({ type: 'created', targets: [image] })
      listenModification(image)

      closeToast()
    }
    // これでは解決しなかった
    // {
    //   crossOrigin: 'anonymous',
    // }
  )
}
