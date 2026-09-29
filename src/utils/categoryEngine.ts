/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Business Configuration Engine
 * Dynamic multi-category business system powering Barber, Salon, Spa, Tattoo, Beauty, Nail Studio, Aesthetic Clinic & Unisex
 */

import { BusinessCategoryConfig } from '../types/index.ts';

export const BUSINESS_CATEGORIES: Record<string, BusinessCategoryConfig> = {
  barber: {
    id: 'barber',
    displayName: 'Barbershop & Grooming Lounge',
    displayNameHi: 'नाई एवं पुरुष सौंदर्य लाउंज',
    taglineDefault: 'Classic shaves, precision fades, beard sculpting & gentleman grooming.',
    taglineDefaultHi: 'क्लासिक शेव, प्रेसिजन हेयरकट, दाढ़ी संवारना और ग्रूमिंग।',
    specialistTerm: 'Barber / Master Stylist',
    specialistTermPlural: 'Barbers & Stylists',
    specialistTermHi: 'मास्टर बार्बर / हेयर स्टाइलिस्ट',
    bookingTerm: 'Grooming Appointment',
    bookingTermHi: 'ग्रूमिंग अपॉइंटमेंट',
    venueTerm: 'Barber Station',
    defaultCategories: [
      'Haircut & Styling',
      'Beard Grooming & Hot Towel Shave',
      'Hair & Scalp Treatments',
      'Gentlemen Facial & De-Tan',
      'Kids Haircut',
    ],
    visitTypes: {
      inStore: true,
      homeService: true,
      virtualConsult: false,
      vipSuite: true,
    },
    formFields: {
      hairLength: false,
      skinType: true,
      designUpload: true,
      bodyPlacement: false,
      medicalContraindications: false,
      genderPreference: false,
      ageVerificationRequired: false,
      consentWaiverRequired: false,
      consultationRequired: false,
    },
    resourceRequirement: {
      type: 'chair',
      label: 'Hydraulic Barber Chair',
      hasWaterSupply: true,
      sterilizationMandatory: true,
    },
    defaultDepositPct: 15,
    defaultSlotMins: 30,
    defaultBufferMins: 10,
  },

  salon: {
    id: 'salon',
    displayName: 'Hair Salon & Color Atelier',
    displayNameHi: 'हेयर सैलून एवं कलर स्टूडियो',
    taglineDefault: 'Artisan hair design, balayage, botanical keratin treatments & transformations.',
    taglineDefaultHi: 'कलात्मक हेयर डिज़ाइन, बलेयाज, बोटैनिकल केराटिन और हेयर स्पा।',
    specialistTerm: 'Hair Stylist / Colorist',
    specialistTermPlural: 'Stylists & Color Specialists',
    specialistTermHi: 'हेयर स्टाइलिस्ट / कलर स्पेशलिस्ट',
    bookingTerm: 'Salon Appointment',
    bookingTermHi: 'सैलून अपॉइंटमेंट',
    venueTerm: 'Styling Station',
    defaultCategories: [
      'Haircut & Blowdry',
      'Hair Coloring & Balayage',
      'Keratin & Nanoplastia',
      'Hair Spa & Deep Conditioning',
      'Bridal & Event Styling',
    ],
    visitTypes: {
      inStore: true,
      homeService: true,
      virtualConsult: true,
      vipSuite: true,
    },
    formFields: {
      hairLength: true,
      skinType: false,
      designUpload: true,
      bodyPlacement: false,
      medicalContraindications: false,
      genderPreference: true,
      ageVerificationRequired: false,
      consentWaiverRequired: false,
      consultationRequired: false,
    },
    resourceRequirement: {
      type: 'station',
      label: 'Styling Mirror & Wash Basin',
      hasWaterSupply: true,
      sterilizationMandatory: true,
    },
    defaultDepositPct: 20,
    defaultSlotMins: 45,
    defaultBufferMins: 10,
  },

  spa: {
    id: 'spa',
    displayName: 'Luxury Spa & Ayurvedic Wellness',
    displayNameHi: 'लक्ज़री स्पा एवं आयुर्वेदिक वेलनेस',
    taglineDefault: 'Holistic healing, aromatherapy, deep tissue therapies & detox rituals.',
    taglineDefaultHi: 'समग्र उपचार, अरोमाथेरेपी, डीप टिश्यू और डिटॉक्स अनुष्ठान।',
    specialistTerm: 'Therapist / Masseur',
    specialistTermPlural: 'Spa Therapists',
    specialistTermHi: 'स्पा थेरेपिस्ट / मसाज विशेषज्ञ',
    bookingTerm: 'Therapy Session',
    bookingTermHi: 'थेरेपी सत्र',
    venueTerm: 'Therapy Suite',
    defaultCategories: [
      'Swedish & Deep Tissue Massage',
      'Ayurvedic Potli & Abhyanga',
      'Body Scrubs & Wraps',
      'Foot Reflexology',
      'Couples Spa Retreat',
    ],
    visitTypes: {
      inStore: true,
      homeService: true,
      virtualConsult: false,
      vipSuite: true,
    },
    formFields: {
      hairLength: false,
      skinType: true,
      designUpload: false,
      bodyPlacement: false,
      medicalContraindications: true,
      genderPreference: true,
      ageVerificationRequired: false,
      consentWaiverRequired: true,
      consultationRequired: false,
    },
    resourceRequirement: {
      type: 'room',
      label: 'Private Therapy Room with Shower & Table',
      hasWaterSupply: true,
      sterilizationMandatory: true,
    },
    defaultDepositPct: 25,
    defaultSlotMins: 60,
    defaultBufferMins: 15,
  },

  tattoo: {
    id: 'tattoo',
    displayName: 'Tattoo & Body Art Studio',
    displayNameHi: 'टैटू एवं बॉडी आर्ट स्टूडियो',
    taglineDefault: 'Custom ink artistry, fine line tattoos, coverups & sterile body piercing.',
    taglineDefaultHi: 'कस्टम टैटू कला, फाइन लाइन, कवरअप और सुरक्षित बॉडी पियर्सिंग।',
    specialistTerm: 'Tattoo Artist / Piercer',
    specialistTermPlural: 'Tattoo & Body Artists',
    specialistTermHi: 'टैटू कलाकार / पियर्सर',
    bookingTerm: 'Tattoo Session / Consultation',
    bookingTermHi: 'टैटू सेशन / परामर्श',
    venueTerm: 'Tattoo Bay',
    defaultCategories: [
      'Custom Design Tattoo',
      'Flash Tattoos & Minimalist',
      'Coverups & Re-Inking',
      'Sterile Body Piercing',
      'Aftercare & Touch-up Session',
    ],
    visitTypes: {
      inStore: true,
      homeService: false,
      virtualConsult: true,
      vipSuite: true,
    },
    formFields: {
      hairLength: false,
      skinType: true,
      designUpload: true,
      bodyPlacement: true,
      medicalContraindications: true,
      genderPreference: false,
      ageVerificationRequired: true, // 18+ Age verification strictly enforced
      consentWaiverRequired: true, // Digital waiver & consent mandatory
      consultationRequired: true, // Pre-ink consultation required
    },
    resourceRequirement: {
      type: 'chair',
      label: 'Sterile Tattoo Station & Autoclave Tray',
      hasWaterSupply: true,
      sterilizationMandatory: true,
    },
    defaultDepositPct: 30,
    defaultSlotMins: 90,
    defaultBufferMins: 20,
  },

  beauty: {
    id: 'beauty',
    displayName: 'Beauty Parlour & Bridal Studio',
    displayNameHi: 'ब्यूटी पार्लर एवं ब्राइडल स्टूडियो',
    taglineDefault: 'Flawless bridal makeup, organic facials, waxing & beauty rituals.',
    taglineDefaultHi: 'ब्राइडल मेकअप, ऑर्गेनिक फेशियल, वैक्सिंग और सौंदर्य उपचार।',
    specialistTerm: 'Beautician / Esthetician',
    specialistTermPlural: 'Beauticians & Makeup Artists',
    specialistTermHi: 'ब्यूटिशियन / एस्थेटिशियन',
    bookingTerm: 'Beauty Appointment',
    bookingTermHi: 'ब्यूटी अपॉइंटमेंट',
    venueTerm: 'Beauty Couch',
    defaultCategories: [
      'Facials & Clean-ups',
      'Bridal & Party Makeup',
      'Waxing & Threading',
      'Manicure & Pedicure',
      'Skin Brightening & De-Tan',
    ],
    visitTypes: {
      inStore: true,
      homeService: true,
      virtualConsult: true,
      vipSuite: true,
    },
    formFields: {
      hairLength: false,
      skinType: true,
      designUpload: true,
      bodyPlacement: false,
      medicalContraindications: true,
      genderPreference: true,
      ageVerificationRequired: false,
      consentWaiverRequired: false,
      consultationRequired: false,
    },
    resourceRequirement: {
      type: 'bed',
      label: 'Facial Bed & Magnifying Light',
      hasWaterSupply: true,
      sterilizationMandatory: true,
    },
    defaultDepositPct: 20,
    defaultSlotMins: 45,
    defaultBufferMins: 10,
  },

  nail_studio: {
    id: 'nail_studio',
    displayName: 'Nail Couture & Lash Bar',
    displayNameHi: 'नेल कॉउचर एवं लैश बार',
    taglineDefault: 'Acrylic extensions, gel art, Russian manicure, lash extensions & microblading.',
    taglineDefaultHi: 'ऐक्रेलिक एक्सटेंशन, जेल नेल आर्ट, रूसी मैनीक्योर और लैश बार।',
    specialistTerm: 'Nail Artist / Technician',
    specialistTermPlural: 'Nail Artists & Lash Specialists',
    specialistTermHi: 'नेल आर्टिस्ट / लैश स्पेशलिस्ट',
    bookingTerm: 'Nail Session',
    bookingTermHi: 'नेल सेशन',
    venueTerm: 'Nail Table',
    defaultCategories: [
      'Gel Polish & BIAB Nails',
      'Acrylic Extensions & 3D Art',
      'Russian & Classic Manicure',
      'Spa Pedicure & Foot Scrub',
      'Lash Lifts & Extensions',
    ],
    visitTypes: {
      inStore: true,
      homeService: true,
      virtualConsult: false,
      vipSuite: false,
    },
    formFields: {
      hairLength: false,
      skinType: false,
      designUpload: true,
      bodyPlacement: false,
      medicalContraindications: false,
      genderPreference: false,
      ageVerificationRequired: false,
      consentWaiverRequired: false,
      consultationRequired: false,
    },
    resourceRequirement: {
      type: 'table',
      label: 'Nail Table with Dust Collector & UV Lamp',
      hasWaterSupply: false,
      sterilizationMandatory: true,
    },
    defaultDepositPct: 20,
    defaultSlotMins: 45,
    defaultBufferMins: 10,
  },

  aesthetic_clinic: {
    id: 'aesthetic_clinic',
    displayName: 'Aesthetic Skin & Cosmetology Clinic',
    displayNameHi: 'एस्थेटिक स्किन एवं कॉस्मेटोलॉजी क्लिनिक',
    taglineDefault: 'Clinical HydraFacial, chemical peels, laser therapy & dermal aesthetics.',
    taglineDefaultHi: 'क्लिनिकल हाइड्राफेशियल, केमिकल पील्स, लेज़र थेरेपी और डर्मल केयर।',
    specialistTerm: 'Cosmetologist / Aesthetician',
    specialistTermPlural: 'Cosmetologists & Doctors',
    specialistTermHi: 'कॉस्मेटोलॉजिस्ट / एस्थेटिशियन',
    bookingTerm: 'Clinical Consultation & Procedure',
    bookingTermHi: 'क्लिनिकल परामर्श एवं प्रक्रिया',
    venueTerm: 'Clinical Suite',
    defaultCategories: [
      'Medical HydraFacial & Glow Peels',
      'Laser Hair Reduction',
      'Anti-Aging & Skin Tightening',
      'Acne & Pigmentation Clinic',
      'Doctor Pre-Consultation',
    ],
    visitTypes: {
      inStore: true,
      homeService: false,
      virtualConsult: true,
      vipSuite: true,
    },
    formFields: {
      hairLength: false,
      skinType: true,
      designUpload: false,
      bodyPlacement: true,
      medicalContraindications: true,
      genderPreference: true,
      ageVerificationRequired: true,
      consentWaiverRequired: true,
      consultationRequired: true,
    },
    resourceRequirement: {
      type: 'room',
      label: 'Clinical Treatment Room with Laser Interlock',
      hasWaterSupply: true,
      sterilizationMandatory: true,
    },
    defaultDepositPct: 25,
    defaultSlotMins: 45,
    defaultBufferMins: 15,
  },

  unisex_salon: {
    id: 'unisex_salon',
    displayName: 'Unisex Salon & Luxury Spa',
    displayNameHi: 'यूनिसेक्स सैलून एवं लक्ज़री स्पा',
    taglineDefault: 'Master cuts, soothing rituals, bridal couture & complete personal care.',
    taglineDefaultHi: 'मास्टर कट्स, सुकून भरे स्पा अनुष्ठान, ब्राइडल केयर और संपूर्ण सौंदर्य।',
    specialistTerm: 'Specialist / Stylist',
    specialistTermPlural: 'Stylists & Specialists',
    specialistTermHi: 'विशेषज्ञ / स्टाइलिस्ट',
    bookingTerm: 'Appointment',
    bookingTermHi: 'अपॉइंटमेंट',
    venueTerm: 'Styling Station',
    defaultCategories: [
      'Hair Styling & Treatments',
      'Skin Care & Facials',
      'Spa & Massage Therapy',
      'Grooming & Shave Lounge',
      'Bridal & Makeovers',
    ],
    visitTypes: {
      inStore: true,
      homeService: true,
      virtualConsult: true,
      vipSuite: true,
    },
    formFields: {
      hairLength: true,
      skinType: true,
      designUpload: true,
      bodyPlacement: false,
      medicalContraindications: true,
      genderPreference: true,
      ageVerificationRequired: false,
      consentWaiverRequired: false,
      consultationRequired: false,
    },
    resourceRequirement: {
      type: 'station',
      label: 'Universal Station & Basin',
      hasWaterSupply: true,
      sterilizationMandatory: true,
    },
    defaultDepositPct: 20,
    defaultSlotMins: 45,
    defaultBufferMins: 10,
  },
};

