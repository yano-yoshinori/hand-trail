import { FABRIC_DATA_IN_CLIPBOARD } from '../constants/misc'

let clipboard: any

export function setClipBoard(aClipboard: any): void {
  clipboard = aClipboard
}

export function getClipboard(): any {
  return clipboard
}

export async function handleCopy() {
  const { editor }: any = global

  const activeObject = editor.getActiveObject()

  if (!activeObject) {
    return
  }

  activeObject.clone(function (cloned: any) {
    const { clipboard } = navigator

    clipboard.writeText(FABRIC_DATA_IN_CLIPBOARD)

    setClipBoard(cloned)
  })
}
