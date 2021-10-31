import React, { useState } from 'react'
import { DEFAULT_TEXT_SIZE, STORAGE_KEYS } from '../constants/misc'

const { localStorage } = window

interface Props {
  onClickClose: () => void
}

export const ConfigModal = ({ onClickClose }: Props) => {
  const usePerPixelTargetFind = localStorage.getItem(STORAGE_KEYS.perPixelTargetFind) ?? 'false'
  const [selectionMode, setSelectionMode] = useState<boolean>(usePerPixelTargetFind === 'true')

  const sFontSize = localStorage.getItem(STORAGE_KEYS.fontSize)
  const defaultFontSize = sFontSize ? Number(sFontSize) : DEFAULT_TEXT_SIZE
  const [fontSize, setFontSize] = useState(defaultFontSize)

  const sCanvasHeight = localStorage.getItem(STORAGE_KEYS.canvasHeight)
  const defaultCanvasHeight = sCanvasHeight ? Number(sCanvasHeight) : window.innerHeight
  const [canvasHeight, setCanvasHeight] = useState(defaultCanvasHeight)

  return (
    <div id="config-modal" className="modal fade" tabIndex={-1}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              onClick={onClickClose}
            />
          </div>
          <div className="modal-body mb-3">
            {/* perPixelTargetFind */}
            <div className="form-check form-switch text-start mb-2">
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
            {/* font size */}
            <div className="row mb-2">
              <label htmlFor="fontSize" className="col-sm-4">
                Font size
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
            {/* 高さ */}
            <div className="row mb-2">
              <label htmlFor="fontSize" className="col-sm-4">
                Canvas height
              </label>
              <div className="col-sm-8">
                <input
                  type="number"
                  id="canvasHeight"
                  value={canvasHeight}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const sCanvasHeight = e.target.value
                    setCanvasHeight(Number(sCanvasHeight))
                    localStorage.setItem(STORAGE_KEYS.canvasHeight, sCanvasHeight)
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
