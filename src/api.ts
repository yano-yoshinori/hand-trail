import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import { User, File } from './types'

export async function loadFile(e: React.ChangeEvent<HTMLSelectElement>, user: User) {
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

export async function save(user: User) {
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

  alert('保存しました')
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

export async function getFiles(user: User): Promise<string[]> {
  const db = firebase.firestore()
  const ref = await db.collection(`users/${user.uid}/drawordFiles`).orderBy('date', 'desc')
  const querySnapshot = await ref.get()
  const data = querySnapshot.docs.map((doc) => doc.id) as string[]
  return data
}