/**
 * Returns the business category configuration for a given category key.
 * Falls back to 'unisex_salon' if the category is not directly recognized.
 */
export function getCategoryConfig(categoryKey?: string): BusinessCategoryConfig {
  if (!categoryKey) return BUSINESS_CATEGORIES.unisex_salon;

  const key = categoryKey.toLowerCase().trim();

  if (BUSINESS_CATEGORIES[key]) {
    return BUSINESS_CATEGORIES[key];
  }

  // Common synonyms / aliases mapping
  if (key.includes('barber')) return BUSINESS_CATEGORIES.barber;
  if (key.includes('spa') || key.includes('ayurved')) return BUSINESS_CATEGORIES.spa;
  if (key.includes('tattoo') || key.includes('piercing')) return BUSINESS_CATEGORIES.tattoo;
  if (key.includes('nail')) return BUSINESS_CATEGORIES.nail_studio;
  if (key.includes('beauty') || key.includes('makeup')) return BUSINESS_CATEGORIES.beauty;
  if (key.includes('clinic') || key.includes('cosmetolog') || key.includes('derm')) return BUSINESS_CATEGORIES.aesthetic_clinic;
  if (key.includes('hair') || key.includes('salon')) return BUSINESS_CATEGORIES.salon;

  return BUSINESS_CATEGORIES.unisex_salon;
}

/**
 * Get dynamic specialist title according to category and language
 */
export function getSpecialistTitle(categoryKey?: string, lang: string = 'en', plural: boolean = false): string {
  const config = getCategoryConfig(categoryKey);
  if (lang === 'hi') {
    return config.specialistTermHi;
  }
  return plural ? config.specialistTermPlural : config.specialistTerm;
}

/**
 * Get dynamic booking title according to category and language
 */
export function getBookingTitle(categoryKey?: string, lang: string = 'en'): string {
  const config = getCategoryConfig(categoryKey);
  return lang === 'hi' ? config.bookingTermHi : config.bookingTerm;
}
