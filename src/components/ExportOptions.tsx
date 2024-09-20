import React from 'react';
import { jsPDF } from 'jspdf';
// @ts-ignore
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { FileText, File, NotebookText } from 'lucide-react'; // Importar iconos de lucide-react
import '../styles/ExportOptions.css';

interface ExportOptionsProps {
    content: string;
}

const ExportOptions: React.FC<ExportOptionsProps> = ({ content }) => {
    const exportAsPDF = () => {
        const doc = new jsPDF();
        doc.text(content, 10, 10);
        doc.save('documento.pdf');
    };

    const exportAsTXT = () => {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, 'documento.txt');
    };

    const exportAsDOCX = () => {
        const doc = new Document({
            sections: [
                {
                    properties: {},
                    children: [
                        new Paragraph({
                            children: [new TextRun(content)],
                        }),
                    ],
                },
            ],
        });

        Packer.toBlob(doc).then((blob: Blob) => {
            saveAs(blob, 'documento.docx');
        });
    };

    return (
        <div className="export-options">
            <button onClick={exportAsPDF} className="export-button pdf-button">
                Exportar como PDF <FileText className="mr-2 icon-style" /> 
            </button>
            <button onClick={exportAsTXT} className="export-button txt-button">
                Exportar como TXT <File className="mr-2 icon-style" /> 
            </button>
            <button onClick={exportAsDOCX} className="export-button docx-button">
                Exportar como DOCX <NotebookText className="mr-2 icon-style" /> 
            </button>
        </div>
    );
};

export default ExportOptions;