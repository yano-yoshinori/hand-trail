import React, { Fragment, useEffect, useRef, useState, KeyboardEvent } from 'react'
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import { fabric } from 'fabric'
import { Dropdown } from 'bootstrap'

import './App.css'
import Canvas from './Canvas'
import { FileModal } from './components/FileModal'
import { FileSummary, User } from './types'
import { HEADER_HEIGHT, SCROLL_BAR_WIDTH, STORAGE_KEYS } from './constants/misc'
import { getFiles, loadFile, login, save } from './api'
import { ConfigModal } from './components/ConfigModal'
import { createHistoryInstance, getHistoryInstance } from './models/History'
import { initializeToast, openToast, Toast } from './components/Toast'
import { IS_ANDROID, IS_IPAD, IS_IPHONE, IS_MAC, IS_TOUCH_DEVICE } from './util'
import { ENV_VARS } from './models/EnvVars'
import { handleCopy } from './models/handleCopy'
import { handlePaste } from './models/handlePaste'
import { readFilename, writeFilename } from './models/FileName'
import { Canvas as NewCanvas } from './fabric-components/canvas/Canvas'
import assert from 'assert'

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

function App() {
  const ref = useRef<HTMLCanvasElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const repeatInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<Canvas | NewCanvas>()
  const [user, updateUser] = useState<User>({ uid: '', displayName: '' })
  const [files, updateFiles] = useState<FileSummary[]>([])
  const [currentColor, setCurrentColor] = useState<string>('white')
  const [fileOperationMode, updateFileOperationMode] = useState<boolean>(false)
  const [undoEnabled, setUndoEnabled] = useState(false)
  const zoomRef = useRef(1)
  const dropdownRef = useRef<Dropdown>()

  const handleClickSave = async () => {
    const result = await save(user)
    if (!result) return

    getHistoryInstance().clear()
    setUndoEnabled(false)

    openToast('保存しました')
  }

  useEffect(() => {
    assert(ref.current)

    const CanvasClass = ENV_VARS.newCanvas ? NewCanvas : Canvas
    canvasRef.current = new CanvasClass(ref.current, {
      width: innerWidth - scrollBarWidth,
      height: canvasHeight,
    })

    inputRef.current?.focus()

    createHistoryInstance((enabled: boolean) => {
      setUndoEnabled(enabled)
    })

    const toastEl = document.querySelector('.toast')

    if (toastEl) {
      initializeToast(toastEl)
    }

    function resize() {
      const { innerWidth } = window
      canvasRef.current?.resize(innerWidth - scrollBarWidth, canvasHeight)
    }

    window.addEventListener('resize', resize)

    function error(error: ErrorEvent) {
      console.error(`Error: ${JSON.stringify(error)}`)
    }

    window.addEventListener('error', error)
    document.addEventListener('copy', handleCopy)
    document.addEventListener('paste', handlePaste)

    if (ENV_VARS.env === 'local') {
      return
    }

    const dropdownEl = document.querySelector('.dropdown-toggle') as HTMLDivElement
    dropdownRef.current = new Dropdown(dropdownEl)

    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        // User is signed in.
        updateUser({ uid: user.uid, displayName: user.displayName || '' })
        ;(global as any).user = user
      } else {
        // No user is signed in.
      }
    })

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('error', error)
    }
  }, [])

  const logined = Boolean(user.displayName)

  return (
    <div>
      <header
        className="px-2 d-flex justify-content-between align-items-center sticky-top"
        style={{
          width: '100%',
          height: HEADER_HEIGHT,
          backgroundColor: '#333',
        }}
      >
        <div className="d-flex align-items-center">
          {/* file menu */}
          {true && (
            <>
              <div className="dropdown">
                <button
                  className="btn btn-secondary btn-sm dropdown-toggle me-2"
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

                        getHistoryInstance().clear()
                        setUndoEnabled(false)
                        canvasRef.current?.clear()
                        writeFilename('')
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
                        let url

                        try {
                          url = ref.current?.toDataURL()
                        } catch (error) {
                          alert(`Error: ${JSON.stringify(error)}`)
                          return
                        }

                        const name = readFilename()

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
              <span
                className="filename text-truncate text-center me-2"
                style={{ width: IS_TOUCH_DEVICE ? 120 : 160, color: '#6c757d' }}
              />
            </>
          )}

          {/* zoom out */}
          <button
            title="zoom out"
            className="btn btn-secondary btn-sm me-2"
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
            className="btn btn-secondary btn-sm me-2"
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
            className="btn btn-secondary btn-sm me-2"
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
            className="btn btn-secondary btn-sm me-2"
            disabled={!undoEnabled}
            onClick={() => {
              const length = getHistoryInstance().undo()
              setUndoEnabled(length > 0)
            }}
          >
            <i className="fa fa-undo" />
          </button>

          {/* colors */}
          <div className="me-2">
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
                  className="btn btn-secondary btn-sm"
                  style={{
                    paddingLeft: '0.75rem',
                    paddingRight: '0.75rem',
                    borderColor: currentColor === color ? 'gray' : '#333',
                  }}
                >
                  <i className="fas fa-tint" style={{ color }} />
                </label>
              </Fragment>
            ))}
          </div>

          {IS_TOUCH_DEVICE && (
            <>
              {/* mode switch */}
              <div className="form-check me-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="modeForTablet"
                  onChange={() => {
                    const { editor }: any = global

                    editor.isDrawingMode = !editor.isDrawingMode
                    editor.discardActiveObject()
                    canvasRef.current?.switchPixy()
                  }}
                />
                <label className="form-check-label text-white" htmlFor="modeForTablet">
                  Select
                </label>
              </div>
              {/* trash */}
              <button
                title="trash"
                className="btn btn-secondary btn-sm me-2"
                onClick={() => {
                  const { editor }: any = global

                  const items = editor.getActiveObjects()
                  items.forEach((item: any) => {
                    editor.remove(item)
                  })
                  editor.discardActiveObject()
                }}
              >
                <i className="fa fa-trash" />
              </button>
            </>
          )}

          <input
            name="hiddenInput"
            hidden={IS_IPHONE || IS_IPAD || IS_ANDROID}
            ref={inputRef}
            className="form-control form-control-sm me-2 bg-secondary text-white"
            // TODO 空のときは caret を transparent にする
            style={{
              width: IS_TOUCH_DEVICE ? 160 : 200,
              height: '1rem',
              caretColor: 'lightgray',
              border: 'darkgray',
              resize: 'none',
            }}
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
              const { key } = e

              if (key === 'Tab') {
                e.preventDefault()
              }
            }}
            onBlur={() => {
              if (fileOperationMode) return

              setTimeout(() => {
                if (!repeatInputRef.current || repeatInputRef.current.style.width === '120px')
                  return
                inputRef.current?.focus()
              }, 100)
            }}
            onPaste={(e: React.ClipboardEvent) => {
              e.preventDefault()
            }}
          />

          {/* 連続射出 */}
          {IS_TOUCH_DEVICE && (
            <input
              type="text"
              ref={repeatInputRef}
              placeholder="連続射出"
              title="連続射出"
              className="form-control form-control-sm me-2 bg-secondary text-white"
              style={{ width: 32 }}
              onFocus={() => {
                if (repeatInputRef.current) {
                  repeatInputRef.current.style.width = '120px'
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

                if (repeatInputRef.current) {
                  repeatInputRef.current.style.width = '32px'
                }

                setTimeout(() => {
                  // TODO バグるので一時的にコメントアウト
                  // textareaRef.current?.focus()
                })
              }}
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                const { key } = e

                if (key === 'Enter') {
                  e.preventDefault()

                  // テキスト射出
                  const point = new fabric.Point(repeatInputRef.current?.offsetLeft ?? 0, 0)
                  canvasRef.current?.createTextbox(repeatInputRef.current?.value, point, textRepeat)

                  textRepeat += 1

                  if (repeatInputRef.current) {
                    repeatInputRef.current.value = ''
                  }
                }
              }}
            />
          )}
        </div>

        <div className="d-flex">
          {logined ? (
            <>
              {/* save */}
              <button
                type="button"
                className={`btn ${undoEnabled ? 'btn-primary' : 'btn-secondary'} btn-sm me-2`}
                title="save"
                disabled={!undoEnabled}
                onClick={handleClickSave}
              >
                <i className="fa fa-save" />
              </button>
              {/* user name */}
              <span className="pt-1 mx-2 text-white" title={user.displayName}>
                {user.displayName.substr(0, 1)}
              </span>
              {/* config */}
              <button
                type="button"
                className="btn btn-secondary btn-sm"
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
              className="btn btn-secondary btn-sm ms-2"
              title="login"
              onClick={() => login(updateUser)}
            >
              login
            </button>
          )}
        </div>
      </header>
      <canvas ref={ref} />

      {/* components */}
      <FileModal
        files={files}
        user={user}
        onClickClose={() => {
          updateFileOperationMode(false)
          inputRef.current?.focus()
          canvasRef.current?.addPixy()
        }}
        onClickSave={handleClickSave}
        onClickOpen={(name) => {
          loadFile(name, user.uid)
          getHistoryInstance().clear()
          setUndoEnabled(false)
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
