import React, { useEffect, useState, useRef } from 'react';
import { api } from '../store/authStore';
import { Folder, File, Upload, Plus, Trash2, Download, HardDrive } from 'lucide-react';

export default function Storage() {
  const [buckets, setBuckets] = useState<any[]>([]);
  const [selectedBucket, setSelectedBucket] = useState<string | null>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [newBucketName, setNewBucketName] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBuckets();
  }, []);

  useEffect(() => {
    if (selectedBucket) {
      fetchFiles(selectedBucket);
    } else {
      setFiles([]);
    }
  }, [selectedBucket]);

  const fetchBuckets = async () => {
    try {
      const res = await api.get('/storage/buckets');
      setBuckets(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchFiles = async (bucketId: string) => {
    try {
      const res = await api.get(`/storage/buckets/${bucketId}/files`);
      setFiles(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateBucket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBucketName.trim()) return;
    try {
      await api.post('/storage/buckets', { name: newBucketName });
      setNewBucketName('');
      fetchBuckets();
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !selectedBucket) return;
    
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    
    setUploading(true);
    try {
      await api.post(`/storage/buckets/${selectedBucket}/files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchFiles(selectedBucket);
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    try {
      await api.delete(`/storage/files/${fileId}`);
      if (selectedBucket) fetchFiles(selectedBucket);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownload = (fileId: string) => {
    const token = localStorage.getItem('token');
    const url = `${import.meta.env.VITE_API_URL || '/api'}/storage/files/${fileId}/download`;
    
    // Create an anchor tag to trigger download with token in headers if possible, 
    // but standard anchor doesn't support headers.
    // For a real app, use fetch to get a blob and create object URL.
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = '';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      });
  };

  const formatBytes = (bytes: string) => {
    const b = parseInt(bytes);
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (b === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(b) / Math.log(1024)).toString());
    return Math.round((b / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Storage</h1>
          <p className="text-slate-500">Manage buckets and files</p>
        </div>
      </div>

      <div className="flex flex-1 gap-6 min-h-0">
        {/* Buckets Sidebar */}
        <div className="w-64 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex flex-col">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Buckets</h2>
          
          <form onSubmit={handleCreateBucket} className="mb-4 flex gap-2">
            <input 
              type="text" 
              value={newBucketName}
              onChange={e => setNewBucketName(e.target.value)}
              placeholder="New bucket..."
              className="flex-1 px-3 py-1.5 text-sm rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700">
              <Plus className="w-4 h-4" />
            </button>
          </form>

          <div className="flex-1 overflow-y-auto space-y-1">
            {buckets.map(b => (
              <button
                key={b.id}
                onClick={() => setSelectedBucket(b.id)}
                className={`w-full flex items-center gap-2 p-2 rounded text-left transition ${
                  selectedBucket === b.id 
                    ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Folder className="w-4 h-4" />
                <span className="truncate">{b.name}</span>
              </button>
            ))}
            {buckets.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">No buckets found</p>
            )}
          </div>
        </div>

        {/* Files Area */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
          {selectedBucket ? (
            <>
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center gap-2 font-medium">
                  <Folder className="w-5 h-5 text-blue-500" />
                  <span>{buckets.find(b => b.id === selectedBucket)?.name}</span>
                </div>
                
                <div>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden" 
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    {uploading ? 'Uploading...' : 'Upload File'}
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                {files.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {files.map(f => (
                      <div key={f.id} className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition group relative bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex items-start justify-between mb-3">
                          <File className="w-8 h-8 text-slate-400" />
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                            <button onClick={() => handleDownload(f.id)} className="p-1.5 text-slate-500 hover:text-blue-500 rounded bg-white dark:bg-slate-900 shadow-sm">
                              <Download className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteFile(f.id)} className="p-1.5 text-slate-500 hover:text-red-500 rounded bg-white dark:bg-slate-900 shadow-sm">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <h3 className="font-medium text-sm text-slate-900 dark:text-white truncate mb-1" title={f.name}>{f.name}</h3>
                        <p className="text-xs text-slate-500">{formatBytes(f.size)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <HardDrive className="w-12 h-12 mb-4 opacity-20" />
                    <p>This bucket is empty</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <Folder className="w-16 h-16 mb-4 opacity-20" />
              <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">No Bucket Selected</h3>
              <p>Select a bucket from the sidebar or create a new one to manage files.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
