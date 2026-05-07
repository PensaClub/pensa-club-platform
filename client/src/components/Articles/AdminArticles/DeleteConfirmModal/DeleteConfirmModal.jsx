import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './deleteConfirmModal.css';

/**
 * Generic confirm modal. Phase 2 — only used by AdminArticles for delete,
 * but we keep it dependency-free so it can be lifted to a shared location
 * later if needed.
 *
 * Props:
 *   open       — boolean
 *   title      — modal heading
 *   message    — modal body (string OR ReactNode)
 *   cancelLabel, confirmLabel
 *   onCancel, onConfirm
 *   loading    — disables the confirm button while in-flight
 *   variant    — 'danger' (default) | 'primary'
 *
 * Keybinding:
 *   Esc   → onCancel
 *   Enter → onConfirm  (only when modal is open and not loading)
 */
const DeleteConfirmModal = ({
  open,
  title,
  message,
  cancelLabel = 'Cancel',
  confirmLabel = 'Confirm',
  onCancel,
  onConfirm,
  loading = false,
  variant = 'danger',
}) => {
  const confirmBtnRef = useRef(null);

  // Focus the confirm button when modal opens (matches the rest of the
  // app's modals).
  useEffect(() => {
    if (open && confirmBtnRef.current) {
      // Defer to next frame so the appearance transition has a chance to start.
      const id = window.requestAnimationFrame(() => {
        confirmBtnRef.current?.focus();
      });
      return () => window.cancelAnimationFrame(id);
    }
  }, [open]);

  // Keyboard handlers — Esc cancels, Enter confirms.
  useEffect(() => {
    if (!open) return undefined;
    const handler = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel?.();
      } else if (e.key === 'Enter') {
        // Don't fire if user is typing in a textarea/input — but in this modal
        // there are no inputs, so we can fire directly. Still, guard against
        // double-trigger while loading.
        if (loading) return;
        e.preventDefault();
        onConfirm?.();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, loading, onCancel, onConfirm]);

  if (!open) return null;

  // Render via Portal so the fixed-positioned overlay anchors to the
  // viewport, escaping any ancestor `contain`/`transform` containment.
  return createPortal((
    <div
      className="dcm-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dcm-title"
      onClick={(e) => {
        // Click outside the modal body cancels.
        if (e.target === e.currentTarget) onCancel?.();
      }}
    >
      <div className="dcm-card" onClick={(e) => e.stopPropagation()}>
        <h3 id="dcm-title" className="dcm-title">{title}</h3>
        <div className="dcm-message">{message}</div>
        <div className="dcm-actions">
          <button
            type="button"
            className="dcm-btn dcm-btn-cancel"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            className={`dcm-btn dcm-btn-confirm dcm-btn-${variant}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? '...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  ), document.body);
};

export default DeleteConfirmModal;
