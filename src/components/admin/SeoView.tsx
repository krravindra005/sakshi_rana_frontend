import React, { useState, useEffect } from 'react';
import { adminSeoService, SeoPageConfig } from '../../services/admin.service';
import { 
  Globe, 
  Search, 
  AlertTriangle, 
  Check, 
  X, 
  Eye, 
  Edit, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight,
  RefreshCw
} from 'lucide-react';

export const SeoView: React.FC = () => {
  const [pages, setPages] = useState<SeoPageConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Editor State
  const [selectedPage, setSelectedPage] = useState<SeoPageConfig | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editH1, setEditH1] = useState('');
  const [editIntro, setEditIntro] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editCanonical, setEditCanonical] = useState('');
  const [editIndex, setEditIndex] = useState<'index' | 'noindex'>('index');

  const fetchPages = async () => {
    try {
      setLoading(true);
      const all = await adminSeoService.getSeoConfigs();
      setPages(all);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleEditClick = (page: SeoPageConfig) => {
    setSelectedPage(page);
    setEditTitle(page.seoTitle);
    setEditDesc(page.metaDescription);
    setEditH1(page.h1);
    setEditIntro(page.introContent);
    setEditBody(page.bodyContent);
    setEditCanonical(page.canonicalUrl);
    setEditIndex(page.indexStatus);
  };

  const handleSaveSeo = async () => {
    if (!selectedPage) return;
    try {
      const updated: SeoPageConfig = {
        ...selectedPage,
        seoTitle: editTitle,
        metaDescription: editDesc,
        h1: editH1,
        introContent: editIntro,
        bodyContent: editBody,
        canonicalUrl: editCanonical,
        indexStatus: editIndex,
      };
      await adminSeoService.saveSeoConfig(updated);
      setSelectedPage(null);
      await fetchPages();
    } catch (err) {
      alert('Error saving SEO tags');
    }
  };

  // Diagnostic warning generators
  const getSeoDiagnostics = (title: string, desc: string, body: string) => {
    const warnings: string[] = [];
    if (!title) warnings.push('Missing display Title tags');
    else if (title.length > 60) warnings.push(`Title tag exceeds recommended length limit (${title.length}/60 chars)`);
    
    if (!desc) warnings.push('Missing Meta Description tags');
    else if (desc.length > 160) warnings.push(`Meta Description exceeds recommended limits (${desc.length}/160 chars)`);
    
    if (body.length < 100) warnings.push('Thin content warning: Page description is less than 100 characters');

    return warnings;
  };

  // Filters
  const filteredPages = pages.filter(p => {
    return p.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
           p.seoTitle.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#18181B]">SEO Landing Pages Manager</h2>
          <p className="text-xs text-[#667085] mt-0.5 font-mono">Customize category-city metadata, header content, and robot crawl policies</p>
        </div>
        <button 
          onClick={fetchPages}
          className="p-2 border border-[#E4E7EC] bg-white rounded-xl text-[#667085] hover:text-[#18181B] self-end"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* CORE SEO CONTROLS SPLIT SCREEN */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* LEFT: SEO PAGE LIST (2/5 width) */}
        <div className="lg:col-span-2 bg-white border border-[#E4E7EC] rounded-2xl p-5 shadow-xs flex flex-col gap-4 h-[650px] overflow-hidden">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search landing page URLs..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-rose-400 font-mono"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
            {loading ? (
              <p className="text-xs text-slate-400 font-mono text-center p-6">Reading indexing records...</p>
            ) : filteredPages.length === 0 ? (
              <p className="text-xs text-slate-400 font-mono text-center p-6">No matching landing pages found.</p>
            ) : (
              filteredPages.map(page => {
                const diagnostics = getSeoDiagnostics(page.seoTitle, page.metaDescription, page.bodyContent);
                const isSelected = selectedPage?.id === page.id;

                return (
                  <button
                    key={page.id}
                    onClick={() => handleEditClick(page)}
                    className={`w-full text-left p-4 border rounded-xl transition-all relative flex flex-col gap-1.5 ${
                      isSelected 
                        ? 'bg-rose-50 border-rose-200 text-rose-800' 
                        : 'border-[#E4E7EC] bg-white hover:bg-[#F8F9FC] text-[#667085]'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px] font-mono font-bold">
                      <span className="text-rose-700">{page.url}</span>
                      <span className={`px-1.5 rounded uppercase ${page.indexStatus === 'index' ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'}`}>
                        {page.indexStatus}
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-[#18181B] truncate pr-4">{page.seoTitle}</h5>
                    
                    {diagnostics.length > 0 && (
                      <div className="flex items-center gap-1 mt-1 text-[9px] font-mono text-amber-600 font-bold">
                        <AlertTriangle size={11} />
                        <span>{diagnostics.length} crawler warnings active</span>
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT: METADATA EDITOR & SERP PREVIEW (3/5 width) */}
        <div className="lg:col-span-3 bg-white border border-[#E4E7EC] rounded-2xl p-6 shadow-xs h-[650px] overflow-y-auto scrollbar-thin">
          {selectedPage ? (
            <div className="space-y-5">
              
              <div className="flex justify-between items-center border-b pb-3">
                <h4 className="font-bold text-sm text-[#18181B] font-mono uppercase">Velo-SEO Tag Editor</h4>
                <button onClick={() => setSelectedPage(null)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
              </div>

              {/* Crawl index settings */}
              <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                <div>
                  <label className="block text-[#667085] mb-1">Index status:</label>
                  <select 
                    value={editIndex}
                    onChange={(e: any) => setEditIndex(e.target.value)}
                    className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="index">Index, Follow (Allow Crawling)</option>
                    <option value="noindex">Noindex, Follow (Block Crawling)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#667085] mb-1">Canonical URL Tag:</label>
                  <input 
                    type="text" 
                    value={editCanonical}
                    onChange={(e) => setEditCanonical(e.target.value)}
                    className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Title & Desc Inputs */}
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <label className="text-[#667085]">SEO Page Title Tag:</label>
                    <span className={editTitle.length > 60 ? 'text-rose-600 font-bold' : 'text-green-600'}>
                      {editTitle.length} / 60 Chars
                    </span>
                  </div>
                  <input 
                    type="text" 
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <label className="text-[#667085]">Meta Description Tag:</label>
                    <span className={editDesc.length > 160 ? 'text-rose-600 font-bold' : 'text-green-600'}>
                      {editDesc.length} / 160 Chars
                    </span>
                  </div>
                  <textarea 
                    rows={3}
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl p-3 text-xs focus:outline-none focus:border-rose-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#667085] mb-1">H1 Tag Heading:</label>
                    <input 
                      type="text" 
                      value={editH1}
                      onChange={(e) => setEditH1(e.target.value)}
                      className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl px-3 py-2 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[#667085] mb-1">Intro Content:</label>
                    <input 
                      type="text" 
                      value={editIntro}
                      onChange={(e) => setEditIntro(e.target.value)}
                      className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl px-3 py-2 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#667085] mb-1">Body Text Content:</label>
                  <textarea 
                    rows={4}
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl p-3 focus:outline-none"
                  />
                </div>
              </div>

              {/* SERP GOOGLE LIVE PREVIEW */}
              <div className="space-y-2 border-t pt-4">
                <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider font-mono block">SERP Desktop Simulator Preview</span>
                <div className="p-4 bg-white border rounded-xl border-[#E4E7EC] space-y-1 text-left shadow-xs font-sans max-w-lg">
                  <span className="text-xs text-[#202124] block truncate">https://discreet-marketplace.example.com{selectedPage.url}</span>
                  <h4 className="text-lg text-[#1a0dab] hover:underline font-medium leading-tight line-clamp-1 cursor-pointer">
                    {editTitle || 'Placeholder Title Page'}
                  </h4>
                  <p className="text-xs text-[#4d5156] leading-relaxed line-clamp-2">
                    {editDesc || 'Meta description values appear here for crawling preview...'}
                  </p>
                </div>
              </div>

              {/* Diagnostic warnings card */}
              {getSeoDiagnostics(editTitle, editDesc, editBody).length > 0 && (
                <div className="p-4 border border-amber-200 bg-amber-50/50 rounded-xl space-y-1.5 font-mono text-xs text-amber-950">
                  <span className="font-bold uppercase tracking-wider block text-[10px] text-amber-800">Crawler indexing warnings found:</span>
                  {getSeoDiagnostics(editTitle, editDesc, editBody).map((w, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <AlertTriangle size={11} className="text-amber-600 flex-shrink-0" />
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Save triggers */}
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button 
                  onClick={() => setSelectedPage(null)}
                  className="px-4 py-2 border border-[#E4E7EC] rounded-xl text-xs font-bold text-[#667085] font-mono"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveSeo}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold font-mono shadow-sm"
                >
                  Save SEO Parameters
                </button>
              </div>

            </div>
          ) : (
            <div className="h-full flex flex-col justify-center items-center text-center p-8 space-y-3 font-mono text-xs text-slate-400">
              <Globe size={32} className="text-[#667085] animate-bounce" />
              <span>Select any landing page from the registry list to load metadata tags editor.</span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
