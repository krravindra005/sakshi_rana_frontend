import React, { useState, useEffect } from 'react';
import { useRouter } from '../../context/RouterContext';
import { mockCategories } from '../../data/mock-categories';
import { mockCities, mockAreas } from '../../data/mock-locations';
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

  // Image Upload State (mock urls for the prototype)
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'
  ]);
  const [coverImageIdx, setCoverImageIdx] = useState(0);

  // Status/Validation states
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Drag and drop mock file additions
  const handleMockImageUpload = () => {
    const list = [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400'
    ];
    // Add random one
    const randomImg = list[Math.floor(Math.random() * list.length)];
    setImages([...images, randomImg]);
  };

  const handleDeleteImage = (index: number) => {
    setImages(images.filter((_, idx) => idx !== index));
    if (coverImageIdx === index) {
      setCoverImageIdx(0);
    } else if (coverImageIdx > index) {
      setCoverImageIdx(coverImageIdx - 1);
    }
  };

  // Validate step progress
  const validateStep = (): boolean => {
    setValidationError('');
    
    if (currentStep === 1 && !category) {
      setValidationError('Please choose a category to continue.');
      return false;
    }
    if (currentStep === 2 && (!city || !area)) {
      setValidationError('Please select a valid city and area.');
      return false;
    }
    if (currentStep === 3) {
      if (title.length < 10) {
        setValidationError('Your advertisement title must be at least 10 characters.');
        return false;
      }
      if (description.length < 50) {
        setValidationError('Please provide a detailed description of at least 50 characters.');
        return false;
      }
    }
    if (currentStep === 5 && selectedServices.length === 0) {
      setValidationError('Please select at least one companion service.');
      return false;
    }
    if (currentStep === 6 && selectedPlaces.length === 0) {
      setValidationError('Please specify at least one place of service.');
      return false;
    }
    if (currentStep === 7 && (!phone || !whatsapp)) {
      setValidationError('Please provide both Phone and WhatsApp contact details.');
      return false;
    }
    if (currentStep === 8 && images.length === 0) {
      setValidationError('Please upload at least one profile photo to verify your listing.');
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 10));
    }
  };

  const handlePrev = () => {
    setValidationError('');
    setCurrentStep((prev) => Math.max(prev - 1, 15));
  };

  const handleSubmitAd = async () => {
    setIsSubmitting(true);
    
    const adAttributes: AdAttributes = {
      nationality,
      ethnicity,
      bodyType,
      hairColor,
      intendedAudience,
      placeOfService: selectedPlaces
    };

    // Construct mock Ad
    const finalAd: Omit<Ad, 'id' | 'postedAt' | 'viewsCount'> = {
      slug: `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${city}`,
      title,
      description,
      categorySlug: category,
      citySlug: city,
      areaSlug: area,
      profileName: title.split(' ')[0] || 'Aria', // default mock name
      profileImage: images[coverImageIdx] || images[0],
      images: images,
      isVerified: false, // published ads go to Pending Review
      isFeatured: false,
      attributes: adAttributes,
      services: selectedServices,
      contact: {
        phone,
        whatsapp,
        email: email || undefined
      }
    };

    try {
      // Create listing in AdsService
      const created = await AdsService.createAd(finalAd);
      UsersService.clearDraftAd();
      
      setTimeout(() => {
        setIsSubmitting(false);
        // Navigate directly to dashboard publications
        navigateTo('/dashboard', { tab: 'ads' });
        alert('Your advertisement was submitted successfully! It is now pending verification by our moderation team.');
      }, 1500);

    } catch (err) {
      console.error(err);
      setValidationError('Failed to save advertisement. Try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#fcfcfd] min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* RESTORE DRAFT BANNER */}
        {draftBannerVisible && (
          <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in slide-in-from-top duration-300">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Unfinished Advertisement Draft Found</h4>
                <p className="text-slate-500 text-xs mt-0.5">We autosaved your progress. Would you like to restore your listing data?</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRestoreDraft}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs py-1.5 px-3 rounded-lg transition"
              >
                Restore Draft
              </button>
              <button
                onClick={handleDiscardDraft}
                className="bg-white hover:bg-slate-50 text-slate-500 font-semibold text-xs py-1.5 px-3 rounded-lg border border-slate-200 transition"
              >
                Discard
              </button>
            </div>
          </div>
        )}

        {/* Wizard Main Panel */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-4">
          
          {/* STEP INDICATORS SIDEBAR */}
          <div className="bg-slate-900 text-slate-400 p-6 space-y-6 md:border-r border-slate-800">
            <div className="pb-4 border-b border-slate-800">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest font-mono">AD PUBLISHER</span>
              <h3 className="text-white font-bold text-base mt-1">Creation Wizard</h3>
            </div>
            
            <ul className="space-y-4 text-xs font-medium">
              {steps.map((st) => (
                <li 
                  key={st.num} 
                  className={`flex items-center gap-3 transition ${
                    currentStep === st.num 
                      ? 'text-white' 
                      : currentStep > st.num 
                        ? 'text-indigo-400' 
                        : 'text-slate-500'
                  }`}
                >
                  <span className={`w-5.5 h-5.5 rounded-full flex items-center justify-center font-bold text-[10px] border ${
                    currentStep === st.num 
                      ? 'bg-indigo-600 border-indigo-600 text-white' 
                      : currentStep > st.num 
                        ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-400' 
                        : 'border-slate-800'
                  }`}>
                    {currentStep > st.num ? <Check className="w-3 h-3" /> : st.num}
                  </span>
                  <span>{st.name}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* WIZARD CONTENT BOX */}
          <div className="col-span-1 md:col-span-3 p-6 sm:p-8 flex flex-col justify-between min-h-[520px]">
            
            <div className="space-y-6">
              
              {/* Validation alert banner */}
              {validationError && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* STEP 1: CHOOSE CATEGORY */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-slate-900">What classified category is your listing?</h2>
                  <p className="text-slate-500 text-xs">Select the primary service sector. This determines available filter attributes later.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {mockCategories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.slug)}
                        className={`p-4 text-left border rounded-xl transition ${
                          category === cat.slug 
                            ? 'bg-indigo-50/50 border-indigo-500 ring-1 ring-indigo-500 text-slate-900 font-bold' 
                            : 'bg-white border-slate-200/80 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <h4 className="text-sm font-bold flex items-center gap-1.5 capitalize">
                          <span className={`w-2 h-2 rounded-full ${category === cat.slug ? 'bg-indigo-600 animate-pulse' : 'bg-slate-300'}`} />
                          {cat.name}
                        </h4>
                        <p className="text-slate-400 text-[11px] font-normal leading-relaxed mt-1">
                          {cat.description.substring(0, 75)}...
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2: CHOOSE LOCATION */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-slate-900">Where are you providing services?</h2>
                  <p className="text-slate-500 text-xs">Specify country, state, city, and nearest area neighborhood for localization maps.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Country</label>
                      <input 
                        type="text" 
                        disabled 
                        value={country} 
                        className="w-full text-sm bg-slate-100 border border-slate-200 rounded-lg p-2.5 text-slate-500 focus:outline-none" 
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">State</label>
                      <input 
                        type="text" 
                        disabled 
                        value={state} 
                        className="w-full text-sm bg-slate-100 border border-slate-200 rounded-lg p-2.5 text-slate-500 focus:outline-none" 
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">City Hub</label>
                      <select
                        id="wizard-city-select"
                        value={city}
                        onChange={(e) => {
                          setCity(e.target.value);
                          setArea('');
                        }}
                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 focus:outline-none"
                      >
                        {mockCities.map((c) => (
                          <option key={c.id} value={c.slug}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Nearest Area Sector</label>
                      <select
                        id="wizard-area-select"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 focus:outline-none"
                      >
                        <option value="">Select Area</option>
                        {mockAreas.filter((a) => a.cityId === `ct-${city}`).map((a) => (
                          <option key={a.id} value={a.slug}>{a.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
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
                      <span className="text-[10px] text-slate-400">Min 10 characters. Keep titles clean and descriptive.</span>
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
                      <span className="text-[10px] text-slate-400">Min 50 characters. Explicit descriptions or solicitations are strictly prohibited.</span>
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
                  <div 
                    id="wizard-dropzone"
                    onClick={handleMockImageUpload}
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
                    onClick={handlePrev}
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
                    onClick={handleNext}
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
    </div>
  );
};
