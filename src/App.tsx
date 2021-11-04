import { Fragment, useEffect, useRef, useState, KeyboardEvent } from 'react'
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import { fabric } from 'fabric'
import _ from 'lodash'
import { Dropdown } from 'bootstrap'

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

// 連続射出機能
let textRepeat = 0

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
  })
}

function App() {
  const ref = useRef<HTMLCanvasElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<Canvas>()
  const [user, updateUser] = useState<User>({ uid: '', displayName: '' })
  const [files, updateFiles] = useState<FileSummary[]>([])
  const [currentColor, setCurrentColor] = useState<string>('white')
  const [fileOperationMode, updateFileOperationMode] = useState<boolean>(false)
  const [undoEnabled, setUndoEnabled] = useState(false)
  const zoomRef = useRef(1)
  const dropdownRef = useRef<Dropdown>()

  useEffect(() => {
    canvasRef.current = new Canvas(ref.current)

    textareaRef.current?.focus()

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

    const dropdownEl = document.querySelector('.dropdown-toggle') as HTMLDivElement
    dropdownRef.current = new Dropdown(dropdownEl)

    function resize() {
      const { innerWidth } = window
      canvasRef.current?.resize(innerWidth - scrollBarWidth, canvasHeight)
    }

    window.addEventListener('resize', resize)

    return () => {
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div className="text-center">
      <header
        className="px-2 d-flex justify-content-between align-items-center"
        style={{ width: '100%', height: 44, top: 0, zIndex: 1, backgroundColor: '#333' }}
      >
        <div className="d-flex align-items-center">
          {/* file menu */}
          <div className="dropdown">
            <button
              className="btn btn-outline-secondary btn-sm dropdown-toggle me-2"
              type="button"
              data-bs-toggle="dropdown"
              onClick={() => {
                dropdownRef.current?.show()
              }}
            >
              File
            </button>
            <ul className="dropdown-menu">
              {/* new */}
              <li>
                <button
                  className="dropdown-item"
                  title="new"
                  onClick={() => {
                    const result = window.confirm('クリアします。よろしいですか？')

                    if (!result) return

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
                  {/* <i className="fa fa-file me-1" /> */}
                  New
                </button>
              </li>
              {/* open */}
              <li>
                <button
                  type="button"
                  className="dropdown-item"
                  title="file menu"
                  data-bs-toggle="modal"
                  data-bs-target="#file-modal"
                  onClick={async () => {
                    updateFileOperationMode(true)
                    const files = await getFiles(user)
                    updateFiles(files)
                  }}
                >
                  {/* <i className="fa fa-folder" /> */}
                  Open
                </button>
              </li>
              {/* export */}
              <li>
                <button
                  type="button"
                  className="dropdown-item"
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
                  {/* <i className="fa fa-download me-1" /> */}
                  Export
                </button>
              </li>
            </ul>
          </div>

          {/* file name */}
          <input
            type="text"
            disabled
            name="filename"
            className="text-truncate me-2"
            style={{ width: 160 }}
          />

          {/* zoom out */}
          <button
            title="zoom out"
            className="btn btn-outline-secondary btn-sm me-2"
            onClick={() => {
              if (zoomRef.current <= 0.5) return

              zoomRef.current -= 0.1
              canvasRef.current?.zoom(zoomRef.current, innerWidth - scrollBarWidth, innerHeight)
            }}
          >
            <i className="fa fa-search-minus" />
          </button>

          {/* zoom reset */}
          <button
            title="zoom reset"
            className="btn btn-outline-secondary btn-sm me-2"
            onClick={() => {
              if (zoomRef.current <= 0.5) return

              zoomRef.current = 1
              canvasRef.current?.zoom(zoomRef.current, innerWidth - scrollBarWidth, innerHeight)
            }}
          >
            <i className="fa fa-search" />
          </button>

          {/* zoom in */}
          <button
            title="zoom in"
            className="btn btn-outline-secondary btn-sm me-2"
            onClick={() => {
              if (zoomRef.current >= 2) return

              zoomRef.current += 0.1
              canvasRef.current?.zoom(zoomRef.current, innerWidth - scrollBarWidth, innerHeight)
            }}
          >
            <i className="fa fa-search-plus" />
          </button>

          {/* undo */}
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

          {/* colors */}
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
            ref={textareaRef}
            className="form-control form-control-sm me-2 bg-secondary text-white"
            // TODO 空のときは caret を transparent にする
            style={{
              width: 200,
              height: '1rem',
              caretColor: 'lightgray',
              border: 'darkgray',
              resize: 'none',
            }}
            onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
              const { key } = e

              if (key === 'Tab') {
                e.preventDefault()
              }
            }}
            onBlur={() => {
              if (fileOperationMode) return

              setTimeout(() => {
                if (!inputRef.current || inputRef.current.style.width === '120px') return
                textareaRef.current?.focus()
              }, 100)
            }}
          />

          {/* 連続射出 */}
          <input
            type="text"
            ref={inputRef}
            placeholder="連続射出"
            title="連続射出"
            className="form-control form-control-sm me-2 bg-secondary text-white"
            style={{ width: 32 }}
            onFocus={() => {
              if (inputRef.current) {
                inputRef.current.style.width = '120px'
              }
            }}
            // onBlur={() => {
            //   textRepeat = 0

            //   if (inputRef.current) {
            //     inputRef.current.size = 1
            //   }

            //   setTimeout(() => {
            //     textareaRef.current?.focus()
            //   })
            // }}
            onMouseOut={() => {
              textRepeat = 0

              if (inputRef.current) {
                inputRef.current.style.width = '32px'
              }

              setTimeout(() => {
                textareaRef.current?.focus()
              })
            }}
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
              const { key } = e

              if (key === 'Enter') {
                e.preventDefault()

                // テキスト射出
                const point = new fabric.Point(inputRef.current?.offsetLeft ?? 0, 0)
                canvasRef.current?.createTextbox(inputRef.current?.value, point, textRepeat)

                textRepeat += 1

                if (inputRef.current) {
                  inputRef.current.value = ''
                }
              }
            }}
          />
        </div>

        <div className="d-flex">
          {user.displayName ? (
            <>
              {/* save */}
              <button
                type="button"
                className="btn btn-outline-primary btn-sm me-2"
                title="save"
                onClick={() => {
                  save(user)
                  openToast('保存しました')
                }}
              >
                <i className="fa fa-save" />
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
          textareaRef.current?.focus()
          canvasRef.current?.addPixy()
        }}
      />
      <ConfigModal
        onClickClose={() => {
          updateFileOperationMode(false)
          textareaRef.current?.focus()
          canvasRef.current?.addPixy()
        }}
      />

      <Toast />
    </div>
  )
}

export default App
