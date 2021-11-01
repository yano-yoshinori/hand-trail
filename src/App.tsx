import { Fragment, useEffect, useRef, useState } from 'react'
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import { fabric } from 'fabric'
import _ from 'lodash'

import './App.css'
import Canvas, { listenModification } from './Canvas'
import { FileModal } from './components/FileModal'
import { FileSummary, User } from './types'
import { HEADER_HEIGHT, SCROLL_BAR_WIDTH, STORAGE_KEYS } from './constants/misc'
import { getFiles, login, save } from './api'
import { ConfigModal } from './components/ConfigModal'
import { createHistoryInstance, getHistoryInstance } from './models/History'
import { upload } from './models/Upload'
import { closeToast, initializeToast, openToast, Toast } from './components/Toast'
import { IS_ANDROID, IS_IPAD, IS_IPHONE, IS_MAC } from './util'

const { innerWidth, innerHeight } = window

// const canvasWidth = innerWidth < MIN_RESOLUTION.width ? MIN_RESOLUTION.width : innerWidth

const sCanvasHeight = localStorage.getItem(STORAGE_KEYS.canvasHeight)
const canvasHeight = sCanvasHeight ? Number(sCanvasHeight) : innerHeight

const PAINT_COLORS = [
  {
    name: 'white',
    color: 'white',
  },
  {
    name: 'red',
    color: 'red',
  },
  {
    name: 'lime',
    color: 'lime',
  },
  {
    name: 'skyblue',
    color: 'skyblue',
  },
] as const

const scrollBarWidth = IS_IPHONE || IS_IPAD || IS_ANDROID || IS_MAC ? 0 : SCROLL_BAR_WIDTH

document.onpaste = async function (e: ClipboardEvent) {
  if (!e.clipboardData) return

  const items = Array.from(e.clipboardData.items)

  if (items.length === 0) {
    return
  }

  const item: any = _.first(items)

  if (!item.type.startsWith('image')) {
    return
  }

  openToast('Uploading...', false)

  const { mousePos, editor, user }: any = global

  const blob = item.getAsFile()
  const url = await upload(user.uid, Date.now().toFixed(), blob)

  const image = new fabric.Image()
  image.setSrc(url, function () {
    const width = image.get('width') ?? 0
    const height = image.get('height') ?? 0
    image.set({
      left: mousePos.x + width / 2,
      top: mousePos.y + height / 2 + HEADER_HEIGHT,
      originX: 'center',
      originY: 'center',
    })
    editor.add(image)
    editor.renderAll()
    getHistoryInstance().push({ type: 'created', targets: [image] })
    listenModification(image)

    closeToast()
  })
}

