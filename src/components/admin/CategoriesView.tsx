import React, { useState, useEffect } from 'react';
import { adminBusinessService } from '../../services/admin.service';
import { Category } from '../../types/api';
import { 
  FolderTree, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Sparkles, 
  Flower, 
  User, 
  Heart, 
  Users, 
  Tag, 
  Layers, 
  Star, 
  Globe, 
  ShieldCheck, 
  Image as ImageIcon, 
  Check, 
  X, 
  AlertCircle,
  ChevronRight,
  Sliders,
  Filter
} from 'lucide-react';

interface CategoriesViewProps {
  activeRole: string;
}

// Icon mapper helper component
const CategoryIcon: React.FC<{ name?: string; className?: string; size?: number }> = ({ name, className = '', size = 16 }) => {
  switch (name) {
    case 'Sparkles': return <Sparkles size={size} className={className} />;
    case 'Flower': return <Flower size={size} className={className} />;
    case 'User': return <User size={size} className={className} />;
    case 'Heart': return <Heart size={size} className={className} />;
    case 'Users': return <Users size={size} className={className} />;
    case 'Tag': return <Tag size={size} className={className} />;
    case 'Layers': return <Layers size={size} className={className} />;
    case 'Star': return <Star size={size} className={className} />;
    case 'Globe': return <Globe size={size} className={className} />;
    case 'ShieldCheck': return <ShieldCheck size={size} className={className} />;
    default: return <FolderTree size={size} className={className} />;
  }
};

const AVAILABLE_ICONS = [
  { label: 'Sparkles', value: 'Sparkles' },
  { label: 'Flower', value: 'Flower' },
  { label: 'User', value: 'User' },
  { label: 'Heart', value: 'Heart' },
  { label: 'Users', value: 'Users' },
  { label: 'Tag', value: 'Tag' },
  { label: 'Layers', value: 'Layers' },
  { label: 'Star', value: 'Star' },
  { label: 'Globe', value: 'Globe' },
  { label: 'ShieldCheck', value: 'ShieldCheck' },
];

