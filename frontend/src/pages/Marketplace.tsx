import React, { useEffect, useState } from 'react';
import { ShoppingBag, Download, Loader2 } from 'lucide-react';
import { api } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

export default function Marketplace() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/marketplace/templates')
      .then(res => setTemplates(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleInstall = async (templateId: string, name: string) => {
    const appName = prompt('Enter a name for your application:', name);
    if (!appName) return;
    
    try {
      await api.post('/marketplace/deploy', {
        templateId,
        name: appName
      });
      navigate('/applications');
    } catch (e) {
      console.error(e);
      alert('Failed to install application');
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Marketplace</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-lg">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">{template.name}</h2>
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                    {template.category}
                  </span>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 flex-1">
                {template.description}
              </p>
              <button 
                onClick={() => handleInstall(template.id, template.name)}
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Install
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
