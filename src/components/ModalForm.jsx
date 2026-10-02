// Componente reutilizable para mostrar formularios y contenido dentro de una ventana modal

export default function ModalForm({ show, title, onClose, children }) {
  if (!show) return null;

  return (
    <div className="modal fade show" tabIndex="-1" role="dialog" aria-modal="true" onClick={onClose}>
      <div
        className="modal-dialog modal-lg modal-dialog-centered"
        role="document"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
          </div>
          <div className="modal-body">{children}</div>
        </div>
      </div>
      <div className="modal-backdrop fade show" onClick={onClose} />
    </div>
  );
}
