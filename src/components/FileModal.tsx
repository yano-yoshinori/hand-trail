import { FileSummary, User } from '../types'
import { formatDate } from '../util'

interface Props {
  files: FileSummary[]
  user: User
  onClickClose: () => void
  onClickSave: () => void
  onClickOpen: (name: string) => void
}

export const FileModal = ({ files, user, onClickClose, onClickSave, onClickOpen }: Props) => {
  return (
    <div id="file-modal" tabIndex={-1} className="modal fade">
      <div className="modal-dialog me-3">
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
            {/* File Name */}
            <h5 className="text-start">File Name</h5>
            <div className="d-flex mb-3">
              <input
                type="text"
                placeholder="file name"
                className="form-control form-control-sm me-2"
                name="filename"
              />
              <button
                className="btn btn-primary btn-sm"
                title="save"
                data-bs-dismiss="modal"
                onClick={onClickSave}
              >
                <i className="fa fa-save" />
              </button>
            </div>
            {/* Open */}
            <h5 className="text-start">Open</h5>
            <div
              className="list-group text-start"
              style={{ height: window.innerHeight - 266, overflowY: 'scroll' }}
            >
              {files.map(({ name, timestamp }) => (
                <button
                  key={name}
                  type="button"
                  className="list-group-item list-group-item-action"
                  onClick={() => onClickOpen(name)}
                >
                  <div className="d-flex justify-content-between">
                    <span>{name}</span>
                    <span className="text-black-50">{formatDate(timestamp)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
