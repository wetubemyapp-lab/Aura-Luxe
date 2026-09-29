import React, { useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface SEOManagerProps {
  currentTab: string;
}

export const SEOManager: React.FC<SEOManagerProps> = ({ currentTab }) => {
  const { activeBusiness, activeBranch } = useBusiness();
  const { language } = useLanguage();

  useEffect(() => {
    if (!activeBusiness) return;

    const bizName = activeBusiness.name || 'Aura Luxe';
    const rawTagline = language === 'hi' && activeBusiness.tagline_hi ? activeBusiness.tagline_hi : activeBusiness.tagline;
    const tagline = rawTagline || 'Premium Beauty Care & Rejuvenation';
    const rawAbout = language === 'hi' && activeBusiness.about_text_hi ? activeBusiness.about_text_hi : activeBusiness.about_text;
    const aboutText = rawAbout || 'Started with a commitment to offer modern, stylish, and high-quality beauty care.';

    // 1. Title formatting
    let pageTitle = `${bizName} | ${tagline}`;
    if (currentTab === 'services') {
      pageTitle = `${language === 'hi' ? 'हमारी सेवाएं' : 'Services Catalog'} - ${bizName}`;
    } else if (currentTab === 'booking') {
      pageTitle = `${language === 'hi' ? 'अपॉइंटमेंट बुक करें' : 'Book Appointment'} - ${bizName}`;
    } else if (currentTab === 'my_bookings' || currentTab === 'profile') {
      pageTitle = `${language === 'hi' ? 'मेरी बुकिंग्स' : 'My Bookings Dashboard'} - ${bizName}`;
    } else if (currentTab === 'about') {
      pageTitle = `${language === 'hi' ? 'हमारे बारे में' : 'About & Philosophy'} - ${bizName}`;
    }

    document.title = pageTitle;

    // Helper to set/update meta tag
    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Meta Descriptions
    setMetaTag('description', aboutText);
    setMetaTag('og:title', pageTitle, true);
    setMetaTag('og:description', aboutText, true);
    setMetaTag('og:type', 'website', true);
    setMetaTag('og:site_name', bizName, true);

    const canonicalUrl = window.location.origin + window.location.pathname;
    setMetaTag('og:url', canonicalUrl, true);

    // Twitter Card
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', pageTitle);
    setMetaTag('twitter:description', aboutText);

    // Canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // 3. Schema.org structured data (JSON-LD)
    const existingScript = document.getElementById('aura-structured-data');
    if (existingScript) {
      existingScript.remove();
    }

    const branchName = activeBranch?.name || `${bizName} Flagship Branch`;
    const branchAddress = activeBranch?.address || activeBusiness.address || 'India';
    const branchPhone = activeBranch?.phone || activeBusiness.phone || '+91 98765 43210';
    const openingHours = activeBranch?.opening_hours || activeBusiness.opening_hours || 'Mon-Sun: 09:30 AM - 09:00 PM';
    const latitude = activeBranch?.latitude ? Number(activeBranch.latitude) : 28.6139;
    const longitude = activeBranch?.longitude ? Number(activeBranch.longitude) : 77.2090;

    const schemaData: any = {
      '@context': 'https://schema.org',
      '@graph': [
        // 3a. LocalBusiness Schema
        {
          '@type': 'BeautySalon',
          '@id': `${canonicalUrl}#localbusiness`,
          'name': branchName,
          'image': activeBusiness.banner_url || 'https://images.unsplash.com/photo-1560066984-138dadb4c035',
          'telePhone': branchPhone,
          'url': canonicalUrl,
          'address': {
            '@type': 'PostalAddress',
            'streetAddress': branchAddress,
            'addressLocality': 'New Delhi / Mumbai',
            'addressCountry': 'IN'
          },
          'geo': {
            '@type': 'GeoCoordinates',
            'latitude': latitude,
            'longitude': longitude
          },
          'openingHoursSpecification': [
            {
              '@type': 'OpeningHoursSpecification',
              'dayOfWeek': [
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
                'Sunday'
              ],
              'opens': '09:30',
              'closes': '21:00'
            }
          ]
        },
        // 3b. Service & Offer Schema
        {
          '@type': 'Service',
          '@id': `${canonicalUrl}#service`,
          'name': 'Premium Hair Styling & Treatment',
          'serviceType': 'Grooming & Hair Styling',
          'provider': {
            '@type': 'LocalBusiness',
            'name': bizName
          },
          'offers': {
            '@type': 'Offer',
            'price': '850',
            'priceCurrency': 'INR',
            'url': `${canonicalUrl}?tab=booking`
          }
        },
        // 3c. FAQPage Schema
        {
          '@type': 'FAQPage',
          '@id': `${canonicalUrl}#faq`,
          'mainEntity': [
            {
              '@type': 'Question',
              'name': 'How do I change my booking time?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'You can change your time or date easily through our member dashboard up to 4 hours before your slot.'
              }
            },
            {
              '@type': 'Question',
              'name': 'Do you offer doorstep home services?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'Yes! We bring our complete premium travel kit to your home or hotel. Just choose Home Service during booking.'
              }
            }
          ]
        },
        // 3d. BreadcrumbList Schema
        {
          '@type': 'BreadcrumbList',
          '@id': `${canonicalUrl}#breadcrumb`,
          'itemListElement': [
            {
              '@type': 'ListItem',
              'position': 1,
              'name': 'Home',
              'item': canonicalUrl
            },
            {
              '@type': 'ListItem',
              'position': 2,
              'name': currentTab.charAt(0).toUpperCase() + currentTab.slice(1),
              'item': `${canonicalUrl}?tab=${currentTab}`
            }
          ]
        }
      ]
    };

    const script = document.createElement('script');
    script.id = 'aura-structured-data';
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify(schemaData, null, 2);
    document.head.appendChild(script);

    return () => {
      // Clean up structured data script on component unmount or transition
      const s = document.getElementById('aura-structured-data');
      if (s) s.remove();
    };
  }, [activeBusiness, activeBranch, currentTab, language]);

  return null;
};
