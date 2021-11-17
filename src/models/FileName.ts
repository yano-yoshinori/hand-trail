export function writeFilename(name: string) {
  const input = document.querySelector('#file-modal input[name=filename]') as HTMLInputElement
  input.value = name

  const filenameEl = document.querySelector('header .filename') as HTMLInputElement
  filenameEl.textContent = name
  filenameEl.title = name
}

export function readFilename(): string {
  const filenameEl = document.querySelector('header .filename') as HTMLInputElement
  return filenameEl.textContent ?? ''
}
