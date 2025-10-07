import { useState, useEffect, useCallback } from 'react';
import { addDocument, getAllDocuments, deleteDocument, getDocument } from '../lib/db';
import { type Document } from '../types';

declare const pdfjsLib: any;
declare const mammoth: any;

export interface DocumentWithContent extends Document {
    content: string;
}


async function parseFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        if (file.type === 'text/plain') {
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = reject;
            reader.readAsText(file);
        } else if (file.type === 'application/pdf') {
            reader.onload = async (e) => {
                try {
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    const pdf = await pdfjsLib.getDocument({ data }).promise;
                    let text = '';
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const content = await page.getTextContent();
                        text += content.items.map((item: any) => item.str).join(' ');
                    }
                    resolve(text);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') { // .docx
             reader.onload = async (e) => {
                try {
                    const result = await mammoth.extractRawText({ arrayBuffer: e.target?.result });
                    resolve(result.value);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        } else {
            reject(new Error('File không được hỗ trợ. Vui lòng tải lên .txt, .pdf, hoặc .docx'));
        }
    });
}


export const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const docs = await getAllDocuments();
      setDocuments(docs.map(({ id, name, type }) => ({ id, name, type })));
    } catch (e) {
      console.error(e);
      setError('Không thể tải tài liệu.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshDocuments();
  }, [refreshDocuments]);

  const handleAddDocument = async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const content = await parseFile(file);
      await addDocument(file.name, file.type, content);
      await refreshDocuments();
    } catch (e: any) {
      console.error('Không thể thêm tài liệu:', e);
      setError(e.message || 'Không thể phân tích hoặc lưu tài liệu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDocument = async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await deleteDocument(id);
      await refreshDocuments();
    } catch (e) {
      console.error('Không thể xóa tài liệu:', e);
      setError('Không thể xóa tài liệu.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const getDocumentContent = async (id: number): Promise<DocumentWithContent | null> => {
      try {
          const doc = await getDocument(id);
          return doc || null;
      } catch (e) {
          console.error('Không thể lấy nội dung tài liệu:', e);
          setError('Không thể lấy nội dung tài liệu.');
          return null;
      }
  }

  return { documents, handleAddDocument, handleDeleteDocument, getDocumentContent, isLoading, error, refreshDocuments };
};