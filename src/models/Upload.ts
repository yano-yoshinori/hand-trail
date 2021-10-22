import firebase from 'firebase/app'
import 'firebase/storage'

export async function upload(uid: string, name: string, blob: Blob) {
  const storageRef = firebase.storage().ref()
  const ref = storageRef.child(`${uid}/${name}.png`)

  await ref.put(blob)
  const url = await ref.getDownloadURL()

  return url
}
