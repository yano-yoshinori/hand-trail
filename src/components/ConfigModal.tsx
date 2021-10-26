import React, { useState } from 'react'
import { DEFAULT_TEXT_SIZE, STORAGE_KEYS } from '../constants/misc'

const { localStorage } = window

export const ConfigModal = () => {
  const usePerPixelTargetFind = localStorage.getItem(STORAGE_KEYS.perPixelTargetFind) ?? 'false'
  const [selectionMode, setSelectionMode] = useState<boolean>(usePerPixelTargetFind === 'true')

  const sFontSize = localStorage.getItem(STORAGE_KEYS.fontSize)
  const defaultFontSize = sFontSize ? Number(sFontSize) : DEFAULT_TEXT_SIZE
  const [fontSize, setFontSize] = useState(defaultFontSize)

  return (
    <div id="config-modal" className="modal fade" tabIndex={-1}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <button type="button" className="btn-close" data-bs-dismiss="modal" />
          </div>
          <div className="modal-body mb-3">
            <div className="form-check form-switch text-start mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="perPixelTargetFind"
                checked={selectionMode}
                onChange={() => {
                  setSelectionMode(!selectionMode)
                  localStorage.setItem(STORAGE_KEYS.perPixelTargetFind, 'true')
                }}
              />
              <label className="form-check-label" htmlFor="perPixelTargetFind">
                線の上にカーソルがあるときだけ選択できるモード
              </label>
            </div>
            <div className="row">
              <label htmlFor="fontSize" className="col-sm-4">
                フォントサイズ
              </label>
              <div className="col-sm-8">
                <input
                  type="number"
                  id="fontSize"
                  value={fontSize}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const sFontSize = e.target.value
                    setFontSize(Number(sFontSize))
                    localStorage.setItem(STORAGE_KEYS.fontSize, sFontSize)
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
