import React, { useState, useEffect } from 'react';
import { useRouter } from '../../context/RouterContext';
import { CategoriesService } from '../../services/categories.service';
import { LocationsService } from '../../services/locations.service';
import { mockFilterConfig } from '../../data/mock-filters';
import { AdsService } from '../../services/ads.service';
import { UsersService } from '../../services/users.service';
import { AdAttributes } from '../../types/ad';
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Upload, 
  Trash2, 
  AlertCircle, 
  ShieldCheck, 
  Info, 
  Star
} from 'lucide-react';

export const PostAdWizard: React.FC = () => {
  const { navigateTo } = useRouter();
  
  // Wizard steps matching image design
  const steps = [
    { num: 1, name: 'Category' },
    { num: 2, name: 'Location' },
    { num: 3, name: 'Content' },
    { num: 4, name: 'Attributes' },
    { num: 5, name: 'Services' },
    { num: 6, name: 'Place' },
    { num: 7, name: 'Contact' },
    { num: 8, name: 'Images' },
    { num: 9, name: 'Preview' },
    { num: 10, name: 'Submit' }
  ];

  const [currentStep, setCurrentStep] = useState(1);
  const [draftBannerVisible, setDraftBannerVisible] = useState(false);

  // Form Fields State
  const [category, setCategory] = useState('');
  const [country, setCountry] = useState('India');
  const [state, setState] = useState('Delhi NCR');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // Attributes
  const [nationality, setNationality] = useState('Indian');
  const [ethnicity, setEthnicity] = useState('Asian');
  const [bodyType, setBodyType] = useState('Slim');
  const [hairColor, setHairColor] = useState('Black');
  const [intendedAudience, setIntendedAudience] = useState('Everyone (18+)');
  
  // Multi-select lists
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedPlaces, setSelectedPlaces] = useState<string[]>([]);
  
  // Contact info
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');

  // Image Upload State
  const [images, setImages] = useState<string[]>([]);
  const [coverImageIdx, setCoverImageIdx] = useState(0);

  // Status/Validation states
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // API Location State
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [countriesList, setCountriesList] = useState<any[]>([]);
  const [regionsList, setRegionsList] = useState<any[]>([]);
  const [citiesList, setCitiesList] = useState<any[]>([]);
  const [areasList, setAreasList] = useState<any[]>([]);

  // Selected Location Object IDs
  const [selectedCountryId, setSelectedCountryId] = useState<string | number>('');
  const [selectedRegionId, setSelectedRegionId] = useState<string | number>('');
  const [selectedCityId, setSelectedCityId] = useState<string | number>('');
  const [selectedAreaId, setSelectedAreaId] = useState<string | number>('');

  // 1. Fetch Categories & Countries on Mount (GET /locations/countries)
  useEffect(() => {
    CategoriesService.getAll().then((data) => {
      if (data && data.length > 0) {
        setCategoriesList(data);
        setCategory(prev => prev || data[0].slug);
      }
    }).catch(() => {});

    LocationsService.getCountries().then((data) => {
      setCountriesList(data);
      if (data && data.length > 0) {
        const defaultCountry = data[0];
        setSelectedCountryId(defaultCountry.id);
        setCountry(defaultCountry.name);
      }
    }).catch(() => {});
  }, []);

  // 2. Cascade Country -> Regions (GET /locations/regions?country_id=...)
  useEffect(() => {
    if (selectedCountryId) {
      LocationsService.getStatesByCountry(selectedCountryId).then((data) => {
        setRegionsList(data);
        if (data && data.length > 0) {
          const defaultReg = data[0];
          setSelectedRegionId(defaultReg.id);
          setState(defaultReg.name);
        } else {
          setSelectedRegionId('');
          setState('');
        }
      }).catch(() => setRegionsList([]));
    }
  }, [selectedCountryId]);

  // 3. Cascade Region -> Cities (GET /locations/cities?region_id=...)
  useEffect(() => {
    LocationsService.getCities(selectedRegionId || undefined).then((data) => {
      setCitiesList(data);
      if (data && data.length > 0) {
        const match = data.find(c => c.slug === city || String(c.id) === String(selectedCityId)) || data[0];
        setSelectedCityId(match.id);
        setCity(match.slug || match.name);
      } else {
        setSelectedCityId('');
        setCity('');
      }
    }).catch(() => setCitiesList([]));
  }, [selectedRegionId]);

  // 4. Cascade City -> Areas (GET /locations/areas?city_id=...)
  useEffect(() => {
    if (selectedCityId) {
      LocationsService.getAreasByCity(selectedCityId).then((data) => {
        setAreasList(data);
        if (data && data.length > 0) {
          const match = data.find(a => a.name === area || String(a.id) === String(selectedAreaId)) || data[0];
          setSelectedAreaId(match.id);
          setArea(match.name);
        } else {
          setSelectedAreaId('');
          setArea('');
        }
      }).catch(() => setAreasList([]));
    } else {
      setAreasList([]);
    }
  }, [selectedCityId]);

  // Check for stored draft on component load
  useEffect(() => {
    const draft = UsersService.getDraftAd();
    if (draft) {
      setDraftBannerVisible(true);
    }
  }, []);

  // Local autosave whenever fields change
  useEffect(() => {
    if (category || title || description) {
      const draftPayload = {
        category, country, state, city, area, title, description,
        nationality, ethnicity, bodyType, hairColor, intendedAudience,
        selectedServices, selectedPlaces, phone, whatsapp, email, images, coverImageIdx, currentStep
      };
      UsersService.saveDraftAd(draftPayload);
    }
  }, [
    category, country, state, city, area, title, description,
    nationality, ethnicity, bodyType, hairColor, intendedAudience,
    selectedServices, selectedPlaces, phone, whatsapp, email, images, coverImageIdx, currentStep
  ]);

  const handleRestoreDraft = () => {
    const draft = UsersService.getDraftAd();
    if (draft) {
      setCategory(draft.category || 'call-girls');
      setCountry(draft.country || 'India');
      setState(draft.state || 'Delhi NCR');
      setCity(draft.city || 'delhi');
      setArea(draft.area || '');
      setTitle(draft.title || '');
      setDescription(draft.description || '');
      setNationality(draft.nationality || 'Indian');
      setEthnicity(draft.ethnicity || 'Asian');
      setBodyType(draft.bodyType || 'Slim');
      setHairColor(draft.hairColor || 'Black');
      setIntendedAudience(draft.intendedAudience || 'Everyone (18+)');
      setSelectedServices(draft.selectedServices || []);
      setSelectedPlaces(draft.selectedPlaces || []);
      setPhone(draft.phone || '');
      setWhatsapp(draft.whatsapp || '');
      setEmail(draft.email || '');
      setImages(draft.images || []);
      setCoverImageIdx(draft.coverImageIdx || 0);
      setCurrentStep(draft.currentStep || 1);
    }
    setDraftBannerVisible(false);
  };

  const handleDiscardDraft = () => {
    UsersService.clearDraftAd();
    setDraftBannerVisible(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const fileList: File[] = Array.from(e.target.files);
    fileList.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImages((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDeleteImage = (index: number) => {
    setImages(images.filter((_, idx) => idx !== index));
    if (coverImageIdx === index) {
      setCoverImageIdx(0);
    }
  };

  const handleNextStep = () => {
    setValidationError('');
    
    if (currentStep === 1 && !category) {
      setValidationError('Please select a category.');
      return;
    }
    if (currentStep === 2 && !city) {
      setValidationError('Please select a city hub.');
      return;
    }
    if (currentStep === 3) {
      if (!title.trim() || title.length < 5) {
        setValidationError('Please write a descriptive title heading (min 5 characters).');
        return;
      }
      if (!description.trim() || description.length < 20) {
        setValidationError('Please enter a bio description (min 20 characters).');
        return;
      }
    }
    if (currentStep === 7 && (!phone.trim() || phone.length < 8)) {
      setValidationError('Please provide a valid contact phone number.');
      return;
    }

    if (currentStep < 10) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    setValidationError('');
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmitAd = async () => {
    setIsSubmitting(true);
    
    const selectedCityObj = citiesList.find((c) => c.slug === city || c.id === city);
    const selectedAreaObj = areasList.find((a) => a.slug === area || a.id === area);
    const selectedCategoryObj = categoriesList.find((cat) => cat.slug === category);

    const adAttributes: AdAttributes = {
      nationality,
      ethnicity,
      bodyType,
      hairColor,
      intendedAudience,
      placeOfService: selectedPlaces
    };

    const finalAdPayload: any = {
      title,
      description,
      category_id: selectedCategoryObj?.id || 1,
      city_id: selectedCityObj?.id || 1,
      area_id: selectedAreaObj?.id || null,
      price: 1500,
      contact: {
        phone,
        whatsapp: whatsapp || phone,
        email: email || 'contact@example.com'
      },
      attributes: adAttributes,
      services: selectedServices,
      images,
    };

    try {
      await AdsService.createAd(finalAdPayload);
      UsersService.clearDraftAd();
      
      setIsSubmitting(false);
      navigateTo('/dashboard', { tab: 'ads' });
    } catch (err: any) {
      console.error(err);
      setValidationError(err?.response?.data?.message || 'Failed to save advertisement. Please check form input.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center font-sans">
      <div className="w-full max-w-5xl">
        
        {/* Draft Restore Alert */}
        {draftBannerVisible && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 animate-in fade-in duration-300">
            <div className="flex items-center gap-2.5">
              <Info className="w-5 h-5 text-amber-600 shrink-0" />
              <div className="text-xs font-medium">
                <span className="font-bold">Unsaved draft detected!</span> Would you like to restore your previous publication details?
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleRestoreDraft}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                Restore Draft
              </button>
              <button
                type="button"
                onClick={handleDiscardDraft}
                className="px-3.5 py-1.5 bg-white border border-amber-200 text-amber-800 hover:bg-amber-100/50 rounded-xl text-xs font-semibold transition"
              >
                Discard
              </button>
            </div>
          </div>
        )}

        {/* Outer Card Container matching reference image */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[620px]">
          
          {/* Left Dark Navy Sidebar */}
          <div className="w-full md:w-72 shrink-0 bg-[#0B132B] text-white p-7 sm:p-8 flex flex-col justify-between select-none">
            <div>
              {/* Sidebar Header */}
              <div className="text-[11px] font-bold tracking-widest uppercase text-[#E2A829] font-mono mb-1">
                AD PUBLISHER
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight pb-5 border-b border-slate-800/80 mb-6">
                Creation Wizard
              </h1>

              {/* Step Navigation List */}
              <nav className="space-y-4">
                {steps.map((step) => {
                  const isActive = currentStep === step.num;
                  const isCompleted = currentStep > step.num;

                  return (
                    <button
                      key={step.num}
                      type="button"
                      onClick={() => {
                        if (isCompleted || step.num < currentStep) {
                          setCurrentStep(step.num);
                        }
                      }}
                      className={`w-full flex items-center gap-3.5 text-left transition-all ${
                        isActive 
                          ? 'opacity-100' 
                          : isCompleted 
                          ? 'opacity-90 hover:opacity-100' 
                          : 'opacity-50 cursor-not-allowed'
                      }`}
                    >
                      {/* Step Circle Badge */}
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                        isActive 
                          ? 'bg-[#5046E5] text-white ring-4 ring-indigo-500/20 shadow-sm' 
                          : isCompleted 
                          ? 'bg-emerald-500 text-white' 
                          : 'border border-slate-700/80 bg-slate-800/30 text-slate-400'
                      }`}>
                        {isCompleted ? <Check className="w-3.5 h-3.5" /> : step.num}
                      </div>

                      {/* Step Name */}
                      <span className={`text-sm sm:text-base font-semibold tracking-wide ${
                        isActive 
                          ? 'text-white font-bold' 
                          : isCompleted 
                          ? 'text-slate-200' 
                          : 'text-slate-400'
                      }`}>
                        {step.name}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-6 border-t border-slate-800/60 mt-8 hidden md:block">
              <button
                type="button"
                onClick={() => navigateTo('/dashboard')}
                className="text-xs font-medium text-slate-400 hover:text-white transition flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" /> Exit Wizard
              </button>
            </div>
          </div>

          {/* Right Main Content Area */}
          <div className="flex-1 bg-white p-7 sm:p-10 flex flex-col justify-between">
            <div>
              
              {/* Validation alert banner */}
              {validationError && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold flex items-center gap-2 animate-pulse">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* STEP 1: CATEGORY SELECTION (MATCHING IMAGE 1 EXACTLY) */}
              {currentStep === 1 && (
                <div>
                  <h2 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight mb-2">
                    What classified category is your listing?
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed mb-8">
                    Select the primary service sector. This determines available filter attributes later.
                  </p>

                  {/* 2-Column Category Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {categoriesList.map((catItem) => {
                      const isSelected = category === catItem.slug;
                      return (
                        <div
                          key={catItem.id || catItem.slug}
                          onClick={() => setCategory(catItem.slug)}
                          className={`group border rounded-2xl p-5 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                            isSelected 
                              ? 'border-[#5046E5] bg-white ring-1 ring-[#5046E5] shadow-sm' 
                              : 'border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-sm'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2.5 mb-2">
                              {/* Circle Bullet Icon */}
                              <div className={`w-3 h-3 rounded-full shrink-0 transition-all ${
                                isSelected 
                                  ? 'bg-[#5046E5] ring-4 ring-indigo-50' 
                                  : 'bg-slate-300 group-hover:bg-slate-400'
                              }`} />
                              
                              <h3 className="text-slate-900 font-bold text-base sm:text-lg tracking-tight">
                                {catItem.name}
                              </h3>
                            </div>

                            <p className="text-slate-400 text-xs leading-relaxed pl-5 font-normal">
                              {catItem.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 2: LOCATION (USING GET /locations/countries, /regions, /cities, /areas) */}
              {currentStep === 2 && (
                <div>
                  <h2 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight mb-2">
                    Where is your listing located?
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed mb-8">
                    Select the country, state/region, primary city hub, and local area for your publication.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl">
                    {/* Country Selector (GET /locations/countries) */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Country</label>
                      <select
                        value={selectedCountryId}
                        onChange={(e) => {
                          const cId = e.target.value;
                          setSelectedCountryId(cId);
                          const matchedCountry = countriesList.find(c => String(c.id) === String(cId));
                          if (matchedCountry) setCountry(matchedCountry.name);
                        }}
                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-500 transition font-medium"
                      >
                        {countriesList.length > 0 ? (
                          countriesList.map((c) => (
                            <option key={c.id || c.code} value={c.id}>
                              {c.name} ({c.code || c.slug})
                            </option>
                          ))
                        ) : (
                          <option value="">India</option>
                        )}
                      </select>
                    </div>

                    {/* State / Region Selector (GET /locations/regions?country_id=...) */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">State / Region</label>
                      <select
                        value={selectedRegionId}
                        onChange={(e) => {
                          const rId = e.target.value;
                          setSelectedRegionId(rId);
                          const matchedRegion = regionsList.find(r => String(r.id) === String(rId));
                          if (matchedRegion) setState(matchedRegion.name);
                        }}
                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-500 transition font-medium"
                      >
                        {regionsList.length > 0 ? (
                          regionsList.map((r) => (
                            <option key={r.id || r.code} value={r.id}>
                              {r.name}
                            </option>
                          ))
                        ) : (
                          <option value="">All States / Regions</option>
                        )}
                      </select>
                    </div>

                    {/* Primary City Hub Selector (GET /locations/cities?region_id=...) */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Primary City Hub</label>
                      <select
                        value={selectedCityId}
                        onChange={(e) => {
                          const cId = e.target.value;
                          setSelectedCityId(cId);
                          const matchedCity = citiesList.find(c => String(c.id) === String(cId));
                          if (matchedCity) setCity(matchedCity.slug || matchedCity.name);
                        }}
                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-500 transition font-medium"
                      >
                        {citiesList.length > 0 ? (
                          citiesList.map((c) => (
                            <option key={c.id || c.slug} value={c.id}>
                              {c.name} {c.pincode ? `(${c.pincode})` : ''}
                            </option>
                          ))
                        ) : (
                          <option value="">No Cities Available</option>
                        )}
                      </select>
                    </div>

                    {/* Specific Locality / Area Selector (GET /locations/areas?city_id=...) */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Specific Locality / Area</label>
                      {areasList.length > 0 ? (
                        <select
                          value={selectedAreaId}
                          onChange={(e) => {
                            const aId = e.target.value;
                            setSelectedAreaId(aId);
                            const matchedArea = areasList.find(a => String(a.id) === String(aId));
                            if (matchedArea) setArea(matchedArea.name);
                          }}
                          className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-500 transition font-medium"
                        >
                          {areasList.map((a) => (
                            <option key={a.id || a.slug} value={a.id}>
                              {a.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          placeholder="e.g. Connaught Place, Aerocity, Bandra"
                          value={area}
                          onChange={(e) => setArea(e.target.value)}
                          className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-500 transition"
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: CONTENT */}
              {currentStep === 3 && (
                <div>
                  <h2 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight mb-2">
                    Advertisement Title & Bio Description
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">
                    Write a descriptive, non-provocative, highly elegant introduction for your profile.
                  </p>
                  
                  <div className="space-y-5 max-w-2xl">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Title Heading</label>
                      <input 
                        type="text"
                        placeholder="e.g. Elegant social dinner companion - high class discretion"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-500 transition"
                      />
                      <span className="text-[11px] text-slate-400">Min 5 characters. Keep titles clean and descriptive.</span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Biography / Description</label>
                      <textarea 
                        rows={6}
                        placeholder="Introduce yourself, specify your service philosophy, communication languages, and other premium guidelines..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-500 transition"
                      />
                      <span className="text-[11px] text-slate-400">Min 20 characters. Explicit descriptions or solicitations are strictly prohibited.</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: ATTRIBUTES */}
              {currentStep === 4 && (
                <div>
                  <h2 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight mb-2">
                    Profile Specifications
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">
                    Declare profile attributes so users can discover you via faceted searches.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Nationality</label>
                      <select
                        value={nationality}
                        onChange={(e) => setNationality(e.target.value)}
                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-none focus:bg-white transition"
                      >
                        {mockFilterConfig.nationalities.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Ethnicity</label>
                      <select
                        value={ethnicity}
                        onChange={(e) => setEthnicity(e.target.value)}
                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-none focus:bg-white transition"
                      >
                        {mockFilterConfig.ethnicities.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Body Build</label>
                      <select
                        value={bodyType}
                        onChange={(e) => setBodyType(e.target.value)}
                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-none focus:bg-white transition"
                      >
                        {mockFilterConfig.bodyTypes.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Hair Color</label>
                      <select
                        value={hairColor}
                        onChange={(e) => setHairColor(e.target.value)}
                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-none focus:bg-white transition"
                      >
                        {mockFilterConfig.hairColors.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Intended Target Audience</label>
                      <select
                        value={intendedAudience}
                        onChange={(e) => setIntendedAudience(e.target.value)}
                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-none focus:bg-white transition"
                      >
                        {mockFilterConfig.intendedAudiences.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: SERVICES */}
              {currentStep === 5 && (
                <div>
                  <h2 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight mb-2">
                    What services do you provide?
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">
                    Select options representing your independent scheduling profile.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-2">
                    {mockFilterConfig.services.map((svc) => (
                      <label
                        key={svc.value}
                        className={`p-3.5 border rounded-2xl flex items-center gap-3 cursor-pointer transition ${
                          selectedServices.includes(svc.value)
                            ? 'bg-indigo-50/40 border-[#5046E5] text-indigo-900'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedServices.includes(svc.value)}
                          onChange={() => {
                            if (selectedServices.includes(svc.value)) {
                              setSelectedServices(selectedServices.filter((s) => s !== svc.value));
                            } else {
                              setSelectedServices([...selectedServices, svc.value]);
                            }
                          }}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 shrink-0"
                        />
                        <span className="text-xs font-bold">{svc.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 6: PLACE */}
              {currentStep === 6 && (
                <div>
                  <h2 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight mb-2">
                    Place of Booking / Service Location
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">
                    Where do bookings take place? (Select multiple)
                  </p>
                  
                  <div className="space-y-3 max-w-xl">
                    {mockFilterConfig.placesOfService.map((pl) => (
                      <label
                        key={pl.value}
                        className={`p-4 border rounded-2xl flex items-center gap-3.5 cursor-pointer transition ${
                          selectedPlaces.includes(pl.value)
                            ? 'bg-indigo-50/40 border-[#5046E5]'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedPlaces.includes(pl.value)}
                          onChange={() => {
                            if (selectedPlaces.includes(pl.value)) {
                              setSelectedPlaces(selectedPlaces.filter((p) => p !== pl.value));
                            } else {
                              setSelectedPlaces([...selectedPlaces, pl.value]);
                            }
                          }}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4.5 w-4.5"
                        />
                        <div>
                          <span className="text-sm font-bold text-slate-900 block">{pl.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 7: CONTACT */}
              {currentStep === 7 && (
                <div>
                  <h2 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight mb-2">
                    Direct Contact Details
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">
                    Enter contact credentials to appear on your active profile listing.
                  </p>
                  
                  <div className="space-y-4 max-w-xl">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Mobile Phone Call Number</label>
                      <input 
                        type="text"
                        placeholder="e.g. +91 99999 00121"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-500 transition"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">WhatsApp Country Code & Phone</label>
                      <input 
                        type="text"
                        placeholder="e.g. 919999900121"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-500 transition"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Private Email (Optional)</label>
                      <input 
                        type="email"
                        placeholder="e.g. contact@auraclassifieds-mock.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-500 transition"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 8: IMAGES */}
              {currentStep === 8 && (
                <div>
                  <h2 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight mb-2">
                    Upload Gallery Photos
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">
                    Upload portraits or lifestyle photos. Specify which photo serves as your cover image.
                  </p>
                  
                  <input
                    type="file"
                    id="wizard-file-input"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div 
                    onClick={() => document.getElementById('wizard-file-input')?.click()}
                    className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center bg-slate-50 hover:bg-slate-100/60 cursor-pointer transition flex flex-col items-center justify-center gap-2.5 max-w-xl"
                  >
                    <div className="p-3 bg-white border border-slate-200/60 rounded-full text-slate-400 shadow-sm">
                      <Upload className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">Drag and drop images here or click to browse</p>
                      <p className="text-xs text-slate-400 mt-0.5">Accepts PNG, JPG. Maximum 5MB each.</p>
                    </div>
                  </div>

                  {images.length > 0 && (
                    <div className="space-y-2 pt-4">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Uploaded Files ({images.length})</span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
                        {images.map((img, idx) => (
                          <div key={img + idx} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 relative group h-28">
                            <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            
                            <div className="absolute top-2 right-2 flex gap-1">
                              <button
                                type="button"
                                onClick={() => handleDeleteImage(idx)}
                                className="p-1.5 bg-white/90 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-500 transition shadow-sm"
                                title="Delete image"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => setCoverImageIdx(idx)}
                              className={`absolute bottom-2 left-2 flex items-center gap-1 py-1 px-2 rounded-lg text-[9px] font-bold uppercase transition ${
                                coverImageIdx === idx 
                                  ? 'bg-amber-400 text-slate-950 shadow-sm' 
                                  : 'bg-black/40 text-slate-200 hover:bg-black/60 backdrop-blur-sm'
                              }`}
                            >
                              <Star className={`w-3 h-3 ${coverImageIdx === idx ? 'fill-current' : ''}`} />
                              <span>{coverImageIdx === idx ? 'Cover' : 'Make Cover'}</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 9: PREVIEW */}
              {currentStep === 9 && (
                <div>
                  <h2 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight mb-2">
                    Preview Advertisement Draft
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">
                    Verify your listing details before publishing.
                  </p>
                  
                  <div className="border border-slate-200 rounded-2xl bg-slate-50/50 p-5 space-y-4 max-w-2xl">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="w-32 h-32 bg-white border border-slate-200 rounded-xl overflow-hidden shrink-0">
                        <img src={images[coverImageIdx] || images[0]} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase rounded-md tracking-wider">
                          Draft Preview
                        </div>
                        <h3 className="font-bold text-slate-900 text-lg leading-snug">{title || 'Untitled Advertisement'}</h3>
                        <div className="text-xs text-slate-500 flex items-center gap-2">
                          <span className="capitalize">{city} Area: {area || 'Not specified'}</span>
                          <span>&bull;</span>
                          <span className="capitalize font-semibold text-indigo-600">{category}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-200/80 pt-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider mb-1.5">Biography Description</h4>
                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-white p-3 rounded-xl border border-slate-200/70">
                        {description || 'No description provided.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 10: SUBMIT */}
              {currentStep === 10 && (
                <div className="text-center py-6 max-w-xl mx-auto space-y-4">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-100 shadow-sm">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    Ready for moderator review
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    By submitting your classified advertisement, you certify that all details represent consenting adult companions and agree to our Terms of Use.
                  </p>
                </div>
              )}

            </div>

            {/* Bottom Actions Row (Matching Image 1 Pill Button) */}
            <div className="border-t border-slate-100 pt-6 mt-8 flex items-center justify-between">
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous Step</span>
                  </button>
                )}
              </div>

              <div>
                {currentStep < 10 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="bg-[#0B132B] hover:bg-[#152042] text-white font-bold text-sm px-7 py-3 rounded-2xl flex items-center gap-2 shadow-md transition-all active:scale-[0.98]"
                  >
                    <span>Continue</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitAd}
                    disabled={isSubmitting}
                    className="bg-[#5046E5] hover:bg-indigo-700 text-white font-bold text-sm px-8 py-3 rounded-2xl flex items-center gap-2 shadow-md transition-all active:scale-[0.98]"
                  >
                    {isSubmitting ? (
                      <span>Publishing listing...</span>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Submit Advertisement</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
