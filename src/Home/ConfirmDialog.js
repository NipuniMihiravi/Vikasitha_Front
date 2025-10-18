// ConfirmDialog.js
import React from "react";
import "./ConfirmDialog.css";

const ConfirmDialog = ({
  title = "Confirmation",
  message,
  onConfirm,
  onCancel,
  confirmText = "Yes",
  cancelText = "No",
  singleButton = false
}) => {
  return (
    <div className="dialog-overlay">
      <div className="dialog-box">
        <h3>{title}</h3>
        <p>{message}</p>

        <div className="dialog-buttons">
          {singleButton ? (
            <button className="btn-confirm" onClick={onConfirm}>
              OK
            </button>
          ) : (
            <>
              <button className="btn-confirm" onClick={onConfirm}>
                {confirmText}
              </button>
              <button className="btn-cancel" onClick={onCancel}>
                {cancelText}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
