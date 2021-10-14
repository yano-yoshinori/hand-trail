import { useEffect, useRef, useState } from 'react'
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

import './App.css'
import Canvas from './Canvas'
import FileModal from './components/FileModal'
import { User } from './types'
import { MIN_RESOLUTION } from './constants/misc'
import { getFiles, login, save } from './api'

const { innerWidth, innerHeight } = window

const canvasWidth = innerWidth < MIN_RESOLUTION.width ? MIN_RESOLUTION.width : innerWidth
const canvasHeight = innerHeight < MIN_RESOLUTION.height ? MIN_RESOLUTION.height : innerHeight

const PAINT_COLORS = [{
  name: 'white',
  color: 'white'
}, {
  name: 'red',
  color: 'red'
}, {
  name: 'lime',
  color: 'lime'
}, {
  name: 'skyblue',
  color: 'skyblue'
}] as const

// function undo() {
//   const { editor }: any = global
//   const item = editor.item(editor.size() - 1)
//   editor.remove(item)
// }

function App() {
  const ref = useRef<HTMLCanvasElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const canvasRef = useRef<Canvas>()
  const [user, updateUser] = useState<User>({ uid: '', displayName: '' })
  const [files, updateFiles] = useState<string[]>([])
  const [currentColor, setCurrentColor] = useState<string>('white')
  const [fileOperationMode, updateFileOperationMode] = useState<boolean>(false)
  const [visibleFileModal, updateVisibleFileModal] = useState<boolean>(false)

  useEffect(() => {
    canvasRef.current = new Canvas(ref.current)

    inputRef.current?.focus()

    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        // User is signed in.
        updateUser({ uid: user.uid, displayName: user.displayName || '' })
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
            type="button"
            className="btn btn-secondary btn-sm me-2"
            title="file menu"
            data-bs-toggle="modal"
            data-bs-target="#exampleModal"
            onClick={async () => {
              updateFileOperationMode(true)
              updateVisibleFileModal(true)
              const files = await getFiles(user)
              updateFiles(files)
            }}
          >
            <i className="fa fa-folder" />
          </button>
          <button
            className="btn btn-secondary btn-sm me-4"
            title="new"
            onClick={() => {
              canvasRef.current?.clear()
            }}
          >
            <i className="fa fa-file" />
          </button>
          {/* <button className="btn btn-secondary btn-sm me-2" onClick={undo}>
            undo
          </button> */}

          {PAINT_COLORS.map(({ name, color }) => (
            <button key={name} title={name} className={`btn btn-${currentColor === color ? 'primary' : 'secondary'} btn-sm me-2`} onClick={() => {
              canvasRef.current?.changeColor(color)
              setCurrentColor(color)
            }}>
              <i className="fas fa-tint" style={{ color }} />
            </button>
          ))}
        </div>

        <textarea
          name="hiddenInput"
          ref={inputRef}
          className="form-control form-control-sm me-2 bg-secondary text-white"
          // TODO 空のときは caret を transparent にする
          style={{
            width: 200,
            height: '1rem',
            caretColor: 'lightgray',
            border: 'darkgray',
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
        <div className="d-flex">
          {user.displayName ? (
            <>
              <button
                type="button"
                className="btn btn-secondary btn-sm me-2"
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
              <button
                type="button"
                className="btn btn-primary btn-sm"
                title="save"
                onClick={() => save(user)}
              >
                <i className="fa fa-save" />
              </button>
              <span className="pt-1 ms-2 text-white" title={user.displayName}>
                {user.displayName.substr(0, 1)}
              </span>
            </>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-sm ms-2"
              title="login"
              onClick={() => login(updateUser)}
            >
              login
            </button>
          )}
        </div>
      </header>
      <div>
        <canvas ref={ref} width={canvasWidth} height={canvasHeight}></canvas>
      </div>

      {/* components */}
      <FileModal
        open={visibleFileModal}
        files={files}
        user={user}
        onClickClose={() => {
          updateFileOperationMode(false)
          updateVisibleFileModal(false)
          inputRef.current?.focus()
        }}
      />
    </div>
  )
}

export default App
