import { loadFile } from '../api'
import { User } from '../types'

interface Props {
  open: boolean
  files: string[]
  user: User
  onClickClose: () => void
}

const FileModal = ({ open, files, user, onClickClose }: Props) => {
  return (
    <div className="modal" tabIndex={-1} style={{ display: open ? 'block' : 'none' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              onClick={onClickClose}
            ></button>
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
            <div>
              <input
                type="text"
                placeholder="file name"
                className="form-control form-control-sm me-2"
                name="filename"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FileModal
