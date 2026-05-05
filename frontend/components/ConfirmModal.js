import { X, AlertCircle } from 'lucide-react';

export default function ConfirmModal({ 
  open, 
  title, 
  message, 
  onConfirm, 
  onClose, 
  confirmText = 'Confirmer', 
  cancelText = 'Annuler', 
  variant = 'danger' 
}) {
  if (!open) return null;

  const btnClass = variant === 'danger' ? 'btn-danger' : 'btn-primary';

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()} style={{ zIndex: 9999 }}>
      <div className="modal" style={{ maxWidth: 400, transform: 'scale(1)', opacity: 1, animation: 'slideUp 0.2s ease-out' }}>
        <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {variant === 'danger' && <AlertCircle size={22} color="#EF4444" />}
            <span className="modal-title" style={{ fontSize: 17 }}>{title}</span>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body" style={{ paddingTop: 12, paddingBottom: 24 }}>
          <p style={{ margin: 0, fontSize: 14.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {message}
          </p>
        </div>
        <div className="modal-footer" style={{ borderTop: 'none', paddingTop: 0, gap: 12 }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>{cancelText}</button>
          <button type="button" className={`btn ${btnClass}`} onClick={() => { onConfirm(); onClose(); }} style={{ flex: 1 }}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
