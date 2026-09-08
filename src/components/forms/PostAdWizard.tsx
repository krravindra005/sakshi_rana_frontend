import React, { useState, useEffect } from 'react';
import { useRouter } from '../../context/RouterContext';
import { CategoriesService } from '../../services/categories.service';
import { LocationsService } from '../../services/locations.service';
import { mockFilterConfig } from '../../data/mock-filters';
import { AdsService } from '../../services/ads.service';
import { UsersService } from '../../services/users.service';
import { Ad, AdAttributes } from '../../types/ad';
import { 
  ChevronRight, 
  ChevronLeft, 
  Save, 
  Check, 
  Upload, 
  Trash2, 
  AlertCircle, 
  ShieldCheck, 
  Info, 
  Sparkles,
  Camera,
  Star
} from 'lucide-react';

export const PostAdWizard: React.FC = () => {
  const { navigateTo } = useRouter();
  
  // Wizard steps
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
  const [city, setCity] = useState('delhi');
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
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'
  ]);
  const [coverImageIdx, setCoverImageIdx] = useState(0);

  // Status/Validation states
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // API State
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [citiesList, setCitiesList] = useState<any[]>([]);
  const [areasList, setAreasList] = useState<any[]>([]);

  useEffect(() => {
    CategoriesService.getAll().then((data) => {
      setCategoriesList(data);
      if (data.length > 0 && !category) {
        setCategory(data[0].slug);
      }
    }).catch(() => {});

    LocationsService.getCities().then((data) => {
      setCitiesList(data);
      if (data.length > 0 && !city) {
        setCity(data[0].slug);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (city) {
      const selectedCityObj = citiesList.find((c) => c.slug === city || c.id === city);
      if (selectedCityObj) {
        LocationsService.getAreasByCity(selectedCityObj.id).then(setAreasList).catch(() => setAreasList([]));
      }
    }
  }, [city, citiesList]);

  // 1. Check for stored draft on component load
  useEffect(() => {
    const draft = UsersService.getDraftAd();
    if (draft) {
      setDraftBannerVisible(true);
    }
  }, []);

  // 2. Local autosave whenever fields change
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
      setCategory(draft.category || '');
      setCountry(draft.country || 'India');
      setState(draft.state || 'Delhi NCR');
      setCity(draft.city || '');
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
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold font-mono uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              Publisher Dashboard
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Post Classified Listing
            </h1>
          </div>
          <button
            type="button"
            onClick={() => navigateTo('/dashboard')}
            className="text-xs font-bold text-slate-500 hover:text-slate-900 border border-slate-200 bg-white px-3.5 py-2 rounded-xl transition shadow-sm self-start sm:self-auto"
          >
            Cancel & Exit
          </button>
        </div>

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
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
              >
                Restore Draft
              </button>
              <button
                type="button"
                onClick={handleDiscardDraft}
                className="px-3 py-1.5 bg-white border border-amber-200 text-amber-800 hover:bg-amber-100/50 rounded-lg text-xs font-semibold transition"
              >
                Discard
              </button>
            </div>
          </div>
        )}

        {/* Wizard Progress Steps Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm mb-8 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[600px] gap-2">
            {steps.map((step) => {
              const isActive = currentStep === step.num;
              const isCompleted = currentStep > step.num;
              
              return (
                <div key={step.num} className="flex items-center gap-2">
                  <div 
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono transition ${
                      isActive 
                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' 
                        : isCompleted 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : step.num}
                  </div>
                  <span className={`text-xs font-medium whitespace-nowrap ${isActive ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                    {step.name}
                  </span>
                  {step.num < 10 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Wizard Main Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8">

            {/* Validation alert banner */}
            {validationError && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2 animate-pulse">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* STEP 3: AD CONTENT */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">Advertisement Title & Bio Description</h2>
                <p className="text-slate-500 text-xs">Write a descriptive, non-provocative, highly elegant introduction for your profile.</p>
                
                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Title Heading</label>
                    <input 
                      id="wizard-ad-title-input"
                      type="text"
                      placeholder="e.g. Elegant social dinner companion - high class discretion"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-700 focus:outline-none focus:bg-white transition"
                    />
                    <span className="text-[10px] text-slate-400">Min 5 characters. Keep titles clean and descriptive.</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Biography / Description</label>
                    <textarea 
                      id="wizard-ad-desc-input"
                      rows={6}
                      placeholder="Introduce yourself, specify your service philosophy, communication languages, and other premium guidelines..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-700 focus:outline-none focus:bg-white transition"
                    />
                    <span className="text-[10px] text-slate-400">Min 20 characters. Explicit descriptions or solicitations are strictly prohibited.</span>
                  </div>
                </div>
              </div>
            )}

              {/* STEP 4: PROFILE ATTRIBUTES */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-slate-900">Profile Specifications</h2>
                  <p className="text-slate-500 text-xs">Declare profile attributes so users can discover you via faceted searches.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Nationality</label>
                      <select
                        id="wizard-nationality"
                        value={nationality}
                        onChange={(e) => setNationality(e.target.value)}
                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 focus:outline-none"
                      >
                        {mockFilterConfig.nationalities.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Ethnicity</label>
                      <select
                        id="wizard-ethnicity"
                        value={ethnicity}
                        onChange={(e) => setEthnicity(e.target.value)}
                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 focus:outline-none"
                      >
                        {mockFilterConfig.ethnicities.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Body Build</label>
                      <select
                        id="wizard-body"
                        value={bodyType}
                        onChange={(e) => setBodyType(e.target.value)}
                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 focus:outline-none"
                      >
                        {mockFilterConfig.bodyTypes.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Hair Color</label>
                      <select
                        id="wizard-hair"
                        value={hairColor}
                        onChange={(e) => setHairColor(e.target.value)}
                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 focus:outline-none"
                      >
                        {mockFilterConfig.hairColors.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Intended Target Audience</label>
                      <select
                        id="wizard-audience"
                        value={intendedAudience}
                        onChange={(e) => setIntendedAudience(e.target.value)}
                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 focus:outline-none"
                      >
                        {mockFilterConfig.intendedAudiences.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: SELECT SERVICES */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-slate-900">What services do you provide?</h2>
                  <p className="text-slate-500 text-xs">Select options representing your independent scheduling profile. Non-explicit labels only.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 max-h-[300px] overflow-y-auto pr-2">
                    {mockFilterConfig.services.map((svc) => (
                      <label
                        key={svc.value}
                        className={`p-3 border rounded-xl flex items-center gap-3 cursor-pointer transition ${
                          selectedServices.includes(svc.value)
                            ? 'bg-indigo-50/40 border-indigo-500'
                            : 'bg-slate-50 border-slate-200/60 hover:bg-slate-100/50'
                        }`}
                      >
                        <input
                          id={`wizard-service-${svc.value}`}
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
                        <span className="text-xs text-slate-700 font-semibold">{svc.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 6: PLACE OF SERVICE */}
              {currentStep === 6 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-slate-900">Place of Booking / Service Location</h2>
                  <p className="text-slate-500 text-xs">Where do bookings take place? (Select multiple)</p>
                  
                  <div className="space-y-3 pt-2">
                    {mockFilterConfig.placesOfService.map((pl) => (
                      <label
                        key={pl.value}
                        className={`p-4 border rounded-xl flex items-center gap-3 cursor-pointer transition ${
                          selectedPlaces.includes(pl.value)
                            ? 'bg-indigo-50/40 border-indigo-500'
                            : 'bg-slate-50 border-slate-200/60 hover:bg-slate-100/50'
                        }`}
                      >
                        <input
                          id={`wizard-place-${pl.value}`}
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
                          <span className="text-xs text-slate-700 font-bold block">{pl.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 7: CONTACT INFORMATION */}
              {currentStep === 7 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-slate-900">Direct Contact Details</h2>
                  <p className="text-slate-500 text-xs">Enter fictional mock credentials. These appear in active contact slots.</p>
                  
                  <div className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Mobile Phone Call Number</label>
                      <input 
                        id="wizard-contact-phone"
                        type="text"
                        placeholder="e.g. +91 99999 00121"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 focus:outline-none focus:bg-white transition"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">WhatsApp Country Code & Phone</label>
                      <input 
                        id="wizard-contact-whatsapp"
                        type="text"
                        placeholder="e.g. 919999900121"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 focus:outline-none focus:bg-white transition"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Private Email (Optional)</label>
                      <input 
                        id="wizard-contact-email"
                        type="email"
                        placeholder="e.g. elena@auraclassifieds-mock.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 focus:outline-none focus:bg-white transition"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 8: PHOTO UPLOADS */}
              {currentStep === 8 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-slate-900">Upload Gallery Photos</h2>
                  <p className="text-slate-500 text-xs">Upload non-explicit portraits or elegant lifestyle shots. Specify which photo serves as the profile cover card.</p>
                  
                  {/* Drag and Drop Zone */}
                  <input
                    type="file"
                    id="wizard-file-input"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div 
                    id="wizard-dropzone"
                    onClick={() => document.getElementById('wizard-file-input')?.click()}
                    className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center bg-slate-50 hover:bg-slate-100/50 cursor-pointer transition flex flex-col items-center justify-center gap-3"
                  >
                    <div className="p-3 bg-white border border-slate-100 rounded-full text-slate-400 shadow-sm">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">Drag and drop images here or click to browse</p>
                      <p className="text-xs text-slate-400 mt-1">Accepts PNG, JPG. Maximum 5MB each. Non-explicit assets only.</p>
                    </div>
                    <button 
                      type="button" 
                      className="text-xs font-semibold text-indigo-600 bg-white border border-slate-200 py-1.5 px-3.5 rounded-lg shadow-sm hover:bg-slate-50 transition"
                    >
                      Browse Files
                    </button>
                  </div>

                  {/* Thumbnail Previews with Cover setting */}
                  {images.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Uploaded Files ({images.length})</span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {images.map((img, idx) => (
                          <div key={img + idx} className="border border-slate-200/60 rounded-xl overflow-hidden bg-slate-50 relative group h-28">
                            <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            
                            {/* Toolbar overlays */}
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
                              <span>{coverImageIdx === idx ? 'Cover Image' : 'Make Cover'}</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 9: AD PREVIEW */}
              {currentStep === 9 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-slate-900">Preview Advertisement Draft</h2>
                  <p className="text-slate-500 text-xs">Verify your listing formatting. This mirrors how users discover you.</p>
                  
                  <div className="border border-slate-100 rounded-2xl bg-slate-50 p-4 pt-6 max-h-[350px] overflow-y-auto space-y-4">
                    <div className="flex flex-col sm:flex-row gap-5">
                      <div className="w-32 h-36 bg-white border border-slate-200 rounded-xl overflow-hidden shrink-0">
                        <img src={images[coverImageIdx] || images[0]} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="space-y-2">
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-900 text-amber-400 text-[9px] font-bold uppercase rounded-md tracking-wider">
                          Draft Review
                        </div>
                        <h3 className="font-bold text-slate-900 text-lg leading-snug">{title || 'Untitled Advertisement'}</h3>
                        <div className="text-xs text-slate-500 flex items-center gap-2">
                          <span className="capitalize">{city} Area: {area || 'Not selected'}</span>
                          <span>&bull;</span>
                          <span className="capitalize">{category}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-200 pt-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider mb-1.5">Biography Description</h4>
                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-white p-3 rounded-xl border border-slate-200/50">
                        {description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-mono">
                      <div className="bg-white p-2 border border-slate-100 rounded-lg">
                        <strong>ORIGINS:</strong> <span className="text-slate-700">{nationality}</span>
                      </div>
                      <div className="bg-white p-2 border border-slate-100 rounded-lg">
                        <strong>BODY TYPE:</strong> <span className="text-slate-700">{bodyType}</span>
                      </div>
                      <div className="bg-white p-2 border border-slate-100 rounded-lg">
                        <strong>HAIR:</strong> <span className="text-slate-700">{hairColor}</span>
                      </div>
                      <div className="bg-white p-2 border border-slate-100 rounded-lg">
                        <strong>AUDIENCE:</strong> <span className="text-slate-700">{intendedAudience}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 10: SUBMIT FOR REVIEW */}
              {currentStep === 10 && (
                <div className="space-y-4 text-center py-6">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-sm">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Ready for moderator review</h2>
                  <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
                    By submitting your classified advertisement, you certify that all details represent consenting adult mock companions, you agree to our Terms of Use, and accept that scam profiles are terminated without appeal.
                  </p>
                  
                  <div className="p-4 bg-indigo-50/40 border border-indigo-100/30 rounded-xl text-xs text-indigo-700 leading-relaxed text-left max-w-md mx-auto space-y-1.5">
                    <strong>Submission Actions:</strong>
                    <p>&bull; Publishing cost: 100 credits deducted from wallet.</p>
                    <p>&bull; Audits are processed by administrators within 2 hours.</p>
                  </div>
                </div>
              )}

            </div>

            {/* LOWER ACTIONS BUTTON BAR */}
            <div className="border-t border-slate-100 pt-6 mt-8 flex flex-col sm:flex-row gap-3 justify-between items-center text-xs">
              
              {/* Left action */}
              <div>
                {currentStep > 1 && (
                  <button
                    onClick={handlePrevStep}
                    className="flex items-center gap-1 py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous Step</span>
                  </button>
                )}
              </div>

              {/* Right actions */}
              <div className="flex gap-2 w-full sm:w-auto">
                {currentStep < 10 ? (
                  <button
                    id="wizard-continue-btn"
                    onClick={handleNextStep}
                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 py-2.5 px-6 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition shadow-sm"
                  >
                    <span>Continue</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    id="wizard-submit-btn"
                    onClick={handleSubmitAd}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 py-2.5 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow"
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
  );
};
