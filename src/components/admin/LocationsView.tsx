import React, { useState, useEffect } from 'react';
import { adminLocationService } from '../../services/admin.service';
import { 
  Globe, 
  Map, 
  Building2, 
  MapPin, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  RefreshCw, 
  Check, 
  X, 
  AlertCircle,
  Hash,
  Star,
  Compass
} from 'lucide-react';

interface LocationsViewProps {
  activeRole: string;
}

export const LocationsView: React.FC<LocationsViewProps> = ({ activeRole }) => {
  // Navigation Tabs: 'countries' | 'regions' | 'cities' | 'areas'
  const [activeTab, setActiveTab] = useState<'countries' | 'regions' | 'cities' | 'areas'>('cities');

  // Dynamic API State
  const [countries, setCountries] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);

  // Filtering & Cascading State
  const [selectedCountryId, setSelectedCountryId] = useState<string>('all');
  const [selectedRegionId, setSelectedRegionId] = useState<string>('all');
  const [selectedCityId, setSelectedCityId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [featuredFilter, setFeaturedFilter] = useState<'all' | 'featured' | 'standard'>('all');

  // Loading States
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals state
  const [showModal, setShowModal] = useState<
    'none' | 'create_country' | 'edit_country' | 'create_region' | 'edit_region' | 'create_city' | 'edit_city' | 'create_area' | 'edit_area' | 'view_item' | 'delete_item'
  >('none');
  const [activeItem, setActiveItem] = useState<any>(null);

  // Toast feedback
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Form States
  const [countryForm, setCountryForm] = useState({
    name: '',
    slug: '',
    iso2: '',
    iso3: '',
    phone_code: '',
    sort_order: 1,
    is_active: true,
  });

  const [regionForm, setRegionForm] = useState({
    country_id: '',
    name: '',
    code: '',
    slug: '',
    sort_order: 1,
    is_active: true,
  });

  const [cityForm, setCityForm] = useState({
    region_id: '',
    name: '',
    slug: '',
    pincode: '',
    image: '',
    is_featured: false,
    is_active: true,
    sort_order: 1,
  });

  const [areaForm, setAreaForm] = useState({
    city_id: '',
    name: '',
    slug: '',
    pincode: '',
    sort_order: 1,
    is_active: true,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [autoSlug, setAutoSlug] = useState(true);

  // Permission Guard Helper
  const isSuperAdmin = activeRole === 'Super Admin';
  const canCreate = isSuperAdmin || ['Admin'].includes(activeRole);
  const canEdit = isSuperAdmin || ['Admin'].includes(activeRole);
  const canDelete = isSuperAdmin;

  // 1. Fetch Countries dynamically from API
  const fetchCountries = async () => {
    setLoadingCountries(true);
    try {
      const data = await adminLocationService.getCountries();
      setCountries(data || []);
    } catch (err: any) {
      console.error('Error fetching countries:', err);
      showToast('Failed to load countries from API', 'error');
    } finally {
      setLoadingCountries(false);
    }
  };

  // 2. Fetch Regions dynamically from API
  const fetchRegions = async (cId?: string) => {
    setLoadingRegions(true);
    try {
      const countryFilterParam = cId && cId !== 'all' ? cId : (selectedCountryId !== 'all' ? selectedCountryId : undefined);
      const data = await adminLocationService.getRegions(countryFilterParam);
      setRegions(data || []);
    } catch (err: any) {
      console.error('Error fetching regions:', err);
      showToast('Failed to load regions from API', 'error');
    } finally {
      setLoadingRegions(false);
    }
  };

  // 3. Fetch Cities dynamically from API
  const fetchCities = async (rId?: string, cId?: string) => {
    setLoadingCities(true);
    try {
      const regParam = rId && rId !== 'all' ? rId : (selectedRegionId !== 'all' ? selectedRegionId : undefined);
      const countryParam = cId && cId !== 'all' ? cId : (selectedCountryId !== 'all' ? selectedCountryId : undefined);
      const data = await adminLocationService.getCities(regParam, countryParam);
      setCities(data || []);
    } catch (err: any) {
      console.error('Error fetching cities:', err);
      showToast('Failed to load cities from API', 'error');
    } finally {
      setLoadingCities(false);
    }
  };

  // 4. Fetch Areas dynamically from API
  const fetchAreas = async (ctyId?: string, rId?: string, cId?: string) => {
    setLoadingAreas(true);
    try {
      const cityParam = ctyId && ctyId !== 'all' ? ctyId : (selectedCityId !== 'all' ? selectedCityId : undefined);
      const regParam = rId && rId !== 'all' ? rId : (selectedRegionId !== 'all' ? selectedRegionId : undefined);
      const countryParam = cId && cId !== 'all' ? cId : (selectedCountryId !== 'all' ? selectedCountryId : undefined);
      const data = await adminLocationService.getAreas(cityParam, regParam, countryParam);
      setAreas(data || []);
    } catch (err: any) {
      console.error('Error fetching areas:', err);
      showToast('Failed to load areas from API', 'error');
    } finally {
      setLoadingAreas(false);
    }
  };

  // Trigger loads on mount & tab change
  useEffect(() => {
    fetchCountries();
    fetchRegions();
    fetchCities();
    fetchAreas();
  }, []);

  useEffect(() => {
    if (activeTab === 'countries') {
      fetchCountries();
    } else if (activeTab === 'regions') {
      fetchRegions(selectedCountryId);
    } else if (activeTab === 'cities') {
      fetchCities(selectedRegionId, selectedCountryId);
    } else if (activeTab === 'areas') {
      fetchAreas(selectedCityId, selectedRegionId, selectedCountryId);
    }
  }, [activeTab, selectedCountryId, selectedRegionId, selectedCityId]);

  // Helper to generate slug from name
  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Auto-slug handlers
  const handleNameChange = (val: string, type: 'country' | 'region' | 'city' | 'area') => {
    const generatedSlug = autoSlug ? slugify(val) : '';
    if (type === 'country') {
      setCountryForm(prev => ({ ...prev, name: val, slug: autoSlug ? generatedSlug : prev.slug }));
    } else if (type === 'region') {
      setRegionForm(prev => ({ ...prev, name: val, slug: autoSlug ? generatedSlug : prev.slug }));
    } else if (type === 'city') {
      setCityForm(prev => ({ ...prev, name: val, slug: autoSlug ? generatedSlug : prev.slug }));
    } else {
      setAreaForm(prev => ({ ...prev, name: val, slug: autoSlug ? generatedSlug : prev.slug }));
    }
  };

  // Reset Modal Form Inputs
  const resetForms = () => {
    const defaultCountry = countries[0]?.id || '';
    const defaultRegion = regions[0]?.id || '';
    const defaultCity = cities[0]?.id || '';

    setCountryForm({
      name: '',
      slug: '',
      iso2: '',
      iso3: '',
      phone_code: '',
      sort_order: countries.length + 1,
      is_active: true,
    });
    setRegionForm({
      country_id: selectedCountryId !== 'all' ? selectedCountryId : defaultCountry,
      name: '',
      code: '',
      slug: '',
      sort_order: regions.length + 1,
      is_active: true,
    });
    setCityForm({
      region_id: selectedRegionId !== 'all' ? selectedRegionId : defaultRegion,
      name: '',
      slug: '',
      pincode: '',
      image: '',
      is_featured: false,
      is_active: true,
      sort_order: cities.length + 1,
    });
    setAreaForm({
      city_id: selectedCityId !== 'all' ? selectedCityId : defaultCity,
      name: '',
      slug: '',
      pincode: '',
      sort_order: areas.length + 1,
      is_active: true,
    });
    setFormErrors({});
    setAutoSlug(true);
  };

  // Modal Action Launchers
  const openCreateModal = () => {
    if (!canCreate) {
      showToast('Access Denied: Super Admin / Admin access required.', 'error');
      return;
    }
    resetForms();
    if (activeTab === 'countries') setShowModal('create_country');
    else if (activeTab === 'regions') setShowModal('create_region');
    else if (activeTab === 'cities') setShowModal('create_city');
    else setShowModal('create_area');
  };

  const openEditModal = (item: any) => {
    if (!canEdit) {
      showToast('Access Denied: Editing privileges required.', 'error');
      return;
    }
    setActiveItem(item);
    setAutoSlug(false);
    setFormErrors({});

    if (activeTab === 'countries') {
      setCountryForm({
        name: item.name || '',
        slug: item.slug || '',
        iso2: item.iso2 || '',
        iso3: item.iso3 || '',
        phone_code: item.phone_code || '',
        sort_order: item.sort_order ?? 1,
        is_active: item.is_active ?? true,
      });
      setShowModal('edit_country');
    } else if (activeTab === 'regions') {
      setRegionForm({
        country_id: item.country_id || item.country?.id || countries[0]?.id || '',
        name: item.name || '',
        code: item.code || '',
        slug: item.slug || '',
        sort_order: item.sort_order ?? 1,
        is_active: item.is_active ?? true,
      });
      setShowModal('edit_region');
    } else if (activeTab === 'cities') {
      setCityForm({
        region_id: item.region_id || item.region?.id || regions[0]?.id || '',
        name: item.name || '',
        slug: item.slug || '',
        pincode: item.pincode || '',
        image: item.image || '',
        is_featured: item.is_featured ?? false,
        is_active: item.is_active ?? true,
        sort_order: item.sort_order ?? 1,
      });
      setShowModal('edit_city');
    } else {
      setAreaForm({
        city_id: item.city_id || item.city?.id || cities[0]?.id || '',
        name: item.name || '',
        slug: item.slug || '',
        pincode: item.pincode || '',
        sort_order: item.sort_order ?? 1,
        is_active: item.is_active ?? true,
      });
      setShowModal('edit_area');
    }
  };

  const openViewModal = (item: any) => {
    setActiveItem(item);
    setShowModal('view_item');
  };

  const openDeleteModal = (item: any) => {
    if (!canDelete) {
      showToast('Access Denied: Only Super Admin can delete location entries.', 'error');
      return;
    }
    setActiveItem(item);
    setShowModal('delete_item');
  };

  // --- CRUD API ACTIONS ---

  // 1. COUNTRY CRUD ACTIONS
  const handleSaveCountry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!countryForm.name.trim()) {
      setFormErrors({ name: 'Country name is required' });
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        name: countryForm.name.trim(),
        slug: countryForm.slug.trim() || slugify(countryForm.name),
        iso2: countryForm.iso2.trim().toUpperCase(),
        iso3: countryForm.iso3.trim().toUpperCase(),
        phone_code: countryForm.phone_code.trim(),
        sort_order: Number(countryForm.sort_order),
        is_active: countryForm.is_active,
      };

      if (showModal === 'create_country') {
        await adminLocationService.createCountry(payload);
        showToast(`Country "${payload.name}" created successfully`, 'success');
      } else {
        await adminLocationService.updateCountry(activeItem.id, payload);
        showToast(`Country "${payload.name}" updated successfully`, 'success');
      }
      setShowModal('none');
      await fetchCountries();
    } catch (err: any) {
      showToast(err?.message || 'Failed to save country', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. REGION CRUD ACTIONS
  const handleSaveRegion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regionForm.name.trim()) {
      setFormErrors({ name: 'Region/State name is required' });
      return;
    }
    if (!regionForm.country_id) {
      setFormErrors({ country_id: 'Country selection is required' });
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        country_id: Number(regionForm.country_id),
        name: regionForm.name.trim(),
        code: regionForm.code.trim().toUpperCase(),
        slug: regionForm.slug.trim() || slugify(regionForm.name),
        sort_order: Number(regionForm.sort_order),
        is_active: regionForm.is_active,
      };

      if (showModal === 'create_region') {
        await adminLocationService.createRegion(payload);
        showToast(`Region "${payload.name}" created successfully`, 'success');
      } else {
        await adminLocationService.updateRegion(activeItem.id, payload);
        showToast(`Region "${payload.name}" updated successfully`, 'success');
      }
      setShowModal('none');
      await fetchRegions();
    } catch (err: any) {
      showToast(err?.message || 'Failed to save region', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. CITY CRUD ACTIONS (WITH PINCODE)
  const handleSaveCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityForm.name.trim()) {
      setFormErrors({ name: 'City name is required' });
      return;
    }
    if (!cityForm.region_id) {
      setFormErrors({ region_id: 'State / Region selection is required' });
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        region_id: Number(cityForm.region_id),
        name: cityForm.name.trim(),
        slug: cityForm.slug.trim() || slugify(cityForm.name),
        pincode: cityForm.pincode.trim(),
        image: cityForm.image.trim(),
        is_featured: cityForm.is_featured,
        is_active: cityForm.is_active,
        sort_order: Number(cityForm.sort_order),
      };

      if (showModal === 'create_city') {
        await adminLocationService.createCity(payload);
        showToast(`City "${payload.name}" (PIN: ${payload.pincode || 'N/A'}) created successfully`, 'success');
      } else {
        await adminLocationService.updateCity(activeItem.id, payload);
        showToast(`City "${payload.name}" updated successfully`, 'success');
      }
      setShowModal('none');
      await fetchCities();
    } catch (err: any) {
      showToast(err?.message || 'Failed to save city', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. AREA CRUD ACTIONS
  const handleSaveArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!areaForm.name.trim()) {
      setFormErrors({ name: 'Area name is required' });
      return;
    }
    if (!areaForm.city_id) {
      setFormErrors({ city_id: 'City selection is required' });
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        city_id: Number(areaForm.city_id),
        name: areaForm.name.trim(),
        slug: areaForm.slug.trim() || slugify(areaForm.name),
        pincode: areaForm.pincode.trim(),
        sort_order: Number(areaForm.sort_order),
        is_active: areaForm.is_active,
      };

      if (showModal === 'create_area') {
        await adminLocationService.createArea(payload);
        showToast(`Area "${payload.name}" created successfully`, 'success');
      } else {
        await adminLocationService.updateArea(activeItem.id, payload);
        showToast(`Area "${payload.name}" updated successfully`, 'success');
      }
      setShowModal('none');
      await fetchAreas();
    } catch (err: any) {
      showToast(err?.message || 'Failed to save area', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. DELETE ITEM ACTION
  const handleDeleteItem = async () => {
    if (!activeItem) return;
    try {
      setIsSubmitting(true);
      if (activeTab === 'countries') {
        await adminLocationService.deleteCountry(activeItem.id);
        showToast(`Country "${activeItem.name}" deleted successfully`, 'success');
        await fetchCountries();
      } else if (activeTab === 'regions') {
        await adminLocationService.deleteRegion(activeItem.id);
        showToast(`Region "${activeItem.name}" deleted successfully`, 'success');
        await fetchRegions();
      } else if (activeTab === 'cities') {
        await adminLocationService.deleteCity(activeItem.id);
        showToast(`City "${activeItem.name}" deleted successfully`, 'success');
        await fetchCities();
      } else {
        await adminLocationService.deleteArea(activeItem.id);
        showToast(`Area "${activeItem.name}" deleted successfully`, 'success');
        await fetchAreas();
      }
      setShowModal('none');
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete item', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 6. TOGGLE ACTIVE / FEATURED ACTIONS
  const handleToggleActive = async (item: any) => {
    if (!canEdit) return;
    const nextStatus = !item.is_active;
    try {
      if (activeTab === 'countries') {
        await adminLocationService.updateCountry(item.id, { is_active: nextStatus });
        fetchCountries();
      } else if (activeTab === 'regions') {
        await adminLocationService.updateRegion(item.id, { is_active: nextStatus });
        fetchRegions();
      } else if (activeTab === 'cities') {
        await adminLocationService.updateCity(item.id, { is_active: nextStatus });
        fetchCities();
      } else {
        await adminLocationService.updateArea(item.id, { is_active: nextStatus });
        fetchAreas();
      }
      showToast(`"${item.name}" status updated to ${nextStatus ? 'Active' : 'Inactive'}`, 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to toggle status', 'error');
    }
  };

  const handleToggleFeaturedCity = async (cityItem: any) => {
    if (!canEdit) return;
    const nextFeatured = !cityItem.is_featured;
    try {
      await adminLocationService.updateCity(cityItem.id, { is_featured: nextFeatured });
      fetchCities();
      showToast(`City "${cityItem.name}" ${nextFeatured ? 'set as Featured Hub' : 'removed from Featured Hubs'}`, 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to update featured status', 'error');
    }
  };

  // Filter List Logic
  const filteredCountriesList = countries.filter(c => {
    const qMatch = c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || c.slug?.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone_code?.includes(searchQuery);
    const sMatch = statusFilter === 'all' || (statusFilter === 'active' && c.is_active) || (statusFilter === 'inactive' && !c.is_active);
    return qMatch && sMatch;
  });

  const filteredRegionsList = regions.filter(r => {
    const countryMatch = selectedCountryId === 'all' || String(r.country_id || r.country?.id) === String(selectedCountryId);
    const qMatch = r.name?.toLowerCase().includes(searchQuery.toLowerCase()) || r.slug?.toLowerCase().includes(searchQuery.toLowerCase()) || r.code?.toLowerCase().includes(searchQuery.toLowerCase());
    const sMatch = statusFilter === 'all' || (statusFilter === 'active' && r.is_active) || (statusFilter === 'inactive' && !r.is_active);
    return countryMatch && qMatch && sMatch;
  });

  const filteredCitiesList = cities.filter(c => {
    const regionMatch = selectedRegionId === 'all' || String(c.region_id || c.region?.id) === String(selectedRegionId);
    const countryMatch = selectedCountryId === 'all' || String(c.region?.country_id || c.country?.id) === String(selectedCountryId);
    const qMatch = c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || c.slug?.toLowerCase().includes(searchQuery.toLowerCase()) || (c.pincode && String(c.pincode).includes(searchQuery));
    const sMatch = statusFilter === 'all' || (statusFilter === 'active' && c.is_active) || (statusFilter === 'inactive' && !c.is_active);
    const fMatch = featuredFilter === 'all' || (featuredFilter === 'featured' && c.is_featured) || (featuredFilter === 'standard' && !c.is_featured);
    return regionMatch && countryMatch && qMatch && sMatch && fMatch;
  });

  const filteredAreasList = areas.filter(a => {
    const cityMatch = selectedCityId === 'all' || String(a.city_id || a.city?.id) === String(selectedCityId);
    const regionMatch = selectedRegionId === 'all' || String(a.city?.region_id || a.city?.region?.id) === String(selectedRegionId);
    const countryMatch = selectedCountryId === 'all' || String(a.city?.region?.country_id) === String(selectedCountryId);
    const qMatch = a.name?.toLowerCase().includes(searchQuery.toLowerCase()) || a.slug?.toLowerCase().includes(searchQuery.toLowerCase()) || (a.pincode && String(a.pincode).includes(searchQuery));
    const sMatch = statusFilter === 'all' || (statusFilter === 'active' && a.is_active) || (statusFilter === 'inactive' && !a.is_active);
    return cityMatch && regionMatch && countryMatch && qMatch && sMatch;
  });

  // Calculate stats
  const totalCountries = countries.length;
  const totalRegions = regions.length;
  const totalCities = cities.length;
  const totalAreas = areas.length;
  const featuredCitiesCount = cities.filter(c => c.is_featured).length;

  return (
    <div className="space-y-6">
      
      {/* TOAST NOTIFICATION */}
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

      {/* HEADER TITLE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-900">
            <MapPin className="w-6 h-6 text-rose-600" />
            <h1 className="text-2xl font-black tracking-tight">Location Management System</h1>
          </div>
          <p className="text-slate-500 text-xs font-mono mt-1">
            Dynamic database hierarchy: <strong className="text-rose-700">Country &rarr; Region/State &rarr; City &rarr; Area</strong>. Fully REST API integrated.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Plus size={15} />
            <span>
              {activeTab === 'countries' && 'Add New Country'}
              {activeTab === 'regions' && 'Add New State / Region'}
              {activeTab === 'cities' && 'Add New City'}
              {activeTab === 'areas' && 'Add New Area'}
            </span>
          </button>
        </div>
      </div>

      {/* KPI STATS CARD ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="p-4 bg-white border border-[#E4E7EC] rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Countries</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Globe size={18} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalCountries}</span>
            <span className="text-[10px] text-emerald-600 font-bold">API loaded</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-[#E4E7EC] rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Regions / States</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <Map size={18} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalRegions}</span>
            <span className="text-[10px] text-slate-400">territories</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-[#E4E7EC] rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cities & PIN Codes</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Building2 size={18} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalCities}</span>
            <span className="text-[10px] text-emerald-600 font-bold">100% database synced</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-[#E4E7EC] rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Areas & Localities</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Compass size={18} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalAreas}</span>
            <span className="text-[10px] text-emerald-600 font-bold">Localities registered</span>
          </div>
        </div>
      </div>

      {/* LOCATION DOMAIN TAB NAVIGATION */}
      <div className="bg-white border border-[#E4E7EC] rounded-2xl p-4 shadow-xs space-y-4">
        
        <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-3">
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            
            {/* Countries Tab */}
            <button
              onClick={() => setActiveTab('countries')}
              className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 ${
                activeTab === 'countries'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Globe size={15} />
              <span>Countries ({totalCountries})</span>
            </button>

            {/* Regions Tab */}
            <button
              onClick={() => setActiveTab('regions')}
              className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 ${
                activeTab === 'regions'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Map size={15} />
              <span>States / Regions ({totalRegions})</span>
            </button>

            {/* Cities Tab */}
            <button
              onClick={() => setActiveTab('cities')}
              className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 ${
                activeTab === 'cities'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Building2 size={15} />
              <span>Cities & PIN Codes ({totalCities})</span>
            </button>

            {/* Areas Tab */}
            <button
              onClick={() => setActiveTab('areas')}
              className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 ${
                activeTab === 'areas'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Compass size={15} />
              <span>Areas & Localities ({totalAreas})</span>
            </button>

          </div>

          <button
            onClick={() => { fetchCountries(); fetchRegions(); fetchCities(); fetchAreas(); }}
            className="p-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl transition font-mono text-xs flex items-center gap-1"
            title="Sync with database"
          >
            <RefreshCw size={14} />
            <span className="hidden sm:inline">Sync API</span>
          </button>
        </div>

        {/* CASCADING FILTER CONTROLS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
          
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            
            {/* Country Selector */}
            {(activeTab === 'regions' || activeTab === 'cities' || activeTab === 'areas') && (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-bold text-[11px]">Country:</span>
                <select
                  value={selectedCountryId}
                  onChange={(e) => {
                    setSelectedCountryId(e.target.value);
                    setSelectedRegionId('all');
                    setSelectedCityId('all');
                  }}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-rose-500 font-sans"
                >
                  <option value="all">All Countries</option>
                  {countries.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Region / State Selector */}
            {(activeTab === 'cities' || activeTab === 'areas') && (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-bold text-[11px]">State / Region:</span>
                <select
                  value={selectedRegionId}
                  onChange={(e) => {
                    setSelectedRegionId(e.target.value);
                    setSelectedCityId('all');
                  }}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-rose-500 font-sans"
                >
                  <option value="all">All States / Regions</option>
                  {regions
                    .filter(r => selectedCountryId === 'all' || String(r.country_id || r.country?.id) === String(selectedCountryId))
                    .map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))
                  }
                </select>
              </div>
            )}

            {/* City Selector (For Areas Tab) */}
            {activeTab === 'areas' && (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-bold text-[11px]">City:</span>
                <select
                  value={selectedCityId}
                  onChange={(e) => setSelectedCityId(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-rose-500 font-sans"
                >
                  <option value="all">All Cities</option>
                  {cities
                    .filter(c => selectedRegionId === 'all' || String(c.region_id || c.region?.id) === String(selectedRegionId))
                    .map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))
                  }
                </select>
              </div>
            )}

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none font-sans"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>

            {/* Featured Hub Filter (Cities tab only) */}
            {activeTab === 'cities' && (
              <select
                value={featuredFilter}
                onChange={(e) => setFeaturedFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none font-sans"
              >
                <option value="all">All Hub Types</option>
                <option value="featured">Featured Hubs</option>
                <option value="standard">Standard Hubs</option>
              </select>
            )}

          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder={`Search ${activeTab} by name, code, pincode...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-rose-500 font-sans"
            />
          </div>

        </div>

      </div>

      {/* --- TAB 1: COUNTRIES TABLE --- */}
      {activeTab === 'countries' && (
        <div className="bg-white border border-[#E4E7EC] rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#E4E7EC] bg-[#F8F9FC]/50 flex justify-between items-center font-mono text-xs">
            <span className="font-bold text-[#18181B]">Countries Directory ({filteredCountriesList.length})</span>
            <span className="text-[11px] text-[#667085]">Loaded dynamically from API</span>
          </div>

          {loadingCountries ? (
            <div className="p-12 text-center font-mono text-xs text-slate-400">
              <RefreshCw className="animate-spin mx-auto mb-2 text-indigo-600" size={24} />
              Syncing countries from database API...
            </div>
          ) : filteredCountriesList.length === 0 ? (
            <div className="p-12 text-center font-mono text-xs text-[#667085]">
              <Globe size={36} className="mx-auto mb-3 text-slate-300" />
              <p className="font-bold text-slate-700">No countries found</p>
              <p className="text-[11px] text-slate-400 mt-1">Click "Add New Country" to store a country record in database.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F8F9FC] text-[#667085] uppercase tracking-wider font-mono border-b border-[#E4E7EC] font-bold text-[10px]">
                    <th className="p-4 pl-6">ID & Country</th>
                    <th className="p-4">ISO Codes</th>
                    <th className="p-4">Phone Code</th>
                    <th className="p-4">Slug</th>
                    <th className="p-4">Sort Order</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E7EC] font-mono">
                  {filteredCountriesList.map((country) => (
                    <tr key={country.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center font-bold text-xs shrink-0">
                            {country.iso2 || country.name?.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 font-sans text-sm block">{country.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">#{country.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 font-bold text-slate-700">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px]">
                          ISO2: {country.iso2 || 'N/A'} | ISO3: {country.iso3 || 'N/A'}
                        </span>
                      </td>

                      <td className="p-4 font-bold text-indigo-700">
                        {country.phone_code || 'N/A'}
                      </td>

                      <td className="p-4">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-bold">
                          {country.slug}
                        </span>
                      </td>

                      <td className="p-4 font-bold text-slate-700">
                        {country.sort_order ?? 1}
                      </td>

                      <td className="p-4">
                        <button
                          onClick={() => handleToggleActive(country)}
                          className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase transition-all flex items-center gap-1.5 ${
                            country.is_active 
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${country.is_active ? 'bg-emerald-600' : 'bg-slate-500'}`} />
                          {country.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openViewModal(country)}
                            title="View Country Details"
                            className="p-1.5 text-[#667085] hover:text-[#18181B] hover:bg-slate-100 rounded-lg transition"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => openEditModal(country)}
                            title="Edit Country"
                            className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(country)}
                            title="Delete Country"
                            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* --- TAB 2: REGIONS / STATES TABLE --- */}
      {activeTab === 'regions' && (
        <div className="bg-white border border-[#E4E7EC] rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#E4E7EC] bg-[#F8F9FC]/50 flex justify-between items-center font-mono text-xs">
            <span className="font-bold text-[#18181B]">Regions / States Directory ({filteredRegionsList.length})</span>
            <span className="text-[11px] text-[#667085]">Loaded dynamically from API</span>
          </div>

          {loadingRegions ? (
            <div className="p-12 text-center font-mono text-xs text-slate-400">
              <RefreshCw className="animate-spin mx-auto mb-2 text-rose-600" size={24} />
              Syncing regions from database API...
            </div>
          ) : filteredRegionsList.length === 0 ? (
            <div className="p-12 text-center font-mono text-xs text-[#667085]">
              <Map size={36} className="mx-auto mb-3 text-slate-300" />
              <p className="font-bold text-slate-700">No states or regions found</p>
              <p className="text-[11px] text-slate-400 mt-1">Click "Add New State / Region" to store a region record in database.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F8F9FC] text-[#667085] uppercase tracking-wider font-mono border-b border-[#E4E7EC] font-bold text-[10px]">
                    <th className="p-4 pl-6">ID & Region / State</th>
                    <th className="p-4">Belonging Country</th>
                    <th className="p-4">Code</th>
                    <th className="p-4">Slug</th>
                    <th className="p-4">Sort Order</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E7EC] font-mono">
                  {filteredRegionsList.map((region) => {
                    const parentCountryName = region.country?.name || countries.find(c => String(c.id) === String(region.country_id))?.name || `Country #${region.country_id || 'N/A'}`;

                    return (
                      <tr key={region.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 border border-rose-100 flex items-center justify-center font-bold text-xs shrink-0">
                              {region.code || region.name?.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 font-sans text-sm block">{region.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">#{region.id}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-4 font-sans">
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-[11px] font-bold border border-slate-200 inline-flex items-center gap-1">
                            <Globe size={12} className="text-indigo-600" />
                            {parentCountryName}
                          </span>
                        </td>

                        <td className="p-4 font-bold text-slate-700">
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px]">
                            {region.code || 'N/A'}
                          </span>
                        </td>

                        <td className="p-4">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-bold">
                            {region.slug}
                          </span>
                        </td>

                        <td className="p-4 font-bold text-slate-700">
                          {region.sort_order ?? 1}
                        </td>

                        <td className="p-4">
                          <button
                            onClick={() => handleToggleActive(region)}
                            className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase transition-all flex items-center gap-1.5 ${
                              region.is_active 
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${region.is_active ? 'bg-emerald-600' : 'bg-slate-500'}`} />
                            {region.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </td>

                        <td className="p-4 pr-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openViewModal(region)}
                              title="View Region Details"
                              className="p-1.5 text-[#667085] hover:text-[#18181B] hover:bg-slate-100 rounded-lg transition"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => openEditModal(region)}
                              title="Edit Region"
                              className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition"
                            >
                              <Edit size={15} />
                            </button>
                            <button
                              onClick={() => openDeleteModal(region)}
                              title="Delete Region"
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
      )}

      {/* --- TAB 3: CITIES & PINCODES TABLE --- */}
      {activeTab === 'cities' && (
        <div className="bg-white border border-[#E4E7EC] rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#E4E7EC] bg-[#F8F9FC]/50 flex justify-between items-center font-mono text-xs">
            <span className="font-bold text-[#18181B]">Cities Directory with PIN Codes ({filteredCitiesList.length})</span>
            <span className="text-[11px] text-[#667085]">Loaded dynamically from API</span>
          </div>

          {loadingCities ? (
            <div className="p-12 text-center font-mono text-xs text-slate-400">
              <RefreshCw className="animate-spin mx-auto mb-2 text-amber-600" size={24} />
              Syncing cities & PIN codes from database API...
            </div>
          ) : filteredCitiesList.length === 0 ? (
            <div className="p-12 text-center font-mono text-xs text-[#667085]">
              <Building2 size={36} className="mx-auto mb-3 text-slate-300" />
              <p className="font-bold text-slate-700">No cities found under current filter</p>
              <p className="text-[11px] text-slate-400 mt-1">Click "Add New City" to store a city and PIN code in database.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F8F9FC] text-[#667085] uppercase tracking-wider font-mono border-b border-[#E4E7EC] font-bold text-[10px]">
                    <th className="p-4 pl-6">ID & City</th>
                    <th className="p-4">Belonging Region / State</th>
                    <th className="p-4">PIN Code (pincode)</th>
                    <th className="p-4">Slug</th>
                    <th className="p-4">Hub Type</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E7EC] font-mono">
                  {filteredCitiesList.map((city) => {
                    const parentRegionName = city.region?.name || regions.find(r => String(r.id) === String(city.region_id))?.name || `Region #${city.region_id || 'N/A'}`;

                    return (
                      <tr key={city.id} className="hover:bg-slate-50/70 transition-colors">
                        
                        {/* ID & CITY */}
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                              {city.image ? (
                                <img src={city.image} alt={city.name} className="w-full h-full object-cover" />
                              ) : (
                                <Building2 className="w-4 h-4 text-slate-500" />
                              )}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 font-sans text-sm block">{city.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">#{city.id}</span>
                            </div>
                          </div>
                        </td>

                        {/* BELONGING REGION / STATE */}
                        <td className="p-4 font-sans">
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-[11px] font-bold border border-slate-200 inline-flex items-center gap-1">
                            <MapPin size={12} className="text-rose-500" />
                            {parentRegionName}
                          </span>
                        </td>

                        {/* PINCODE */}
                        <td className="p-4 font-bold text-amber-900">
                          {city.pincode ? (
                            <span className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 font-mono">
                              <Hash size={11} className="text-amber-600" />
                              {city.pincode}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px] italic font-normal">Not specified</span>
                          )}
                        </td>

                        {/* SLUG */}
                        <td className="p-4">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-bold">
                            {city.slug}
                          </span>
                        </td>

                        {/* HUB TYPE */}
                        <td className="p-4">
                          <button
                            onClick={() => handleToggleFeaturedCity(city)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 ${
                              city.is_featured
                                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            <Star size={12} className={city.is_featured ? 'fill-amber-500 text-amber-500' : 'text-slate-400'} />
                            {city.is_featured ? 'Featured Hub' : 'Standard'}
                          </button>
                        </td>

                        {/* STATUS */}
                        <td className="p-4">
                          <button
                            onClick={() => handleToggleActive(city)}
                            className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase transition-all flex items-center gap-1.5 ${
                              city.is_active 
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${city.is_active ? 'bg-emerald-600' : 'bg-slate-500'}`} />
                            {city.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </td>

                        {/* ACTIONS */}
                        <td className="p-4 pr-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openViewModal(city)}
                              title="View City Specs"
                              className="p-1.5 text-[#667085] hover:text-[#18181B] hover:bg-slate-100 rounded-lg transition"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => openEditModal(city)}
                              title="Edit City & PIN Code"
                              className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition"
                            >
                              <Edit size={15} />
                            </button>
                            <button
                              onClick={() => openDeleteModal(city)}
                              title="Delete City"
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
      )}

      {/* --- TAB 4: AREAS & LOCALITIES TABLE --- */}
      {activeTab === 'areas' && (
        <div className="bg-white border border-[#E4E7EC] rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#E4E7EC] bg-[#F8F9FC]/50 flex justify-between items-center font-mono text-xs">
            <span className="font-bold text-[#18181B]">Areas & Localities Directory ({filteredAreasList.length})</span>
            <span className="text-[11px] text-[#667085]">Loaded dynamically from API</span>
          </div>

          {loadingAreas ? (
            <div className="p-12 text-center font-mono text-xs text-slate-400">
              <RefreshCw className="animate-spin mx-auto mb-2 text-emerald-600" size={24} />
              Syncing areas & localities from database API...
            </div>
          ) : filteredAreasList.length === 0 ? (
            <div className="p-12 text-center font-mono text-xs text-[#667085]">
              <Compass size={36} className="mx-auto mb-3 text-slate-300" />
              <p className="font-bold text-slate-700">No areas found under current filter</p>
              <p className="text-[11px] text-slate-400 mt-1">Click "Add New Area" to add a locality record under a city.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F8F9FC] text-[#667085] uppercase tracking-wider font-mono border-b border-[#E4E7EC] font-bold text-[10px]">
                    <th className="p-4 pl-6">ID & Area Name</th>
                    <th className="p-4">Belonging City</th>
                    <th className="p-4">PIN Code</th>
                    <th className="p-4">Slug</th>
                    <th className="p-4">Sort Order</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E7EC] font-mono">
                  {filteredAreasList.map((areaItem) => {
                    const parentCityName = areaItem.city?.name || cities.find(c => String(c.id) === String(areaItem.city_id))?.name || `City #${areaItem.city_id || 'N/A'}`;

                    return (
                      <tr key={areaItem.id} className="hover:bg-slate-50/70 transition-colors">
                        
                        {/* ID & AREA NAME */}
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center font-bold text-xs shrink-0">
                              <Compass size={15} />
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 font-sans text-sm block">{areaItem.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">#{areaItem.id}</span>
                            </div>
                          </div>
                        </td>

                        {/* BELONGING CITY */}
                        <td className="p-4 font-sans">
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-[11px] font-bold border border-slate-200 inline-flex items-center gap-1">
                            <Building2 size={12} className="text-amber-600" />
                            {parentCityName}
                          </span>
                        </td>

                        {/* PINCODE */}
                        <td className="p-4 font-bold text-emerald-900">
                          {areaItem.pincode ? (
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 font-mono">
                              <Hash size={11} className="text-emerald-600" />
                              {areaItem.pincode}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px] italic font-normal">Not specified</span>
                          )}
                        </td>

                        {/* SLUG */}
                        <td className="p-4">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-bold">
                            {areaItem.slug}
                          </span>
                        </td>

                        {/* SORT ORDER */}
                        <td className="p-4 font-bold text-slate-700">
                          {areaItem.sort_order ?? 1}
                        </td>

                        {/* STATUS */}
                        <td className="p-4">
                          <button
                            onClick={() => handleToggleActive(areaItem)}
                            className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase transition-all flex items-center gap-1.5 ${
                              areaItem.is_active 
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${areaItem.is_active ? 'bg-emerald-600' : 'bg-slate-500'}`} />
                            {areaItem.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </td>

                        {/* ACTIONS */}
                        <td className="p-4 pr-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openViewModal(areaItem)}
                              title="View Area Specs"
                              className="p-1.5 text-[#667085] hover:text-[#18181B] hover:bg-slate-100 rounded-lg transition"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => openEditModal(areaItem)}
                              title="Edit Area"
                              className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition"
                            >
                              <Edit size={15} />
                            </button>
                            <button
                              onClick={() => openDeleteModal(areaItem)}
                              title="Delete Area"
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
      )}

      {/* --- MODAL 1: COUNTRY FORM MODAL (CREATE / EDIT) --- */}
      {(showModal === 'create_country' || showModal === 'edit_country') && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#E4E7EC] shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-[#E4E7EC] bg-[#F8F9FC] flex justify-between items-center font-mono">
              <div className="flex items-center gap-2 text-indigo-600">
                <Globe size={20} />
                <h3 className="font-bold text-base text-[#18181B] font-sans">
                  {showModal === 'create_country' ? 'Add New Country' : `Edit Country (${activeItem?.name})`}
                </h3>
              </div>
              <button onClick={() => setShowModal('none')} className="p-1 text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCountry} className="p-6 space-y-4 font-mono text-xs">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Country Name *</label>
                <input
                  type="text"
                  placeholder="e.g. India, United Arab Emirates"
                  value={countryForm.name}
                  onChange={(e) => handleNameChange(e.target.value, 'country')}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-sans"
                  required
                />
                {formErrors.name && <span className="text-rose-600 text-[11px]">{formErrors.name}</span>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">ISO2 Code</label>
                  <input
                    type="text"
                    placeholder="e.g. IN"
                    maxLength={2}
                    value={countryForm.iso2}
                    onChange={(e) => setCountryForm(prev => ({ ...prev, iso2: e.target.value }))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-sans uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">ISO3 Code</label>
                  <input
                    type="text"
                    placeholder="e.g. IND"
                    maxLength={3}
                    value={countryForm.iso3}
                    onChange={(e) => setCountryForm(prev => ({ ...prev, iso3: e.target.value }))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-sans uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Phone Code</label>
                  <input
                    type="text"
                    placeholder="e.g. +91"
                    value={countryForm.phone_code}
                    onChange={(e) => setCountryForm(prev => ({ ...prev, phone_code: e.target.value }))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-sans"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Sort Order</label>
                  <input
                    type="number"
                    value={countryForm.sort_order}
                    onChange={(e) => setCountryForm(prev => ({ ...prev, sort_order: Number(e.target.value) }))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-sans"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between font-sans">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={countryForm.is_active}
                    onChange={(e) => setCountryForm(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 h-4 w-4"
                  />
                  <span className="text-xs font-bold text-slate-700">Active Status</span>
                </label>
              </div>

              <div className="pt-4 border-t border-[#E4E7EC] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal('none')}
                  className="px-4 py-2.5 border rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition flex items-center gap-1.5"
                >
                  {isSubmitting ? <span>Saving...</span> : <><Check size={15} /><span>Save Country</span></>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: REGION FORM MODAL (CREATE / EDIT) --- */}
      {(showModal === 'create_region' || showModal === 'edit_region') && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#E4E7EC] shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-[#E4E7EC] bg-[#F8F9FC] flex justify-between items-center font-mono">
              <div className="flex items-center gap-2 text-rose-600">
                <Map size={20} />
                <h3 className="font-bold text-base text-[#18181B] font-sans">
                  {showModal === 'create_region' ? 'Add New State / Region' : `Edit Region (${activeItem?.name})`}
                </h3>
              </div>
              <button onClick={() => setShowModal('none')} className="p-1 text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveRegion} className="p-6 space-y-4 font-mono text-xs">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Belonging Country *</label>
                <select
                  value={regionForm.country_id}
                  onChange={(e) => setRegionForm(prev => ({ ...prev, country_id: e.target.value }))}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-sans"
                  required
                >
                  <option value="">Select Country</option>
                  {countries.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {formErrors.country_id && <span className="text-rose-600 text-[11px]">{formErrors.country_id}</span>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">State / Region Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Maharashtra, Delhi NCR, California"
                  value={regionForm.name}
                  onChange={(e) => handleNameChange(e.target.value, 'region')}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-sans"
                  required
                />
                {formErrors.name && <span className="text-rose-600 text-[11px]">{formErrors.name}</span>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Region Code</label>
                  <input
                    type="text"
                    placeholder="e.g. MH, DL"
                    value={regionForm.code}
                    onChange={(e) => setRegionForm(prev => ({ ...prev, code: e.target.value }))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-sans uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Sort Order</label>
                  <input
                    type="number"
                    value={regionForm.sort_order}
                    onChange={(e) => setRegionForm(prev => ({ ...prev, sort_order: Number(e.target.value) }))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-sans"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between font-sans">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={regionForm.is_active}
                    onChange={(e) => setRegionForm(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 h-4 w-4"
                  />
                  <span className="text-xs font-bold text-slate-700">Active Status</span>
                </label>
              </div>

              <div className="pt-4 border-t border-[#E4E7EC] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal('none')}
                  className="px-4 py-2.5 border rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition flex items-center gap-1.5"
                >
                  {isSubmitting ? <span>Saving...</span> : <><Check size={15} /><span>Save Region</span></>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: CITY FORM MODAL (CREATE / EDIT WITH PINCODE) --- */}
      {(showModal === 'create_city' || showModal === 'edit_city') && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#E4E7EC] shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-[#E4E7EC] bg-[#F8F9FC] flex justify-between items-center font-mono">
              <div className="flex items-center gap-2 text-rose-600">
                <Building2 size={20} />
                <h3 className="font-bold text-base text-[#18181B] font-sans">
                  {showModal === 'create_city' ? 'Add New City' : `Edit City (${activeItem?.name})`}
                </h3>
              </div>
              <button onClick={() => setShowModal('none')} className="p-1 text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCity} className="p-6 space-y-4 font-mono text-xs">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Belonging Region / State *</label>
                <select
                  value={cityForm.region_id}
                  onChange={(e) => setCityForm(prev => ({ ...prev, region_id: e.target.value }))}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-sans"
                  required
                >
                  <option value="">Select State / Region</option>
                  {regions.map(r => (
                    <option key={r.id} value={r.id}>{r.name} ({r.country?.name || 'Region'})</option>
                  ))}
                </select>
                {formErrors.region_id && <span className="text-rose-600 text-[11px]">{formErrors.region_id}</span>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">City Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai, Delhi, Bangalore, Pune"
                  value={cityForm.name}
                  onChange={(e) => handleNameChange(e.target.value, 'city')}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-sans"
                  required
                />
                {formErrors.name && <span className="text-rose-600 text-[11px]">{formErrors.name}</span>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1">
                    <Hash size={12} className="text-amber-600" />
                    PIN Code (pincode)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 400001"
                    value={cityForm.pincode}
                    onChange={(e) => setCityForm(prev => ({ ...prev, pincode: e.target.value }))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-sans font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">City Slug</label>
                  <input
                    type="text"
                    placeholder="e.g. mumbai"
                    value={cityForm.slug}
                    onChange={(e) => setCityForm(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-sans"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">City Thumbnail Image URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={cityForm.image}
                  onChange={(e) => setCityForm(prev => ({ ...prev, image: e.target.value }))}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-sans"
                />
              </div>

              <div className="pt-2 flex items-center justify-between font-sans">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cityForm.is_featured}
                    onChange={(e) => setCityForm(prev => ({ ...prev, is_featured: e.target.checked }))}
                    className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 h-4 w-4"
                  />
                  <span className="text-xs font-bold text-slate-700">Mark as Featured Hub</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cityForm.is_active}
                    onChange={(e) => setCityForm(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span className="text-xs font-bold text-slate-700">Active Status</span>
                </label>
              </div>

              <div className="pt-4 border-t border-[#E4E7EC] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal('none')}
                  className="px-4 py-2.5 border rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition flex items-center gap-1.5"
                >
                  {isSubmitting ? <span>Saving...</span> : <><Check size={15} /><span>Save City</span></>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 4: AREA FORM MODAL (CREATE / EDIT) --- */}
      {(showModal === 'create_area' || showModal === 'edit_area') && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#E4E7EC] shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-[#E4E7EC] bg-[#F8F9FC] flex justify-between items-center font-mono">
              <div className="flex items-center gap-2 text-emerald-600">
                <Compass size={20} />
                <h3 className="font-bold text-base text-[#18181B] font-sans">
                  {showModal === 'create_area' ? 'Add New Area / Locality' : `Edit Area (${activeItem?.name})`}
                </h3>
              </div>
              <button onClick={() => setShowModal('none')} className="p-1 text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveArea} className="p-6 space-y-4 font-mono text-xs">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Belonging City *</label>
                <select
                  value={areaForm.city_id}
                  onChange={(e) => setAreaForm(prev => ({ ...prev, city_id: e.target.value }))}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-sans"
                  required
                >
                  <option value="">Select City</option>
                  {cities.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.region?.name || 'City'})</option>
                  ))}
                </select>
                {formErrors.city_id && <span className="text-rose-600 text-[11px]">{formErrors.city_id}</span>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Area / Locality Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Bandra, Connaught Place, Aerocity, Indiranagar"
                  value={areaForm.name}
                  onChange={(e) => handleNameChange(e.target.value, 'area')}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-sans"
                  required
                />
                {formErrors.name && <span className="text-rose-600 text-[11px]">{formErrors.name}</span>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1">
                    <Hash size={12} className="text-emerald-600" />
                    PIN Code (pincode)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 110001"
                    value={areaForm.pincode}
                    onChange={(e) => setAreaForm(prev => ({ ...prev, pincode: e.target.value }))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-sans font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Area Slug</label>
                  <input
                    type="text"
                    placeholder="e.g. bandra"
                    value={areaForm.slug}
                    onChange={(e) => setAreaForm(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-sans"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Sort Order</label>
                <input
                  type="number"
                  value={areaForm.sort_order}
                  onChange={(e) => setAreaForm(prev => ({ ...prev, sort_order: Number(e.target.value) }))}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-sans"
                />
              </div>

              <div className="pt-2 flex items-center justify-between font-sans">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={areaForm.is_active}
                    onChange={(e) => setAreaForm(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span className="text-xs font-bold text-slate-700">Active Status</span>
                </label>
              </div>

              <div className="pt-4 border-t border-[#E4E7EC] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal('none')}
                  className="px-4 py-2.5 border rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition flex items-center gap-1.5"
                >
                  {isSubmitting ? <span>Saving...</span> : <><Check size={15} /><span>Save Area</span></>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 5: DELETE CONFIRMATION MODAL --- */}
      {showModal === 'delete_item' && activeItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 font-mono text-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#E4E7EC] shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-2.5 text-rose-600 border-b pb-3">
              <AlertCircle size={22} className="shrink-0" />
              <h4 className="font-bold text-base text-[#18181B] font-sans">Delete Confirmation</h4>
            </div>

            <p className="text-slate-600 font-sans leading-relaxed text-sm">
              Are you sure you want to delete <strong className="text-slate-900">"{activeItem.name}"</strong>?
            </p>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowModal('none')}
                className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeleteItem}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm"
              >
                {isSubmitting ? <span>Deleting...</span> : <><Trash2 size={15} /><span>Confirm Delete</span></>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 6: VIEW ITEM DETAILS MODAL --- */}
      {showModal === 'view_item' && activeItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 font-mono text-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#E4E7EC] shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base text-slate-900 font-sans">{activeItem.name} Details</h3>
              <button onClick={() => setShowModal('none')} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 font-sans">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><strong>ID:</strong> #{activeItem.id}</div>
                <div><strong>UUID:</strong> {activeItem.uuid || 'N/A'}</div>
                <div><strong>Name:</strong> {activeItem.name}</div>
                <div><strong>Slug:</strong> {activeItem.slug}</div>
                {activeItem.iso2 && <div><strong>ISO2:</strong> {activeItem.iso2}</div>}
                {activeItem.iso3 && <div><strong>ISO3:</strong> {activeItem.iso3}</div>}
                {activeItem.code && <div><strong>Code:</strong> {activeItem.code}</div>}
                {activeItem.phone_code && <div><strong>Phone Code:</strong> {activeItem.phone_code}</div>}
                {activeItem.pincode && <div><strong>PIN Code:</strong> {activeItem.pincode}</div>}
                {activeItem.city?.name && <div><strong>Belonging City:</strong> {activeItem.city.name}</div>}
                <div><strong>Status:</strong> {activeItem.is_active ? 'Active' : 'Inactive'}</div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t font-mono">
              <button onClick={() => setShowModal('none')} className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
