import { useCallback, useState } from 'react';
import { UploadCloud, X, File as FileIcon } from 'lucide-react';

export function DocumentUpload({ 
  onFilesChange, 
  hint 
}: { 
  onFilesChange: (files: File[]) => void,
  hint: string 
}) {
  const [files, setFiles] = useState<File[]>([]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(isValidFile);
    const newFiles = [...files, ...droppedFiles];
    setFiles(newFiles);
    onFilesChange(newFiles);
  }, [files, onFilesChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(isValidFile);
      const newFiles = [...files, ...selectedFiles];
      setFiles(newFiles);
      onFilesChange(newFiles);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesChange(newFiles);
  };

  const isValidFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024;
  };

  return (
    <div className="w-full space-y-4">
      <div 
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <UploadCloud className="h-10 w-10 text-gray-400 mb-4" />
        <p className="text-sm font-medium text-gray-900 mb-1">Click to upload or drag and drop</p>
        <p className="text-xs text-gray-500 text-center max-w-xs">{hint}</p>
        <p className="text-xs text-gray-400 mt-2">JPG, PNG, WEBP, PDF up to 10MB</p>
        <input 
          id="file-upload" 
          type="file" 
          className="hidden" 
          multiple 
          accept=".jpg,.jpeg,.png,.webp,.pdf"
          onChange={handleChange}
        />
      </div>

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, i) => (
            <li key={i} className="flex items-center justify-between p-3 bg-white border rounded-md shadow-sm">
              <div className="flex items-center space-x-3 overflow-hidden">
                <FileIcon className="h-5 w-5 text-navy-500 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-900 truncate">{file.name}</span>
                <span className="text-xs text-gray-500 flex-shrink-0">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
              </div>
              <button 
                type="button" 
                onClick={() => removeFile(i)}
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
