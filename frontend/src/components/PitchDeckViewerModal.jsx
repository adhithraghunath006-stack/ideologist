import React from 'react';
import Modal from './Modal';
import { FileText, Download, ExternalLink, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

export default function PitchDeckViewerModal({ isOpen, onClose, document: doc, ideaTitle }) {
  if (!doc) return null;

  const downloadUrl = api.getDocumentDownloadUrl(doc.id);
  const isPdf = doc.file_type === 'pdf' || (doc.original_name && doc.original_name.toLowerCase().endsWith('.pdf'));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Pitch Deck: ${doc.original_name || 'Document'}`}
      maxWidth={isPdf ? 'max-w-4xl' : 'max-w-xl'}
    >
      <div className="space-y-4">
        {/* Document Header Info */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-emerald" />
            <div>
              <span className="font-semibold text-white block">{ideaTitle}</span>
              <span className="text-slate-400 text-[11px]">
                {(doc.file_size / 1024).toFixed(1)} KB • Type: {doc.file_type ? doc.file_type.toUpperCase() : 'PDF'}
              </span>
            </div>
          </div>

          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="px-3 py-1.5 rounded-lg bg-brand-emerald text-navy-950 font-semibold text-xs flex items-center gap-1.5 hover:bg-emerald-400 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download Original
          </a>
        </div>

        {/* Viewer Area */}
        {isPdf ? (
          <div className="w-full h-[550px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 relative">
            <iframe
              src={downloadUrl}
              title={doc.original_name}
              className="w-full h-full border-0"
            />
          </div>
        ) : (
          <div className="p-8 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-blue/10 border border-brand-blue/20 mx-auto flex items-center justify-center">
              <FileText className="w-8 h-8 text-brand-blue" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{doc.original_name}</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                This presentation file ({doc.file_type ? doc.file_type.toUpperCase() : 'Office Doc'}) is ready for download and local review.
              </p>
            </div>
            <a
              href={downloadUrl}
              download
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-blue text-white font-semibold text-xs hover:bg-blue-600 transition-colors shadow-lg shadow-brand-blue/20"
            >
              <Download className="w-4 h-4" />
              Download {doc.original_name}
            </a>
          </div>
        )}

        <p className="text-[11px] text-slate-400 text-center">
          Ideologist Secure Document Vault • Streamed directly via backend verification
        </p>
      </div>
    </Modal>
  );
}
