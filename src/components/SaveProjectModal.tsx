import React, { useState } from 'react';
import '../styles/Modal.css';

interface SaveProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (projectName: string) => void;
}

const SaveProjectModal: React.FC<SaveProjectModalProps> = ({ isOpen, onClose, onSave }) => {
    const [projectName, setProjectName] = useState('');

    const handleSave = () => {
        if (projectName.trim()) {
            onSave(projectName);
            setProjectName('');
            onClose();
        } else {
            alert("Por favor, ingresa un nombre válido para el proyecto.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✖</button>
                <h2>Guardar Proyecto</h2>
                <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Nombre del proyecto"
                    className="project-input"
                />
                <button onClick={handleSave} className="save-button">Guardar</button>
            </div>
        </div>
    );
};

export default SaveProjectModal;