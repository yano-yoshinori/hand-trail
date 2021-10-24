import { Toast as BootstrapToast } from 'bootstrap'

export function Toast() {
  return (
    <div className="position-fixed bottom-0 end-0 p-3">
      <div className="toast">
        <div className="toast-body d-flex justify-content-between">
          <div className="toast-message" />
          <button type="button" className="btn-close" data-bs-dismiss="toast" />
        </div>
      </div>
    </div>
  )
}

let toast: BootstrapToast | undefined

export function initializeToast(el: Element) {
  toast = new BootstrapToast(el)
}

export function openToast(message: string) {
  const el = document.querySelector('.toast-message')

  if (!el) return

  el.textContent = message
  toast?.show()
}
