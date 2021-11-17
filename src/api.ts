import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import { writeFilename } from './models/FileName'
import { User, File, FileSummary } from './types'

export async function loadFile(name: string, uid: string) {
  const db = firebase.firestore()
  const ref = await db.collection(`users/${uid}/drawordFiles`).doc(name)
  const doc = await ref.get()
  const file = doc.data() as File

  const { editor }: any = global
  editor.clear()
  editor.loadFromJSON(JSON.parse(file.data))

  writeFilename(doc.id)
}

export async function save(user: User) {
  const input = document.querySelector('#file-modal input[name=filename]') as HTMLInputElement
  const name = input.value

  const filenameEl = document.querySelector('header .filename') as HTMLInputElement
  filenameEl.textContent = name
  filenameEl.title = name

  if (!name) {
    alert('ファイル名が入力されていません')
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
}

export function login(updateUser: (user: User) => void) {
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

export async function getFiles(user: User): Promise<FileSummary[]> {
  const db = firebase.firestore()
  const ref = await db.collection(`users/${user.uid}/drawordFiles`).orderBy('date', 'desc')
  const querySnapshot = await ref.get()
  const data = querySnapshot.docs.map((doc) => {
    const docData = doc.data()
    return {
      name: doc.id,
      timestamp: docData.date.seconds * 1000,
    }
  }) as FileSummary[]
  return data
}
