import { useState } from 'react'
import { STORAGE_KEYS } from '../constants/misc'

const { localStorage } = window

export const ConfigModal = () => {
  const usePerPixelTargetFind = localStorage.getItem(STORAGE_KEYS.perPixelTargetFind) ?? 'false'
  const [selectionMode, setSelectionMode] = useState<boolean>(usePerPixelTargetFind === 'true')

  return (
    <div id="config-modal" className="modal fade" tabIndex={-1}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <button type="button" className="btn-close" data-bs-dismiss="modal" />
          </div>
          <div className="modal-body mb-3">
            <div className="form-check form-switch text-start">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="flexSwitchCheckDefault"
                checked={selectionMode}
                onChange={() => {
                  setSelectionMode(!selectionMode)
                  localStorage.setItem(STORAGE_KEYS.perPixelTargetFind, 'true')
                }}
              />
              <label className="form-check-label" htmlFor="flexSwitchCheckDefault">
                線の上にカーソルがあるときだけ選択できるモード
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