function App() {
  const ref = useRef<HTMLCanvasElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const canvasRef = useRef<Canvas>()
  const [user, updateUser] = useState<User>({ uid: '', displayName: '' })
  const [files, updateFiles] = useState<FileSummary[]>([])
  const [currentColor, setCurrentColor] = useState<string>('white')
  const [fileOperationMode, updateFileOperationMode] = useState<boolean>(false)
  const [undoEnabled, setUndoEnabled] = useState(false)

  useEffect(() => {
    canvasRef.current = new Canvas(ref.current)

    inputRef.current?.focus()

    createHistoryInstance((enabled: boolean) => {
      setUndoEnabled(enabled)
    })

    const toastEl = document.querySelector('.toast')

    if (toastEl) {
      initializeToast(toastEl)
    }

    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        // User is signed in.
        updateUser({ uid: user.uid, displayName: user.displayName || '' })
        ;(global as any).user = user
      } else {
        // No user is signed in.
      }
    })
  }, [])

  return (
    <div className="text-center">
      <header
        className="position-fixed px-2 d-flex justify-content-between align-items-center"
        style={{ width: '100%', height: 44, top: 0, zIndex: 1, backgroundColor: '#333' }}
      >
        <div className="d-flex align-items-center">
          <button
            title="undo"
            className="btn btn-outline-secondary btn-sm me-2"
            disabled={!undoEnabled}
            onClick={() => {
              const length = getHistoryInstance().undo()
              setUndoEnabled(length > 0)
            }}
          >
            <i className="fa fa-undo" />
          </button>

          <div className="btn-group me-4">
            {PAINT_COLORS.map(({ name, color }) => (
              <Fragment key={name}>
                <input
                  type="radio"
                  name="pen-color"
                  checked={currentColor === color}
                  id={`pen-color-${name}`}
                  className="btn-check"
                  onChange={() => {
                    canvasRef.current?.changeColor(color)
                    setCurrentColor(color)
                  }}
                />
                <label
                  htmlFor={`pen-color-${name}`}
                  title={name}
                  className="btn btn-outline-secondary btn-sm"
                  style={{ paddingLeft: '0.75rem', paddingRight: '0.75rem' }}
                >
                  <i className="fas fa-tint" style={{ color }} />
                </label>
              </Fragment>
            ))}
          </div>

          <textarea
            name="hiddenInput"
            hidden={IS_IPHONE || IS_IPAD || IS_ANDROID}
            ref={inputRef}
            className="form-control form-control-sm me-2 bg-secondary text-white"
            // TODO 空のときは caret を transparent にする
            style={{
              width: 200,
              height: '1rem',
              caretColor: 'lightgray',
              border: 'darkgray',
              resize: 'none',
            }}
            onKeyDown={(e) => {
              if (e.key === 'Tab') {
                e.preventDefault()
              }
            }}
            onBlur={() => {
              if (fileOperationMode) return

              setTimeout(() => {
                inputRef.current?.focus()
              })
            }}
          />
        </div>

        <div className="d-flex">
          {user.displayName ? (
            <>
              {/* new */}
              <button
                className="btn btn-outline-secondary btn-sm me-2"
                title="new"
                onClick={() => {
                  canvasRef.current?.clear()
                  const inputs = document.querySelectorAll(
                    'input[name=filename]'
                  ) as NodeListOf<HTMLInputElement>
                  inputs.forEach((input) => {
                    input.value = ''
                    input.title = ''
                  })
                }}
              >
                <i className="fa fa-file" />
              </button>

              {/* open */}
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm me-2"
                title="file menu"
                data-bs-toggle="modal"
                data-bs-target="#file-modal"
                onClick={async () => {
                  updateFileOperationMode(true)
                  const files = await getFiles(user)
                  updateFiles(files)
                }}
              >
                <i className="fa fa-folder" />
              </button>
              {/* file name */}
              <input
                type="text"
                disabled
                name="filename"
                className="text-truncate me-2"
                style={{ width: 160 }}
              />
              {/* save */}
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm me-2"
                title="save"
                onClick={() => {
                  save(user)
                  openToast('保存しました')
                }}
              >
                <i className="fa fa-save" />
              </button>
              {/* export */}
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm me-2"
                title="export"
                onClick={() => {
                  const url = ref.current?.toDataURL()

                  const input = document.querySelector('input[name=filename]') as HTMLInputElement
                  const name = input.value

                  if (!url || !name) return

                  const a = document.createElement('a')
                  a.href = url
                  a.download = `${name}.png`
                  a.click()
                  a.remove()
                }}
              >
                <i className="fa fa-download" />
              </button>
              {/* user name */}
              <span className="pt-1 me-2 text-white" title={user.displayName}>
                {user.displayName.substr(0, 1)}
              </span>
              {/* config */}
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                title="config"
                data-bs-toggle="modal"
                data-bs-target="#config-modal"
                onClick={() => {
                  updateFileOperationMode(true)
                }}
              >
                <i className="fa fa-cog" />
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm ms-2"
              title="login"
              onClick={() => login(updateUser)}
            >
              login
            </button>
          )}
        </div>
      </header>
      <div>
        <canvas ref={ref} width={innerWidth - scrollBarWidth} height={canvasHeight} />
      </div>

      {/* components */}
      <FileModal
        files={files}
        user={user}
        onClickClose={() => {
          updateFileOperationMode(false)
          inputRef.current?.focus()
          canvasRef.current?.addPixy()
        }}
      />
      <ConfigModal
        onClickClose={() => {
          updateFileOperationMode(false)
          inputRef.current?.focus()
          canvasRef.current?.addPixy()
        }}
      />

      <Toast />
    </div>
  )
}

export default App