export const CategoriesView: React.FC<CategoriesViewProps> = ({ activeRole }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [taxonomyFilter, setTaxonomyFilter] = useState<'all' | 'main' | 'sub'>('all');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: 'FolderTree',
    cover_image: '',
    parent_id: '' as string | number,
    sort_order: 1,
    is_active: true,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [autoSlug, setAutoSlug] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter Management Modal state
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [availableFilters, setAvailableFilters] = useState<any[]>([]);
  const [assignedFilterIds, setAssignedFilterIds] = useState<(string | number)[]>([]);
  const [loadingFilters, setLoadingFilters] = useState(false);

  // Filter creation forms
  const [showCreateFilterForm, setShowCreateFilterForm] = useState(false);
  const [newFilterData, setNewFilterData] = useState({ name: '', key: '', type: 'checkbox' });
  const [selectedFilterForOption, setSelectedFilterForOption] = useState<string | number | null>(null);
  const [newOptionData, setNewOptionData] = useState({ label: '', value: '' });

  // Toast alert feedback
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadCategoriesData = async () => {
    try {
      setLoading(true);
      const data = await adminBusinessService.getCategories();
      setCategories(data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
      showToast('Failed to sync categories data from service', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategoriesData();
  }, []);

  // Helper to generate slug from name
  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: autoSlug ? slugify(val) : prev.slug,
    }));
    if (formErrors.name) {
      setFormErrors((prev) => ({ ...prev, name: '' }));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAutoSlug(false);
    setFormData((prev) => ({ ...prev, slug: e.target.value }));
    if (formErrors.slug) {
      setFormErrors((prev) => ({ ...prev, slug: '' }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) {
      errors.name = 'Category name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!formData.slug.trim()) {
      errors.slug = 'Slug is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug.trim())) {
      errors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens';
    }

    if (formData.sort_order < 0) {
      errors.sort_order = 'Sort order must be a non-negative number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: 'FolderTree',
      cover_image: '',
      parent_id: '',
      sort_order: categories.length + 1,
      is_active: true,
    });
    setFormErrors({});
    setAutoSlug(true);
  };

  // Permission Guard Helper: Super Admin receives full unrestricted access for all actions.
  const isSuperAdmin = activeRole === 'Super Admin';
  const canView = isSuperAdmin || ['Admin', 'Moderator', 'Support', 'Finance'].includes(activeRole);
  const canCreate = isSuperAdmin || ['Admin'].includes(activeRole);
  const canEdit = isSuperAdmin || ['Admin'].includes(activeRole);
  const canToggleStatus = isSuperAdmin || ['Admin'].includes(activeRole);
  const canDelete = isSuperAdmin;

  const handleOpenCreateModal = () => {
    if (!canCreate) {
      showToast('Access Denied: Super Admin full access required to create categories.', 'error');
      return;
    }
    resetForm();
    setShowCreateModal(true);
  };

  const handleOpenEditModal = (cat: Category) => {
    if (!canEdit) {
      showToast('Access Denied: Super Admin or Admin privileges required to edit categories.', 'error');
      return;
    }
    setActiveCategory(cat);
    setFormData({
      name: cat.name || '',
      slug: cat.slug || '',
      description: cat.description || '',
      icon: cat.icon || 'FolderTree',
      cover_image: cat.cover_image || '',
      parent_id: cat.parent_id || '',
      sort_order: cat.sort_order ?? 1,
      is_active: cat.is_active ?? true,
    });
    setFormErrors({});
    setAutoSlug(false);
    setShowEditModal(true);
  };

  const handleOpenViewModal = (cat: Category) => {
    if (!canView) {
      showToast('Access Denied: View permissions required.', 'error');
      return;
    }
    setActiveCategory(cat);
    setShowViewModal(true);
  };

  const handleOpenDeleteModal = (cat: Category) => {
    if (!canDelete) {
      showToast('Access Denied: Only Super Admin can delete categories.', 'error');
      return;
    }
    setActiveCategory(cat);
    setShowDeleteModal(true);
  };

  // CREATE CATEGORY ACTION
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate) {
      showToast('Access Denied: Insufficient permissions.', 'error');
      return;
    }
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim(),
        icon: formData.icon,
        cover_image: formData.cover_image.trim(),
        parent_id: formData.parent_id ? Number(formData.parent_id) : null,
        sort_order: Number(formData.sort_order),
        is_active: formData.is_active,
      };

      await adminBusinessService.createCategory(payload);
      showToast(`Category "${formData.name}" successfully created!`, 'success');
      setShowCreateModal(false);
      await loadCategoriesData();
    } catch (err: any) {
      console.error('Create error:', err);
      showToast(err?.message || 'Failed to create category. Please check form inputs.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // UPDATE CATEGORY ACTION
  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) {
      showToast('Access Denied: Insufficient permissions to edit categories.', 'error');
      return;
    }
    if (!activeCategory || !validateForm()) return;

    try {
      setIsSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim(),
        icon: formData.icon,
        cover_image: formData.cover_image.trim(),
        parent_id: formData.parent_id ? Number(formData.parent_id) : null,
        sort_order: Number(formData.sort_order),
        is_active: formData.is_active,
      };

      await adminBusinessService.updateCategory(activeCategory.id, payload);
      showToast(`Category "${formData.name}" successfully updated!`, 'success');
      setShowEditModal(false);
      await loadCategoriesData();
    } catch (err: any) {
      console.error('Update error:', err);
      showToast(err?.message || 'Failed to update category.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // TOGGLE STATUS ACTION
  const handleToggleStatus = async (cat: Category) => {
    if (!canToggleStatus) {
      showToast('Access Denied: Insufficient permissions to change status.', 'error');
      return;
    }
    try {
      const nextStatus = !cat.is_active;
      await adminBusinessService.updateCategory(cat.id, { is_active: nextStatus });
      showToast(`Category "${cat.name}" status set to ${nextStatus ? 'ACTIVE' : 'INACTIVE'}`, 'success');
      await loadCategoriesData();
    } catch (err) {
      showToast('Failed to update category status', 'error');
    }
  };

  // DELETE CATEGORY ACTION
  const handleDeleteCategory = async () => {
    if (!canDelete) {
      showToast('Access Denied: Only Super Admin can delete categories.', 'error');
      return;
    }
    if (!activeCategory) return;

    try {
      setIsSubmitting(true);
      await adminBusinessService.deleteCategory(activeCategory.id);
      showToast(`Category "${activeCategory.name}" removed successfully`, 'success');
      setShowDeleteModal(false);
      setActiveCategory(null);
      await loadCategoriesData();
    } catch (err: any) {
      console.error('Delete error:', err);
      showToast(err?.message || 'Failed to delete category.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // FILTER MANAGEMENT ACTIONS
  const handleOpenFilterModal = async (cat: Category) => {
    setActiveCategory(cat);
    setShowFilterModal(true);
    setLoadingFilters(true);
    try {
      const [allFilters, catFilters] = await Promise.all([
        adminBusinessService.getFilters(),
        adminBusinessService.getCategoryFilters(cat.id || cat.slug)
      ]);
      setAvailableFilters(allFilters || []);
      const assignedIds = (catFilters || []).map((f: any) => f.id || f.filter_id || f.key || f.name);
      setAssignedFilterIds(assignedIds);
    } catch (err) {
      console.error('Error fetching filters:', err);
    } finally {
      setLoadingFilters(false);
    }
  };

  const handleToggleAssignFilter = (filterId: string | number) => {
    setAssignedFilterIds(prev =>
      prev.includes(filterId) ? prev.filter(id => id !== filterId) : [...prev, filterId]
    );
  };

  const handleSaveCategoryFilters = async () => {
    if (!activeCategory) return;
    try {
      setIsSubmitting(true);
      await adminBusinessService.assignCategoryFilter(activeCategory.id || activeCategory.slug, assignedFilterIds);
      showToast(`Filter attributes updated for category "${activeCategory.name}"`, 'success');
      setShowFilterModal(false);
    } catch (err: any) {
      showToast(err?.message || 'Failed to assign category filters', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateFilterAttribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFilterData.name.trim() || !newFilterData.key.trim()) return;
    try {
      setIsSubmitting(true);
      await adminBusinessService.createFilter({
        name: newFilterData.name.trim(),
        key: newFilterData.key.trim(),
        type: newFilterData.type
      });
      showToast(`Filter attribute "${newFilterData.name}" created`, 'success');
      setNewFilterData({ name: '', key: '', type: 'checkbox' });
      setShowCreateFilterForm(false);
      const updated = await adminBusinessService.getFilters();
      setAvailableFilters(updated || []);
    } catch (err: any) {
      showToast(err?.message || 'Failed to create filter attribute', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddFilterOptionValue = async (filterId: string | number) => {
    if (!newOptionData.label.trim() || !newOptionData.value.trim()) return;
    try {
      setIsSubmitting(true);
      await adminBusinessService.addFilterOption(filterId, {
        label: newOptionData.label.trim(),
        value: newOptionData.value.trim()
      });
      showToast('New option value added to filter attribute', 'success');
      setNewOptionData({ label: '', value: '' });
      setSelectedFilterForOption(null);
      const updated = await adminBusinessService.getFilters();
      setAvailableFilters(updated || []);
    } catch (err: any) {
      showToast(err?.message || 'Failed to add filter option value', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // FILTERING LOGIC
  const filteredCategories = categories.filter((cat) => {
    const matchesSearch = 
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cat.description && cat.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && cat.is_active) || 
      (statusFilter === 'inactive' && !cat.is_active);

    const matchesTaxonomy = 
      taxonomyFilter === 'all' || 
      (taxonomyFilter === 'main' && !cat.parent_id) || 
      (taxonomyFilter === 'sub' && Boolean(cat.parent_id));

    return matchesSearch && matchesStatus && matchesTaxonomy;
  });

  // Calculate stats
  const totalCategories = categories.length;
  const activeCount = categories.filter((c) => c.is_active).length;
  const inactiveCount = totalCategories - activeCount;
  const mainCount = categories.filter((c) => !c.parent_id).length;

  const getParentName = (parentId?: number | null) => {
    if (!parentId) return null;
    const parent = categories.find((c) => c.id === parentId);
    return parent ? parent.name : `Parent #${parentId}`;
  };

  return (
    <div className="space-y-6">
      
      {/* TOAST FEEDBACK NOTIFICATION */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 p-4 rounded-2xl border shadow-xl flex items-center gap-3 animate-in fade-in duration-200 font-mono text-xs ${
          toast.type === 'success' 
            ? 'bg-emerald-950 text-emerald-100 border-emerald-800' 
            : 'bg-rose-950 text-rose-100 border-rose-800'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
          <span className="font-semibold">{toast.message}</span>
        </div>
      )}

      {/* SUPER ADMIN PRIVILEGE LEVEL BADGE */}
      <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 font-mono text-xs text-rose-950">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0" />
          <div>
            <span className="font-bold">Active Role Persona: {activeRole}</span> &bull;{' '}
            {isSuperAdmin ? (
              <span className="text-rose-700 font-semibold">
                Super Admin Full Access Enabled (Create, View, Edit, Status Toggle, Delete)
              </span>
            ) : (
              <span className="text-slate-600 font-medium">
                Role-restricted view ({canCreate ? 'Category editing enabled' : 'Read-only access mode'}).
              </span>
            )}
          </div>
        </div>
        <span className="px-2.5 py-0.5 bg-rose-600 text-white text-[10px] font-bold rounded-md uppercase shrink-0">
          {isSuperAdmin ? 'Full Access' : activeRole}
        </span>
      </div>

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-600 font-mono text-xs font-bold uppercase tracking-wider mb-1">
            <FolderTree size={16} />
            TAXONOMY CONTROL CENTER
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#18181B]">
            Categories & Sector Management
          </h2>
          <p className="text-xs text-[#667085] mt-0.5 font-mono">
            Define classified service sectors, subcategories, display order, icons, and status flags
          </p>
        </div>
        
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button 
            onClick={loadCategoriesData}
            title="Reload Categories"
            className="p-2.5 border border-[#E4E7EC] bg-white rounded-xl text-[#667085] hover:text-[#18181B] hover:bg-slate-50 shadow-xs transition"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 bg-[#18181B] hover:bg-rose-600 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-sm font-mono"
          >
            <Plus size={16} />
            <span>Create Category</span>
          </button>
        </div>
      </div>

      {/* SUMMARY METRICS BAR */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E4E7EC] rounded-2xl p-4 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider font-mono">Total Categories</span>
            <span className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
              <FolderTree size={16} />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-[#18181B] mt-2 font-mono">{totalCategories}</div>
          <div className="text-[10px] text-[#667085] mt-1 font-mono">{mainCount} Main / {totalCategories - mainCount} Sub</div>
        </div>

        <div className="bg-white border border-[#E4E7EC] rounded-2xl p-4 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider font-mono">Active Sectors</span>
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 size={16} />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2 font-mono">{activeCount}</div>
          <div className="text-[10px] text-[#667085] mt-1 font-mono">Visible on marketplace</div>
        </div>

        <div className="bg-white border border-[#E4E7EC] rounded-2xl p-4 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider font-mono">Inactive Sectors</span>
            <span className="p-1.5 bg-slate-100 text-slate-500 rounded-lg">
              <XCircle size={16} />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-600 mt-2 font-mono">{inactiveCount}</div>
          <div className="text-[10px] text-[#667085] mt-1 font-mono">Disabled / Draft</div>
        </div>

        <div className="bg-white border border-[#E4E7EC] rounded-2xl p-4 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider font-mono">Taxonomy Levels</span>
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Layers size={16} />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-indigo-600 mt-2 font-mono">2 Tier</div>
          <div className="text-[10px] text-[#667085] mt-1 font-mono">Main & Subcategories</div>
        </div>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="bg-white border border-[#E4E7EC] rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search category name, slug, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-rose-400 font-mono transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl px-3 py-1.5 text-xs font-mono">
            <Filter size={13} className="text-slate-400" />
            <span className="text-[#667085] text-[11px]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent text-[#18181B] font-bold focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>

          {/* Taxonomy Filter */}
          <div className="flex items-center gap-1.5 bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl px-3 py-1.5 text-xs font-mono">
            <Layers size={13} className="text-slate-400" />
            <span className="text-[#667085] text-[11px]">Tier:</span>
            <select
              value={taxonomyFilter}
              onChange={(e) => setTaxonomyFilter(e.target.value as any)}
              className="bg-transparent text-[#18181B] font-bold focus:outline-none cursor-pointer"
            >
              <option value="all">All Tiers</option>
              <option value="main">Main Categories</option>
              <option value="sub">Subcategories</option>
            </select>
          </div>
        </div>
      </div>

      {/* CATEGORIES TABLE */}
      <div className="bg-white border border-[#E4E7EC] rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E4E7EC] bg-[#F8F9FC]/50 flex justify-between items-center font-mono text-xs">
          <span className="font-bold text-[#18181B]">Category List ({filteredCategories.length})</span>
          <span className="text-[11px] text-[#667085]">Showing matching records</span>
        </div>

        {loading ? (
          <div className="p-12 text-center font-mono text-xs text-slate-400">
            <RefreshCw className="animate-spin mx-auto mb-2 text-rose-600" size={24} />
            Loading categories directory...
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-12 text-center font-mono text-xs text-[#667085]">
            <FolderTree size={36} className="mx-auto mb-3 text-slate-300" />
            <p className="font-bold text-slate-700">No categories found</p>
            <p className="text-[11px] text-slate-400 mt-1">Try adjusting search or filter criteria, or click "Create Category" to add one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8F9FC] text-[#667085] uppercase tracking-wider font-mono border-b border-[#E4E7EC] font-bold text-[10px]">
                  <th className="p-4 pl-6">ID & Icon</th>
                  <th className="p-4">Category Name</th>
                  <th className="p-4">Slug Identifier</th>
                  <th className="p-4">Taxonomy Tier</th>
                  <th className="p-4">Sort Order</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EC] font-mono">
                {filteredCategories.map((cat) => {
                  const parentName = getParentName(cat.parent_id);
                  const isSub = Boolean(cat.parent_id);

                  return (
                    <tr key={cat.id} className="hover:bg-slate-50/70 transition-colors">
                      
                      {/* ID & ICON */}
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
                            <CategoryIcon name={cat.icon} size={18} />
                          </div>
                          <div>
                            <span className="font-bold text-slate-700 text-[11px]">#{cat.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* NAME */}
                      <td className="p-4 font-sans">
                        <div className="flex items-center gap-1.5">
                          {isSub && <ChevronRight size={14} className="text-slate-400 shrink-0" />}
                          <span className="font-bold text-[#18181B] text-sm">{cat.name}</span>
                        </div>
                        {cat.description && (
                          <p className="text-[11px] text-[#667085] line-clamp-1 mt-0.5 max-w-xs">{cat.description}</p>
                        )}
                      </td>

                      {/* SLUG */}
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[11px] font-bold">
                          {cat.slug}
                        </span>
                      </td>

                      {/* TAXONOMY TIER */}
                      <td className="p-4">
                        {isSub ? (
                          <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-[10px] font-bold inline-flex items-center gap-1">
                            Subcategory of <strong className="underline">{parentName}</strong>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-100 rounded-lg text-[10px] font-bold">
                            Root Main Category
                          </span>
                        )}
                      </td>

                      {/* SORT ORDER */}
                      <td className="p-4 font-bold text-slate-700">
                        <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center text-xs">
                          {cat.sort_order ?? 0}
                        </span>
                      </td>

                      {/* STATUS */}
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleStatus(cat)}
                          title="Click to toggle status"
                          className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase transition-all flex items-center gap-1.5 ${
                            cat.is_active 
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${cat.is_active ? 'bg-emerald-600' : 'bg-slate-500'}`} />
                          {cat.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      {/* ACTIONS */}
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenFilterModal(cat)}
                            title="Assign & Manage Category Filters"
                            className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition"
                          >
                            <Filter size={15} />
                          </button>

                          <button
                            onClick={() => handleOpenViewModal(cat)}
                            title="View Category Details"
                            className="p-1.5 text-[#667085] hover:text-[#18181B] hover:bg-slate-100 rounded-lg transition"
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(cat)}
                            title="Edit Category"
                            className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition"
                          >
                            <Edit size={15} />
                          </button>

                          <button
                            onClick={() => handleOpenDeleteModal(cat)}
                            title="Delete Category"
                            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: CREATE CATEGORY FORM MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-[#E4E7EC] shadow-2xl overflow-hidden font-sans">
            
            {/* Header */}
            <div className="p-5 border-b border-[#E4E7EC] bg-[#F8F9FC] flex justify-between items-center">
              <div className="flex items-center gap-2 text-rose-600 font-mono text-xs font-bold uppercase">
                <Plus size={18} />
                <span>Create New Category</span>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateCategory} className="p-6 space-y-4 font-mono text-xs">
              
              {/* Category Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">
                    Category Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. VIP Call Girls"
                    value={formData.name}
                    onChange={handleNameChange}
                    className={`w-full bg-[#F8F9FC] border rounded-xl px-3 py-2.5 text-xs focus:outline-none transition ${
                      formErrors.name ? 'border-rose-500 bg-rose-50/20' : 'border-[#E4E7EC] focus:border-rose-500'
                    }`}
                  />
                  {formErrors.name && <p className="text-[10px] text-rose-600 font-bold">{formErrors.name}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">
                    URL Slug <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. vip-call-girls"
                    value={formData.slug}
                    onChange={handleSlugChange}
                    className={`w-full bg-[#F8F9FC] border rounded-xl px-3 py-2.5 text-xs focus:outline-none transition ${
                      formErrors.slug ? 'border-rose-500 bg-rose-50/20' : 'border-[#E4E7EC] focus:border-rose-500'
                    }`}
                  />
                  {formErrors.slug && <p className="text-[10px] text-rose-600 font-bold">{formErrors.slug}</p>}
                </div>
              </div>

              {/* Parent Category & Sort Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Parent Taxonomy Tier</label>
                  <select
                    value={formData.parent_id}
                    onChange={(e) => setFormData((prev) => ({ ...prev, parent_id: e.target.value }))}
                    className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-rose-500"
                  >
                    <option value="">None (Top Level Root Category)</option>
                    {categories.filter(c => !c.parent_id).map((c) => (
                      <option key={c.id} value={c.id}>Child of: {c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Sort Order Index</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.sort_order}
                    onChange={(e) => setFormData((prev) => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Icon Selector & Status Switch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Icon Identifier</label>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl">
                      <CategoryIcon name={formData.icon} size={18} />
                    </div>
                    <select
                      value={formData.icon}
                      onChange={(e) => setFormData((prev) => ({ ...prev, icon: e.target.value }))}
                      className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-rose-500"
                    >
                      {AVAILABLE_ICONS.map((ic) => (
                        <option key={ic.value} value={ic.value}>{ic.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Publication Status</label>
                  <select
                    value={formData.is_active ? 'true' : 'false'}
                    onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.value === 'true' }))}
                    className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-rose-500 font-bold"
                  >
                    <option value="true">Active (Published on marketplace)</option>
                    <option value="false">Inactive (Hidden / Draft)</option>
                  </select>
                </div>
              </div>

              {/* Cover Image URL */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Cover Image URL</label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.cover_image}
                    onChange={(e) => setFormData((prev) => ({ ...prev, cover_image: e.target.value }))}
                    className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-rose-500"
                  />
                  {formData.cover_image && (
                    <div className="w-10 h-10 rounded-lg border border-slate-200 overflow-hidden shrink-0 bg-slate-100">
                      <img src={formData.cover_image} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe this category's scope and service offerings..."
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl p-3 text-xs focus:outline-none focus:border-rose-500 font-sans"
                />
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-[#E4E7EC]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 border border-[#E4E7EC] rounded-xl text-xs font-bold text-[#667085] hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <span>Creating...</span>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>Save & Create Category</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL 2: EDIT CATEGORY MODAL */}
      {showEditModal && activeCategory && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-[#E4E7EC] shadow-2xl overflow-hidden font-sans">
            
            {/* Header */}
            <div className="p-5 border-b border-[#E4E7EC] bg-[#F8F9FC] flex justify-between items-center">
              <div className="flex items-center gap-2 text-indigo-600 font-mono text-xs font-bold uppercase">
                <Edit size={18} />
                <span>Edit Category: {activeCategory.name}</span>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleUpdateCategory} className="p-6 space-y-4 font-mono text-xs">
              
              {/* Category Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">
                    Category Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={handleNameChange}
                    className={`w-full bg-[#F8F9FC] border rounded-xl px-3 py-2.5 text-xs focus:outline-none transition ${
                      formErrors.name ? 'border-rose-500 bg-rose-50/20' : 'border-[#E4E7EC] focus:border-indigo-500'
                    }`}
                  />
                  {formErrors.name && <p className="text-[10px] text-rose-600 font-bold">{formErrors.name}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">
                    URL Slug <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={handleSlugChange}
                    className={`w-full bg-[#F8F9FC] border rounded-xl px-3 py-2.5 text-xs focus:outline-none transition ${
                      formErrors.slug ? 'border-rose-500 bg-rose-50/20' : 'border-[#E4E7EC] focus:border-indigo-500'
                    }`}
                  />
                  {formErrors.slug && <p className="text-[10px] text-rose-600 font-bold">{formErrors.slug}</p>}
                </div>
              </div>

              {/* Parent Category & Sort Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Parent Taxonomy Tier</label>
                  <select
                    value={formData.parent_id}
                    onChange={(e) => setFormData((prev) => ({ ...prev, parent_id: e.target.value }))}
                    className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">None (Top Level Root Category)</option>
                    {categories.filter(c => !c.parent_id && c.id !== activeCategory.id).map((c) => (
                      <option key={c.id} value={c.id}>Child of: {c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Sort Order Index</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.sort_order}
                    onChange={(e) => setFormData((prev) => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Icon Selector & Status Switch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Icon Identifier</label>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-xl">
                      <CategoryIcon name={formData.icon} size={18} />
                    </div>
                    <select
                      value={formData.icon}
                      onChange={(e) => setFormData((prev) => ({ ...prev, icon: e.target.value }))}
                      className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                    >
                      {AVAILABLE_ICONS.map((ic) => (
                        <option key={ic.value} value={ic.value}>{ic.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Publication Status</label>
                  <select
                    value={formData.is_active ? 'true' : 'false'}
                    onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.value === 'true' }))}
                    className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-indigo-500 font-bold"
                  >
                    <option value="true">Active (Published on marketplace)</option>
                    <option value="false">Inactive (Hidden / Draft)</option>
                  </select>
                </div>
              </div>

              {/* Cover Image URL */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Cover Image URL</label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={formData.cover_image}
                    onChange={(e) => setFormData((prev) => ({ ...prev, cover_image: e.target.value }))}
                    className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                  />
                  {formData.cover_image && (
                    <div className="w-10 h-10 rounded-lg border border-slate-200 overflow-hidden shrink-0 bg-slate-100">
                      <img src={formData.cover_image} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 font-sans"
                />
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-[#E4E7EC]">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 border border-[#E4E7EC] rounded-xl text-xs font-bold text-[#667085] hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL 3: VIEW CATEGORY DETAILS MODAL */}
      {showViewModal && activeCategory && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#E4E7EC] shadow-2xl overflow-hidden font-sans">
            
            {/* Image Header */}
            {activeCategory.cover_image && (
              <div className="h-40 w-full relative bg-slate-900 overflow-hidden">
                <img src={activeCategory.cover_image} alt="" className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent flex items-end p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white text-rose-600 shadow-md flex items-center justify-center">
                      <CategoryIcon name={activeCategory.icon} size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-white">{activeCategory.name}</h3>
                      <span className="text-xs font-mono text-rose-300">/{activeCategory.slug}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="p-6 space-y-4 font-mono text-xs">
              
              <div className="flex items-center justify-between border-b pb-3">
                <span className="text-slate-500">Status</span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                  activeCategory.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                }`}>
                  {activeCategory.is_active ? 'Active (Published)' : 'Inactive (Draft)'}
                </span>
              </div>

              <div className="flex items-center justify-between border-b pb-3">
                <span className="text-slate-500">Taxonomy Hierarchy</span>
                <span className="font-bold text-slate-800">
                  {activeCategory.parent_id ? `Subcategory (Parent: #${activeCategory.parent_id})` : 'Root Main Category'}
                </span>
              </div>

              <div className="flex items-center justify-between border-b pb-3">
                <span className="text-slate-500">Sort Order Index</span>
                <span className="font-bold text-slate-800">#{activeCategory.sort_order ?? 0}</span>
              </div>

              <div>
                <span className="text-slate-500 block mb-1">Description</span>
                <p className="p-3 bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl text-slate-700 leading-relaxed font-sans text-xs">
                  {activeCategory.description || 'No description provided for this category.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-[#E4E7EC]">
                <button
                  onClick={() => handleOpenDeleteModal(activeCategory)}
                  className="px-3.5 py-2 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl font-bold transition flex items-center gap-1.5 text-xs"
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="px-4 py-2 border border-[#E4E7EC] rounded-xl text-xs font-bold text-[#667085]"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleOpenEditModal(activeCategory);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Edit size={14} />
                    <span>Edit Category</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* MODAL 4: DELETE CONFIRMATION MODAL */}
      {showDeleteModal && activeCategory && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#E4E7EC] shadow-2xl p-6 space-y-4 font-mono text-xs">
            
            <div className="flex items-center gap-2.5 text-rose-600 border-b pb-3">
              <AlertCircle size={22} className="shrink-0" />
              <h4 className="font-bold text-base text-[#18181B] font-sans">Delete Category Confirmation</h4>
            </div>

            <p className="text-slate-600 font-sans leading-relaxed text-sm">
              Are you sure you want to permanently delete category <strong className="text-slate-900">"{activeCategory.name}"</strong> (<code className="text-rose-600 font-mono text-xs">{activeCategory.slug}</code>)?
            </p>

            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-[11px] leading-relaxed">
              ⚠️ <strong>Warning:</strong> Deleting a category removes its definition from the taxonomy index and may affect associated listings and filter schemas.
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#E4E7EC]">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2.5 border border-[#E4E7EC] rounded-xl text-xs font-bold text-[#667085] hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeleteCategory}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                {isSubmitting ? (
                  <span>Deleting...</span>
                ) : (
                  <>
                    <Trash2 size={15} />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 5: CATEGORY FILTER ASSIGNMENT & FILTER MANAGER MODAL */}
      {showFilterModal && activeCategory && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#E4E7EC] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-[#E4E7EC] bg-[#F8F9FC] flex justify-between items-center">
              <div className="flex items-center gap-2.5 text-amber-600 font-mono">
                <Sliders size={20} />
                <div>
                  <h3 className="font-bold text-base text-[#18181B] font-sans">Category Filter Attributes</h3>
                  <p className="text-[11px] text-[#667085]">Assign dynamic filter attributes for <span className="font-bold text-amber-700">{activeCategory.name}</span> ({activeCategory.slug})</p>
                </div>
              </div>
              <button
                onClick={() => setShowFilterModal(false)}
                className="p-1.5 text-[#667085] hover:text-[#18181B] hover:bg-slate-200 rounded-lg transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 font-mono text-xs">
              
              {loadingFilters ? (
                <div className="p-8 text-center text-slate-400">
                  <RefreshCw className="animate-spin mx-auto mb-2 text-amber-600" size={24} />
                  Syncing category filters from backend API...
                </div>
              ) : (
                <>
                  {/* SECTION 1: ASSIGNED FILTERS LIST */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Available Filter Attributes ({availableFilters.length})
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowCreateFilterForm(!showCreateFilterForm)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        <Plus size={14} />
                        <span>{showCreateFilterForm ? 'Cancel New Filter' : 'Create New Filter Attribute'}</span>
                      </button>
                    </div>

                    {/* Inline Create Filter Form */}
                    {showCreateFilterForm && (
                      <form onSubmit={handleCreateFilterAttribute} className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl space-y-3 font-sans">
                        <h4 className="font-bold text-indigo-950 text-xs flex items-center gap-1 font-mono">
                          <Plus size={14} /> Create New Filter Attribute (POST /admin/filters)
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <input
                            type="text"
                            placeholder="Filter Name (e.g. Nationality)"
                            value={newFilterData.name}
                            onChange={(e) => setNewFilterData(prev => ({ ...prev, name: e.target.value }))}
                            className="p-2.5 text-xs bg-white border border-indigo-200 rounded-lg"
                            required
                          />
                          <input
                            type="text"
                            placeholder="Key (e.g. nationality)"
                            value={newFilterData.key}
                            onChange={(e) => setNewFilterData(prev => ({ ...prev, key: e.target.value }))}
                            className="p-2.5 text-xs bg-white border border-indigo-200 rounded-lg"
                            required
                          />
                          <select
                            value={newFilterData.type}
                            onChange={(e) => setNewFilterData(prev => ({ ...prev, type: e.target.value }))}
                            className="p-2.5 text-xs bg-white border border-indigo-200 rounded-lg"
                          >
                            <option value="checkbox">Checkbox (Multi-select)</option>
                            <option value="select">Dropdown Select</option>
                            <option value="radio">Radio Option</option>
                          </select>
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-lg hover:bg-indigo-700 transition"
                          >
                            Save New Filter Attribute
                          </button>
                        </div>
                      </form>
                    )}

                    {availableFilters.length === 0 ? (
                      <div className="p-4 text-center text-slate-400 bg-slate-50 rounded-xl">
                        No filter attributes defined. Click "Create New Filter Attribute" to add one.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {availableFilters.map((filter) => {
                          const filterId = filter.id || filter.filter_id || filter.key || filter.name;
                          const isAssigned = assignedFilterIds.includes(filterId);

                          return (
                            <div
                              key={filterId}
                              className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                                isAssigned 
                                  ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-300' 
                                  : 'bg-white border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <label className="flex items-center gap-2 cursor-pointer font-sans">
                                  <input
                                    type="checkbox"
                                    checked={isAssigned}
                                    onChange={() => handleToggleAssignFilter(filterId)}
                                    className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 h-4 w-4"
                                  />
                                  <div>
                                    <span className="font-bold text-slate-800 text-xs">{filter.name || filter.label}</span>
                                    <span className="block text-[10px] text-slate-400 font-mono">key: {filter.key || filter.slug} &bull; type: {filter.type || 'checkbox'}</span>
                                  </div>
                                </label>
                                <button
                                  type="button"
                                  onClick={() => setSelectedFilterForOption(selectedFilterForOption === filterId ? null : filterId)}
                                  className="text-[10px] text-indigo-600 font-bold hover:underline shrink-0"
                                >
                                  + Option
                                </button>
                              </div>

                              {/* Inline Option Creator */}
                              {selectedFilterForOption === filterId && (
                                <div className="mt-2.5 pt-2 border-t border-slate-200/80 space-y-2 font-sans">
                                  <span className="text-[10px] font-bold text-slate-600">Add Option Value (POST /admin/filters/{filterId}/options):</span>
                                  <div className="flex gap-1.5">
                                    <input
                                      type="text"
                                      placeholder="Label (e.g. Indian)"
                                      value={newOptionData.label}
                                      onChange={(e) => setNewOptionData(prev => ({ ...prev, label: e.target.value }))}
                                      className="p-1.5 text-[11px] border border-slate-300 rounded w-1/2"
                                    />
                                    <input
                                      type="text"
                                      placeholder="Value (e.g. Indian)"
                                      value={newOptionData.value}
                                      onChange={(e) => setNewOptionData(prev => ({ ...prev, value: e.target.value }))}
                                      className="p-1.5 text-[11px] border border-slate-300 rounded w-1/2"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleAddFilterOptionValue(filterId)}
                                      className="px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded shrink-0"
                                    >
                                      Add
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#E4E7EC] bg-[#F8F9FC] flex justify-between items-center font-mono text-xs">
              <span className="text-slate-500 text-[11px]">
                {assignedFilterIds.length} filter attribute(s) selected
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowFilterModal(false)}
                  className="px-4 py-2 border border-[#E4E7EC] rounded-xl font-bold text-[#667085] hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSaveCategoryFilters}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  {isSubmitting ? (
                    <span>Updating...</span>
                  ) : (
                    <>
                      <Check size={15} />
                      <span>Save Category Filters</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
