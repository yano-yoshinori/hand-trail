import React, { useEffect, useRef, useState } from 'react'
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

import './App.css'
import Canvas from './Canvas'

const { innerWidth, innerHeight } = window

const minResolutin = {
  width: 1920,
  height: 1080,
}

const canvasWidth = innerWidth < minResolutin.width ? minResolutin.width : innerWidth
const canvasHeight = innerHeight < minResolutin.height ? minResolutin.height : innerHeight

interface User {
  uid: string
  displayName: string
}

interface File {
  date: string
  data: string
}

let focusOn = true

function App() {
  const ref = useRef<HTMLCanvasElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [user, updateUser] = useState<User>({ uid: '', displayName: '' })
  const [files, updateFiles] = useState<string[]>([])

  useEffect(() => {
    new Canvas(ref.current)

    inputRef.current?.focus()

    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        // User is signed in.
        updateUser({ uid: user.uid, displayName: user.displayName || '' })

        const db = firebase.firestore()
        const ref = await db.collection(`users/${user.uid}/drawordFiles`).orderBy('date', 'desc')
        const querySnapshot = await ref.get()
        const data = querySnapshot.docs.map((doc) => doc.id) as string[]
        updateFiles(data)
      } else {
        // No user is signed in.
      }
    })
  }, [])

  function login() {
    const provider = new firebase.auth.GoogleAuthProvider()
    firebase
      .auth()
      .signInWithPopup(provider)
      .then((result) => {
        const user: any = result.user
        updateUser({ uid: user.uid, displayName: user.displayName || '' })

        const db = firebase.firestore()
        db.collection('users').doc(user.uid).set({ name: user.displayName })
      })
      .catch((error) => {
        console.error(error)
      })
  }

  async function save() {
    const input = document.querySelector('input[name=filename]') as HTMLInputElement
    const name = input.value

    if (!name) {
      return
    }

    const db = firebase.firestore()
    const { editor }: any = global

    await db
      .collection(`users/${user.uid}/drawordFiles`)
      .doc(name)
      .set({
        date: new Date(),
        data: JSON.stringify(editor.toJSON()),
      })

    if (!files.includes(name)) {
      updateFiles(files.concat(name))
    }

    alert('保存しました')
  }

  async function loadFile(e: React.ChangeEvent<HTMLSelectElement>) {
    const { editor }: any = global
    const name = e.target.value

    if (!name) {
      editor.clear()
      return
    }

    const db = firebase.firestore()
    const ref = await db.collection(`users/${user.uid}/drawordFiles`).doc(name)
    const doc = await ref.get()
    const file = doc.data() as File

    editor.clear()
    editor.loadFromJSON(JSON.parse(file.data))

    const input = document.querySelector('input[name=filename]') as HTMLInputElement
    input.value = doc.id
  }

  function undo() {
    const { editor }: any = global
    const item = editor.item(editor.size() - 1)
    editor.remove(item)
  }

  return (
    <div className="text-center">
      <header
        className="position-fixed px-2 text-white d-flex justify-content-between align-items-center"
        style={{ width: '100%', height: 44, top: 0, zIndex: 1, backgroundColor: '#333' }}
      >
        <span className="d-flex">
          <select className="form-select form-select-sm me-2" onChange={loadFile}>
            <option value=""></option>
            {files.map((name: string) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <button className="btn btn-primary btn-sm" onClick={undo}>
            undo
          </button>
        </span>
        <input
          type="text"
          name="hiddenInput"
          ref={inputRef}
          className="form-control form-control-sm me-2"
          // TODO 空のときは caret を transparent にする
          style={{ width: 200, caretColor: 'lightgray' }}
          onKeyDown={(e) => {
            if (e.key === 'Tab') {
              e.preventDefault()
            }
          }}
          onBlur={() => {
            if (!focusOn) return

            setTimeout(() => {
              inputRef.current?.focus()
            })
          }}
        />
        <span className="d-flex">
          <input
            type="text"
            placeholder="file name"
            className="form-control form-control-sm me-2"
            name="filename"
            onClick={(e: React.MouseEvent<HTMLInputElement>) => {
              const { target }: any = e
              focusOn = false
              setTimeout(() => {
                target.focus()
              })
            }}
            onBlur={() => {
              focusOn = true
              inputRef.current?.focus()
            }}
          />
          <button type="button" className="btn btn-primary btn-sm" onClick={save}>
            save
          </button>
          {user.displayName ? (
            <span className="pt-1 ms-2">{user.displayName.substr(0, 1)}</span>
          ) : (
            <button type="button" className="btn btn-primary btn-sm ms-2" onClick={login}>
              login
            </button>
          )}
        </span>
      </header>
      <div>
        <canvas ref={ref} width={canvasWidth} height={canvasHeight}></canvas>
      </div>
    </div>
  )
}

export default App
