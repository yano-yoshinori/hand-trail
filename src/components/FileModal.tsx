import { loadFile, save } from '../api'
import { User } from '../types'

interface Props {
  files: string[]
  user: User
  onClickClose: () => void
}

export const FileModal = ({ files, user, onClickClose }: Props) => {
  return (
    <div id="file-modal" className="modal fade" tabIndex={-1}>
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
            {/* Open */}
            <h5 className="text-start">Open</h5>
            <div className="mb-4">
              <select className="form-select form-select-sm" onChange={(e) => loadFile(e, user)}>
                <option value=""></option>
                {files.map((name: string) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            {/* File Name */}
            <h5 className="text-start">File Name</h5>
            <div className="d-flex">
              <input
                type="text"
                placeholder="file name"
                className="form-control form-control-sm me-2"
                name="filename"
              />
              <button
                className="btn btn-primary btn-sm"
                title="save"
                onClick={() => {
                  save(user)
                  onClickClose()
                }}
              >
                <i className="fa fa-save" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
