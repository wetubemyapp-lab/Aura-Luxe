import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Business, Branch, BusinessCategoryConfig } from '../types/index.ts';
import { getCategoryConfig } from '../utils/categoryEngine.ts';
import { useAuth } from './AuthContext.tsx';

interface BusinessContextType {
  businesses: Business[];
  activeBusiness: Business | null;
  settings: Business | null;
  categoryConfig: BusinessCategoryConfig;
  branches: Branch[];
  activeBranch: Branch | null;
  isLoading: boolean;
  selectBusiness: (identifier: string | number) => Promise<void>;
  selectBranch: (branchId: number) => void;
  refreshBusinesses: () => Promise<void>;
  refreshBranches: () => Promise<void>;
  updateSettings: (newSettings: Partial<Business>) => Promise<{ success: boolean; error?: string }>;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export const BusinessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [activeBusiness, setActiveBusiness] = useState<Business | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [activeBranch, setActiveBranch] = useState<Branch | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { token } = useAuth();

  const fetchBranches = async (businessId: number) => {
    try {
      const res = await fetch(`/api/branches?businessId=${businessId}`);
      if (res.ok) {
        const data = await res.json();
        const branchList: Branch[] = data.branches || [];
        setBranches(branchList);
        const main = branchList.find((b) => b.is_main) || branchList[0] || null;
        setActiveBranch(main);
      }
    } catch (e) {
      console.error('Failed to load branches:', e);
    }
  };

  const fetchBusinesses = async () => {
    try {
      const res = await fetch('/api/tenants');
      if (res.ok) {
        const data = await res.json();
        const list: Business[] = data.businesses || [];
        setBusinesses(list);

        const savedSlug = localStorage.getItem('active_tenant_slug');
        const selected = list.find((b) => b.slug === savedSlug) || list[0] || null;
        setActiveBusiness(selected);

        if (selected) {
          await fetchBranches(selected.id);
        }
      }
    } catch (err) {
      console.error('Failed to load tenants:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  // Inject / update Schema.org Structured Data (JSON-LD) for SEO
  useEffect(() => {
    if (!activeBusiness) return;

    let schemaType = 'LocalBusiness';
    if (activeBusiness.category.includes('salon') || activeBusiness.category.includes('barber')) {
      schemaType = 'BeautySalon';
    } else if (activeBusiness.category.includes('spa') || activeBusiness.category.includes('massage')) {
      schemaType = 'DaySpa';
    }

    const schemaData = {
      '@context': 'https://schema.org',
      '@type': schemaType,
      'name': activeBusiness.name,
      'description': activeBusiness.about_text || activeBusiness.tagline,
      'image': activeBusiness.banner_url || activeBusiness.logo_url,
      'telephone': activeBusiness.phone,
      'email': activeBusiness.email,
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': activeBranch?.address || activeBusiness.address || 'Flagship Store',
        'addressCountry': 'IN',
      },
      'priceRange': '₹₹',
      'openingHours': activeBranch?.opening_hours || activeBusiness.opening_hours,
      'url': window.location.origin,
    };

    let scriptTag = document.getElementById('business-schema-jsonld') as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'business-schema-jsonld';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(schemaData);

    // Update document title dynamically
    document.title = `${activeBusiness.name} – Universal Appointment Platform`;
  }, [activeBusiness, activeBranch]);

  const selectBusiness = async (identifier: string | number) => {
    const isNum = typeof identifier === 'number' || /^\d+$/.test(String(identifier));
    const target = isNum
      ? businesses.find((b) => b.id === Number(identifier))
      : businesses.find((b) => b.slug === String(identifier));

    if (target) {
      setActiveBusiness(target);
      localStorage.setItem('active_tenant_slug', target.slug);
      await fetchBranches(target.id);
    } else {
      try {
        const res = await fetch(`/api/tenants/${identifier}`);
        if (res.ok) {
          const data = await res.json();
          if (data.business) {
            setActiveBusiness(data.business);
            localStorage.setItem('active_tenant_slug', data.business.slug);
            await fetchBranches(data.business.id);
          }
        }
      } catch (e) {
        console.error('Failed to fetch selected business:', e);
      }
    }
  };

  const selectBranch = (branchId: number) => {
    const found = branches.find((b) => b.id === branchId);
    if (found) {
      setActiveBranch(found);
    }
  };

  const updateSettings = async (newSettings: Partial<Business>): Promise<{ success: boolean; error?: string }> => {
    if (!activeBusiness) return { success: false, error: 'No active business selected' };

    try {
      const res = await fetch(`/api/tenants/${activeBusiness.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newSettings),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to update business settings' };
      }

      setActiveBusiness(data.business);
      setBusinesses((prev) =>
        prev.map((b) => (b.id === data.business.id ? data.business : b))
      );
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const categoryConfig = useMemo(() => {
    return getCategoryConfig(activeBranch?.business_category || activeBusiness?.category);
  }, [activeBusiness?.category, activeBranch?.business_category]);

  return (
    <BusinessContext.Provider
      value={{
        businesses,
        activeBusiness,
        settings: activeBusiness,
        categoryConfig,
        branches,
        activeBranch,
        isLoading,
        selectBusiness,
        selectBranch,
        refreshBusinesses: fetchBusinesses,
        refreshBranches: () => (activeBusiness ? fetchBranches(activeBusiness.id) : Promise.resolve()),
        updateSettings,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = (): BusinessContextType => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
};
