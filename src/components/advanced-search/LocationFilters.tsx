import React, { useState, useEffect } from 'react';
import { useAdvancedSearch } from '../../context/AdvancedSearchContext';
import { SearchService } from '../../services/search.service';
import { SearchableSelect } from './SearchableSelect';
import { MapPin } from 'lucide-react';

export const LocationFilters: React.FC = () => {
  const { draftState, setDraftState } = useAdvancedSearch();

  const [countries, setCountries] = useState<{ label: string; value: string }[]>([]);
  const [regions, setRegions] = useState<{ label: string; value: string }[]>([]);
  const [cities, setCities] = useState<{ label: string; value: string }[]>([]);
  const [areas, setAreas] = useState<{ label: string; value: string }[]>([]);

  // 1. Fetch Countries on Mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const countryList = await SearchService.getCountries();
        setCountries(countryList.map((c) => ({ label: c.name, value: c.id })));
        
        // Auto-select India if empty as it is our primary mock country
        if (!draftState.country && countryList.length > 0) {
          setDraftState((prev) => ({ ...prev, country: countryList[0].id }));
        }
      } catch (err) {
        console.error('Error loading countries', err);
      }
    };
    fetchCountries();
  }, []);

  // 2. Fetch Regions/States when Country changes
  useEffect(() => {
    const fetchRegions = async () => {
      if (!draftState.country) {
        setRegions([]);
        return;
      }
      try {
        const regionList = await SearchService.getRegions(draftState.country);
        setRegions(regionList.map((r) => ({ label: r.name, value: r.id })));
      } catch (err) {
        console.error('Error loading regions', err);
      }
    };
    fetchRegions();
  }, [draftState.country]);

  // 3. Fetch Cities when Region changes
  useEffect(() => {
    const fetchCities = async () => {
      if (!draftState.state) {
        setCities([]);
        return;
      }
      try {
        const cityList = await SearchService.getCities(draftState.state);
        setCities(cityList.map((c) => ({ label: c.name, value: c.slug }))); // value is slug to match router & SearchService!
      } catch (err) {
        console.error('Error loading cities', err);
      }
    };
    fetchCities();
  }, [draftState.state]);

  // 4. Fetch Areas when City changes
  useEffect(() => {
    const fetchAreas = async () => {
      if (!draftState.city) {
        setAreas([]);
        return;
      }
      try {
        // Since we need cityId for getAreas but draftState.city is a slug,
        // let's retrieve the full city object by slug first
        const allCities = await SearchService.getCities(draftState.state || '');
        const currentCity = allCities.find((c) => c.slug === draftState.city);
        if (currentCity) {
          const areaList = await SearchService.getAreas(currentCity.id);
          setAreas(areaList.map((a) => ({ label: a.name, value: a.slug }))); // value is slug to match SearchService areaSlug!
        } else {
          setAreas([]);
        }
      } catch (err) {
        console.error('Error loading areas', err);
      }
    };
    fetchAreas();
  }, [draftState.city, draftState.state]);

  const handleCountryChange = (value: string) => {
    setDraftState((prev) => ({
      ...prev,
      country: value || undefined,
      state: undefined,
      city: undefined,
      area: undefined,
    }));
  };

  const handleRegionChange = (value: string) => {
    setDraftState((prev) => ({
      ...prev,
      state: value || undefined,
      city: undefined,
      area: undefined,
    }));
  };

  const handleCityChange = (value: string) => {
    setDraftState((prev) => ({
      ...prev,
      city: value || undefined,
      area: undefined,
    }));
  };

  const handleAreaChange = (value: string) => {
    setDraftState((prev) => ({
      ...prev,
      area: value || undefined,
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100">
        <MapPin className="w-4 h-4 text-indigo-500" />
        <h3 className="text-sm font-bold text-slate-800">Geographic Location</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Country Selector */}
        <SearchableSelect
          id="adv-search-country"
          label="Country"
          options={countries}
          value={draftState.country || ''}
          onChange={handleCountryChange}
          placeholder="Select Country"
        />

        {/* Region Selector */}
        <SearchableSelect
          id="adv-search-state"
          label="State / Region"
          options={regions}
          value={draftState.state || ''}
          onChange={handleRegionChange}
          placeholder="Select State"
          disabled={!draftState.country}
        />

        {/* City Selector */}
        <SearchableSelect
          id="adv-search-city"
          label="City"
          options={cities}
          value={draftState.city || ''}
          onChange={handleCityChange}
          placeholder="Select City"
          disabled={!draftState.state}
        />

        {/* Area Selector */}
        <SearchableSelect
          id="adv-search-area"
          label="Area / Neighborhood"
          options={areas}
          value={draftState.area || ''}
          onChange={handleAreaChange}
          placeholder="Select Area"
          disabled={!draftState.city}
        />
      </div>
    </div>
  );
};
