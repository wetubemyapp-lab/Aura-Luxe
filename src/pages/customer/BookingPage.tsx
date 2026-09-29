import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useBusiness } from '../../context/BusinessContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { ServiceItem, PackageItem, StaffItem, Branch } from '../../types/index.ts';
import {
  Calendar,
  Clock,
  CheckCircle2,
  User,
  Sparkles,
  AlertCircle,
  Tag,
  ShieldCheck,
  Check,
  Building2,
  Home,
  MessageCircle,
  ExternalLink,
  Plus,
  Trash2,
  CreditCard,
  Banknote,
  DollarSign,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Phone,
  Lock,
  Zap,
  X,
} from 'lucide-react';
import { Button, Badge } from '../../components/ui/index.ts';

interface BookingPageProps {
  initialServiceId?: number;
  onNavigateToMyBookings: () => void;
  onOpenAuth: () => void;
}

export const BookingPage: React.FC<BookingPageProps> = ({
  initialServiceId,
  onNavigateToMyBookings,
  onOpenAuth,
}) => {
  const { user, token } = useAuth();
  const { activeBusiness, branches, categoryConfig } = useBusiness();
  const { t, language } = useLanguage();

  // Booking Flow Stepper State (Steps 1 to 8)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Catalog State
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [activeCatalogTab, setActiveCatalogTab] = useState<'services' | 'packages'>('services');

  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
  const [selectedPackageIds, setSelectedPackageIds] = useState<number[]>([]);

  const [staffList, setStaffList] = useState<StaffItem[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<number | undefined>(undefined);
  const [selectedBranchId, setSelectedBranchId] = useState<number | undefined>(undefined);

  // Visit Type / Mode
  const [bookingMode, setBookingMode] = useState<'online' | 'home_service'>('online');
  const [homeAddress, setHomeAddress] = useState<string>('');

  // Date, Slot & 5-Minute Hold State
  const [sessionId] = useState<string>(() => `sess_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`);
  const [dynamicSlots, setDynamicSlots] = useState<Array<{ time: string; available: boolean; buffer_mins: number }>>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
  const [activeHoldTimer, setActiveHoldTimer] = useState<number | null>(null);
  const [holdErrorMessage, setHoldErrorMessage] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedTime, setSelectedTime] = useState<string>('11:00 AM');

  // Coupon / Offers State
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount_amount: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState<boolean>(false);

  // Customer Contact & OTP Simulation
  const [guestName, setGuestName] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('');
  const [guestEmail, setGuestEmail] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [otpCode, setOtpCode] = useState<string>('123456');
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [isOtpSent, setIsOtpSent] = useState<boolean>(false);
  const [isOtpVerified, setIsOtpVerified] = useState<boolean>(false);

  // Category Protocol Specific Fields
  const [hairLength, setHairLength] = useState<string>('medium');
  const [skinType, setSkinType] = useState<string>('normal');
  const [bodyPlacement, setBodyPlacement] = useState<string>('');
  const [designUploadUrl, setDesignUploadUrl] = useState<string>('');
  const [medicalContraindications, setMedicalContraindications] = useState<string>('');
  const [ageConfirmed, setAgeConfirmed] = useState<boolean>(false);
  const [consentWaiverAgreed, setConsentWaiverAgreed] = useState<boolean>(false);

  // Payment Option: 'full_online' | 'advance_online' | 'pay_at_venue'
  const [paymentOption, setPaymentOption] = useState<'full_online' | 'advance_online' | 'pay_at_venue'>('advance_online');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currency = activeBusiness?.primary_currency || '₹';
  const taxRate = parseFloat(String(activeBusiness?.tax_rate || '5.00')) / 100;
  const advancePct = parseFloat(String(activeBusiness?.advance_payment_percentage || '20.00')) / 100;
  const homeTravelFee = parseFloat(String(activeBusiness?.home_service_travel_fee || '150.00'));

  // Preselect service & user profile
  useEffect(() => {
    if (initialServiceId) {
      setSelectedServiceIds((prev) => (prev.includes(initialServiceId) ? prev : [...prev, initialServiceId]));
    }
  }, [initialServiceId]);

  useEffect(() => {
    if (user) {
      if (!guestName) setGuestName(user.name);
      if (!guestEmail) setGuestEmail(user.email);
      if (!guestPhone && user.phone) {
        setGuestPhone(user.phone);
        setIsOtpVerified(true);
      }
    }
  }, [user]);

  const selectedServices = services.filter((s) => selectedServiceIds.includes(s.id));
  const selectedPackages = packages.filter((p) => selectedPackageIds.includes(p.id));

  const totalServicesDuration = selectedServices.reduce((sum, s) => sum + (s.duration_mins || 30), 0);
  const totalPackagesDuration = selectedPackages.reduce((sum, p) => sum + 90, 0);
  const totalDurationMins = totalServicesDuration + totalPackagesDuration;

  // Fetch Dynamic Slots based on Business Hours, Staff & Buffer rules
  useEffect(() => {
    async function fetchSlots() {
      if (!activeBusiness) return;
      setIsLoadingSlots(true);
      setHoldErrorMessage(null);
      try {
        const queryParams = new URLSearchParams({
          businessId: String(activeBusiness.id),
          date: selectedDate,
          duration: String(totalDurationMins || 45),
        });
        if (selectedBranchId) queryParams.append('branchId', String(selectedBranchId));
        if (selectedStaffId) queryParams.append('staffId', String(selectedStaffId));

        const res = await fetch(`/api/bookings/slots?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setDynamicSlots(data.slots || []);
        }
      } catch (err) {
        console.error('Failed to fetch dynamic slots:', err);
      } finally {
        setIsLoadingSlots(false);
      }
    }
    fetchSlots();
  }, [activeBusiness, selectedDate, selectedBranchId, selectedStaffId, totalDurationMins]);

  // Handle Slot Selection with Temporary 5-Minute Hold
  const handleSelectSlot = async (timeSlot: string) => {
    setHoldErrorMessage(null);
    try {
      const res = await fetch('/api/bookings/hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: activeBusiness?.id || 1,
          outlet_id: selectedBranchId || 1,
          staff_id: selectedStaffId || null,
          booking_date: selectedDate,
          start_time: timeSlot,
          duration_mins: totalDurationMins || 45,
          session_id: sessionId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setHoldErrorMessage(data.error || 'This slot is no longer available. Please choose another slot.');
      } else {
        setSelectedTime(timeSlot);
        setActiveHoldTimer(300); // 5 minutes UI countdown
      }
    } catch (err) {
      setHoldErrorMessage('Could not place slot lock. Please try again.');
    }
  };

  // Hold Timer Countdown Effect
  useEffect(() => {
    if (activeHoldTimer === null || activeHoldTimer <= 0) return;
    const interval = setInterval(() => {
      setActiveHoldTimer((prev) => (prev && prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeHoldTimer]);

  // Fetch Services, Packages & Staff Catalog
  useEffect(() => {
    async function loadData() {
      if (!activeBusiness) return;
      try {
        const [srvRes, pkgRes, stfRes] = await Promise.all([
          fetch(`/api/services?businessId=${activeBusiness.id}`),
          fetch(`/api/packages?businessId=${activeBusiness.id}`),
          fetch(`/api/staff?businessId=${activeBusiness.id}`),
        ]);

        if (srvRes.ok) {
          const srvData = await srvRes.json();
          setServices(srvData.services || []);
          if (selectedServiceIds.length === 0 && srvData.services.length > 0 && !initialServiceId) {
            setSelectedServiceIds([srvData.services[0].id]);
          }
        }

        if (pkgRes.ok) {
          const pkgData = await pkgRes.json();
          setPackages(pkgData.packages || []);
        }

        if (stfRes.ok) {
          const stfData = await stfRes.json();
          setStaffList(stfData.staff || []);
        }
      } catch (err) {
        console.error('Failed to load booking catalog:', err);
      }
    }
    loadData();
  }, [activeBusiness]);

  // Toggle multi-service selection
  const toggleService = (id: number) => {
    setSelectedServiceIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1 && selectedPackageIds.length === 0) return prev;
        return prev.filter((sId) => sId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const togglePackage = (id: number) => {
    setSelectedPackageIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((pId) => pId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const removeService = (id: number) => {
    if (selectedServiceIds.length + selectedPackageIds.length > 1) {
      setSelectedServiceIds((prev) => prev.filter((sId) => sId !== id));
    }
  };

  const removePackage = (id: number) => {
    if (selectedServiceIds.length + selectedPackageIds.length > 1) {
      setSelectedPackageIds((prev) => prev.filter((pId) => pId !== id));
    }
  };

  const baseServicesAmount = selectedServices.reduce((sum, s) => sum + parseFloat(String(s.price || 0)), 0);
  const basePackagesAmount = selectedPackages.reduce((sum, p) => sum + parseFloat(String(p.price || 0)), 0);
  const baseServiceAmount = baseServicesAmount + basePackagesAmount;

  const travelFee = bookingMode === 'home_service' ? homeTravelFee : 0;
  const subtotalBeforeDiscount = baseServiceAmount + travelFee;

  const discountAmount = appliedCoupon ? appliedCoupon.discount_amount : 0;
  const taxableAmount = Math.max(0, subtotalBeforeDiscount - discountAmount);
  const taxAmount = parseFloat((taxableAmount * taxRate).toFixed(2));
  const finalTotalAmount = parseFloat((taxableAmount + taxAmount).toFixed(2));

  let calculatedAdvanceAmount = 0;
  let calculatedBalanceDue = 0;

  if (paymentOption === 'full_online') {
    calculatedAdvanceAmount = finalTotalAmount;
    calculatedBalanceDue = 0;
  } else if (paymentOption === 'advance_online') {
    calculatedAdvanceAmount = parseFloat((finalTotalAmount * advancePct).toFixed(2));
    calculatedBalanceDue = parseFloat((finalTotalAmount - calculatedAdvanceAmount).toFixed(2));
  } else {
    calculatedAdvanceAmount = 0;
    calculatedBalanceDue = finalTotalAmount;
  }

  // Format Duration Helper
  const formatDuration = (mins: number) => {
    if (mins < 60) return `${mins} min`;
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return remainingMins > 0 ? `${hrs} hr ${remainingMins} min` : `${hrs} hr`;
  };

  // Handle Coupon Validation
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsValidatingCoupon(true);
    setCouponError(null);

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim(),
          business_id: activeBusiness?.id || 1,
          subtotal: subtotalBeforeDiscount,
        }),
      });

      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedCoupon({
          code: data.coupon.code,
          discount_amount: data.coupon.discount_amount,
        });
      } else {
        setCouponError(data.error || 'Invalid or non-applicable coupon code');
        setAppliedCoupon(null);
      }
    } catch (err) {
      setCouponError('Failed to validate coupon code');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  // Trigger Phone OTP Simulation
  const handleSendOtp = () => {
    if (!guestPhone || guestPhone.length < 8) {
      setErrorMessage('Please enter a valid phone number');
      return;
    }
    setErrorMessage(null);
    setIsOtpSent(true);
  };

  const handleVerifyOtp = () => {
    if (enteredOtp === otpCode || enteredOtp === '123456') {
      setIsOtpVerified(true);
      setErrorMessage(null);
    } else {
      setErrorMessage('Invalid OTP code. Use test code: 123456');
    }
  };

  // Step Navigation Validation
  const handleNextStep = () => {
    setErrorMessage(null);

    if (currentStep === 1 && selectedServiceIds.length === 0 && selectedPackageIds.length === 0) {
      setErrorMessage('Please select at least one service or ritual package');
      return;
    }

    if (currentStep === 4 && bookingMode === 'home_service' && !homeAddress.trim()) {
      setErrorMessage('Please enter your complete doorstep delivery address');
      return;
    }

    if (currentStep === 6) {
      if (!guestName.trim()) {
        setErrorMessage('Please enter your full name');
        return;
      }
      if (!guestPhone.trim()) {
        setErrorMessage('Please enter your phone number');
        return;
      }
      if (categoryConfig.formFields.ageVerificationRequired && !ageConfirmed) {
        setErrorMessage('Please confirm that you are at least 18 years of age to proceed.');
        return;
      }
      if (categoryConfig.formFields.consentWaiverRequired && !consentWaiverAgreed) {
        setErrorMessage('Please sign the health standards and digital consent waiver.');
        return;
      }
    }

    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    } else if (currentStep === 7) {
      handleFinalSubmission();
    }
  };

  const handlePrevStep = () => {
    setErrorMessage(null);
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  // Submit Final Reservation (Step 7 -> Step 8)
  const handleFinalSubmission = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    const protocolNotes = [
      notes,
      categoryConfig.formFields.hairLength ? `Hair: ${hairLength}` : null,
      categoryConfig.formFields.skinType ? `Skin: ${skinType}` : null,
      categoryConfig.formFields.bodyPlacement && bodyPlacement ? `Placement: ${bodyPlacement}` : null,
      categoryConfig.formFields.designUpload && designUploadUrl ? `Design: ${designUploadUrl}` : null,
      categoryConfig.formFields.medicalContraindications && medicalContraindications ? `Medical: ${medicalContraindications}` : null,
    ].filter(Boolean).join(' | ');

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          business_id: activeBusiness?.id || 1,
          branch_id: selectedBranchId,
          service_id: selectedServiceIds[0] || 1,
          service_ids: selectedServiceIds,
          staff_id: selectedStaffId || null,
          booking_mode: bookingMode,
          home_service_address: bookingMode === 'home_service' ? homeAddress : null,
          booking_date: selectedDate,
          booking_time: selectedTime,
          payment_option: paymentOption,
          coupon_code: appliedCoupon ? appliedCoupon.code : null,
          notes: protocolNotes,
          customer_name: guestName || 'Guest Client',
          customer_phone: guestPhone,
          customer_email: guestEmail,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Could not complete reservation');
      } else {
        setBookingSuccess(data.booking);
        setCurrentStep(8);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      setErrorMessage('Network error while completing reservation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedBranch = branches.find((b) => b.id === selectedBranchId) || branches[0];
  const selectedStaff = staffList.find((s) => s.id === selectedStaffId);

  // Stepper Labels Definition
  const stepsList = [
    { num: 1, label: 'Services' },
    { num: 2, label: categoryConfig.specialistTerm.split('/')[0] },
    { num: 3, label: 'Date & Slot' },
    { num: 4, label: 'Visit Mode' },
    { num: 5, label: 'Coupons' },
    { num: 6, label: 'Contact & OTP' },
    { num: 7, label: 'Payment' },
    { num: 8, label: 'Confirmation' },
  ];

  // ---------------- STEP 8: BOOKING CONFIRMATION ----------------
  if (currentStep === 8 && bookingSuccess) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 animate-fade-in">
        <div className="glass-card rounded-3xl p-8 border border-[#EAE5DF] shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner border border-emerald-200">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <Badge variant="success" size="sm">
              Confirmed • Reservation #{bookingSuccess.id}
            </Badge>
            <h1 className="text-3xl font-serif font-bold text-[#1E2433]">
              {language === 'hi' ? 'आपकी बुकिंग सफलतापूर्वक सुरक्षित हो गई है!' : 'Appointment Confirmed!'}
            </h1>
            <p className="text-xs sm:text-sm text-[#566176]">
              An instant confirmation receipt has been generated and dispatched via WhatsApp.
            </p>
          </div>

          {/* Receipt Breakdown */}
          <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DF] text-left space-y-3 text-xs">
            <div className="flex justify-between items-center border-b border-[#EAE5DF] pb-2 font-semibold">
              <span>Date & Time Slot:</span>
              <span className="text-[#1E2433]">{bookingSuccess.booking_date} @ {bookingSuccess.booking_time}</span>
            </div>

            <div className="flex justify-between items-center border-b border-[#EAE5DF] pb-2">
              <span>Specialist Assigned:</span>
              <span className="font-semibold text-[#1E2433]">{bookingSuccess.staff_name || 'Any Available Master'}</span>
            </div>

            <div className="flex justify-between items-center border-b border-[#EAE5DF] pb-2">
              <span>Visit Mode & Location:</span>
              <span className="font-semibold text-[#1E2433] capitalize">{bookingSuccess.booking_mode?.replace('_', ' ')}</span>
            </div>

            <div className="pt-2 border-t border-[#EAE5DF] space-y-1 font-mono">
              <div className="flex justify-between text-[#566176]">
                <span>Total Amount:</span>
                <span>{currency}{parseFloat(bookingSuccess.total_amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Advance Deposit Paid:</span>
                <span>{currency}{parseFloat(bookingSuccess.advance_amount_paid || '0').toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#1E2433] font-bold text-sm pt-1 border-t border-[#EAE5DF]">
                <span>Balance Due at Venue:</span>
                <span>{currency}{parseFloat(bookingSuccess.venue_balance_due || '0').toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button variant="primary" onClick={onNavigateToMyBookings} rightIcon={<ArrowRight className="w-4 h-4" />}>
              View My Bookings
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setBookingSuccess(null);
                setCurrentStep(1);
              }}
            >
              Book Another Session
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------- PROGRESSIVE BOOKING STEPPER ----------------
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF4EB] text-[#C89B53] text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Universal Progressive Stepper</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-serif font-bold text-[#1E2433]">
          Reserve Your Ritual
        </h1>
        <p className="text-[#566176] text-xs sm:text-sm">
          Step {currentStep} of 7: {stepsList[currentStep - 1]?.label}
        </p>
      </div>

      {/* Progressive Step Progress Bar */}
      <div className="glass-card rounded-2xl p-3 sm:p-4 border border-[#EAE5DF]">
        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-[10px] font-bold">
          {stepsList.slice(0, 7).map((s) => {
            const isActive = currentStep === s.num;
            const isCompleted = currentStep > s.num;
            return (
              <div
                key={s.num}
                onClick={() => {
                  if (s.num < currentStep) setCurrentStep(s.num);
                }}
                className={`py-2 px-1 rounded-xl transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  isActive
                    ? 'bg-[#1E2433] text-white shadow-xs'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-stone-50 text-stone-400'
                }`}
              >
                <div className="flex items-center gap-1">
                  {isCompleted ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <span>{s.num}.</span>
                  )}
                  <span className="hidden sm:inline truncate">{s.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error Alert Message */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Stepper Card Body */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-[#EAE5DF] space-y-6">
        {/* STEP 1: SERVICE SELECTION */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE5DF] pb-4">
              <div>
                <h2 className="font-serif font-bold text-xl text-[#1E2433]">
                  STEP 1: Select Services & Bundles
                </h2>
                <p className="text-xs text-[#566176]">
                  Select single services, multiple rituals, or complete signature packages.
                </p>
              </div>

              {/* Toggle Catalog Tab */}
              <div className="inline-flex p-1 bg-stone-100 rounded-xl border border-[#EAE5DF]">
                <button
                  type="button"
                  onClick={() => setActiveCatalogTab('services')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeCatalogTab === 'services'
                      ? 'bg-white text-[#1E2433] shadow-xs'
                      : 'text-[#566176] hover:text-[#1E2433]'
                  }`}
                >
                  Individual Services ({services.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCatalogTab('packages')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeCatalogTab === 'packages'
                      ? 'bg-white text-[#1E2433] shadow-xs'
                      : 'text-[#566176] hover:text-[#1E2433]'
                  }`}
                >
                  Signature Packages ({packages.length})
                </button>
              </div>
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Cards */}
              <div className="lg:col-span-7 space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {activeCatalogTab === 'services' && (
                  <div className="space-y-3">
                    {services.map((srv) => {
                      const isSelected = selectedServiceIds.includes(srv.id);
                      return (
                        <div
                          key={srv.id}
                          onClick={() => toggleService(srv.id)}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 hover-lift ${
                            isSelected
                              ? 'border-[#D66A78] bg-[#FDF2F3]/60 ring-1 ring-[#D66A78]'
                              : 'border-[#EAE5DF] bg-white hover:border-[#D66A78]/50'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                              isSelected ? 'bg-[#D66A78] border-[#D66A78] text-white' : 'border-stone-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>

                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5">
                                <Badge variant="accent" size="xs">
                                  {srv.category.replace('_', ' ').toUpperCase()}
                                </Badge>
                                {srv.price && Number(srv.price) > 1000 && (
                                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                    Popular
                                  </span>
                                )}
                              </div>
                              <span className="font-bold text-[#D66A78] text-sm font-mono">
                                {currency}{srv.price}
                              </span>
                            </div>

                            <h4 className="font-bold text-[#1E2433] text-xs sm:text-sm">
                              {language === 'hi' && srv.title_hi ? srv.title_hi : srv.title}
                            </h4>

                            <p className="text-[11px] text-[#566176] line-clamp-2 leading-relaxed">
                              {srv.description}
                            </p>

                            <div className="pt-1 flex items-center gap-3 text-[10px] text-[#8491A5]">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-[#C89B53]" />
                                {formatDuration(srv.duration_mins)}
                              </span>
                              <span className="flex items-center gap-1 text-emerald-700 font-medium">
                                <Home className="w-3 h-3" />
                                Doorstep Available
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeCatalogTab === 'packages' && (
                  <div className="space-y-3">
                    {packages.map((pkg) => {
                      const isSelected = selectedPackageIds.includes(pkg.id);
                      return (
                        <div
                          key={pkg.id}
                          onClick={() => togglePackage(pkg.id)}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 hover-lift ${
                            isSelected
                              ? 'border-[#D66A78] bg-[#FDF2F3]/60 ring-1 ring-[#D66A78]'
                              : 'border-[#EAE5DF] bg-white hover:border-[#D66A78]/50'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                              isSelected ? 'bg-[#D66A78] border-[#D66A78] text-white' : 'border-stone-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>

                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <Badge variant="gold" size="xs">Bundled Ritual Package</Badge>
                              <div className="flex items-baseline gap-1.5 font-mono">
                                {pkg.original_price && (
                                  <span className="text-xs text-[#8491A5] line-through">
                                    {currency}{pkg.original_price}
                                  </span>
                                )}
                                <span className="font-bold text-[#D66A78] text-sm">
                                  {currency}{pkg.price}
                                </span>
                              </div>
                            </div>

                            <h4 className="font-bold text-[#1E2433] text-xs sm:text-sm">
                              {pkg.name}
                            </h4>

                            <p className="text-[11px] text-[#566176] line-clamp-2 leading-relaxed">
                              {pkg.description}
                            </p>

                            <div className="pt-1 flex items-center gap-3 text-[10px] text-[#8491A5]">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-[#C89B53]" />
                                1 hr 30 min Total
                              </span>
                              {pkg.original_price && (
                                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                                  Save {currency}{Number(pkg.original_price) - Number(pkg.price)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: Selected Services Summary */}
              <div className="lg:col-span-5 glass-card rounded-2xl p-5 border border-[#EAE5DF] space-y-4 bg-white/80 sticky top-24">
                <div className="flex items-center justify-between border-b border-[#EAE5DF] pb-3">
                  <h3 className="font-serif font-bold text-sm text-[#1E2433]">
                    Selected Services Summary
                  </h3>
                  <span className="text-xs font-mono font-bold text-[#D66A78] bg-[#FAF4EB] px-2.5 py-0.5 rounded-full">
                    {selectedServices.length + selectedPackages.length} Items
                  </span>
                </div>

                {/* Itemized List */}
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {selectedServices.map((srv) => (
                    <div
                      key={srv.id}
                      className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DF] flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-bold text-[#1E2433] block truncate">
                          {srv.title}
                        </span>
                        <span className="text-[10px] text-[#8491A5] font-mono">
                          {currency}{srv.price} — {formatDuration(srv.duration_mins)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeService(srv.id)}
                        className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                        title="Remove service"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {selectedPackages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="p-2.5 rounded-xl bg-[#FAF4EB] border border-[#C89B53]/30 flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-bold text-[#1E2433] block truncate">
                          [Pkg] {pkg.name}
                        </span>
                        <span className="text-[10px] text-[#8491A5] font-mono">
                          {currency}{pkg.price} — 1 hr 30 min
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePackage(pkg.id)}
                        className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                        title="Remove package"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Subtotal & Duration Totals */}
                <div className="pt-3 border-t border-[#EAE5DF] space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-[#566176]">
                    <span>Total Duration:</span>
                    <span className="font-bold text-[#1E2433]">{formatDuration(totalDurationMins)}</span>
                  </div>
                  <div className="flex justify-between text-[#1E2433] font-serif font-bold text-base pt-1 border-t border-[#EAE5DF]">
                    <span>Subtotal:</span>
                    <span>{currency}{baseServiceAmount.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleNextStep}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Continue to {categoryConfig.specialistTerm.split('/')[0]}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: SPECIALIST / STAFF SELECTION */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="border-b border-[#EAE5DF] pb-3">
              <h2 className="font-serif font-bold text-lg text-[#1E2433]">
                STEP 2: Select Preferred {categoryConfig.specialistTerm}
              </h2>
              <p className="text-xs text-[#566176]">
                Choose a specific master practitioner or select "Any Available" for the fastest time slots.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => setSelectedStaffId(undefined)}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  selectedStaffId === undefined
                    ? 'border-[#D66A78] bg-[#FDF2F3]/60 ring-1 ring-[#D66A78]'
                    : 'border-[#EAE5DF] bg-white hover:border-[#D66A78]/50'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-[#FAF4EB] text-[#C89B53] flex items-center justify-center mx-auto mb-2">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-xs text-[#1E2433]">Any Available</h4>
                <p className="text-[10px] text-[#8491A5]">Fastest slotting</p>
              </button>

              {staffList.map((stf) => (
                <button
                  key={stf.id}
                  type="button"
                  onClick={() => setSelectedStaffId(stf.id)}
                  className={`p-4 rounded-2xl border text-center transition-all ${
                    selectedStaffId === stf.id
                      ? 'border-[#D66A78] bg-[#FDF2F3]/60 ring-1 ring-[#D66A78]'
                      : 'border-[#EAE5DF] bg-white hover:border-[#D66A78]/50'
                  }`}
                >
                  <img
                    src={stf.image_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                    alt={stf.name}
                    className="w-12 h-12 rounded-full object-cover mx-auto mb-2 border border-[#EAE5DF]"
                  />
                  <h4 className="font-bold text-xs text-[#1E2433] truncate">{stf.name}</h4>
                  <p className="text-[10px] text-[#8491A5] truncate">{stf.role_title}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: DATE + TIME SLOT */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE5DF] pb-3">
              <div>
                <h2 className="font-serif font-bold text-lg text-[#1E2433]">
                  STEP 3: Schedule Date & Time Slot
                </h2>
                <p className="text-xs text-[#566176]">
                  Real-time slot locking active • Guaranteed 0-wait booking
                </p>
              </div>

              {activeHoldTimer !== null && activeHoldTimer > 0 && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-bold">
                  <Lock className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                  <span>
                    Slot Locked for {Math.floor(activeHoldTimer / 60)}:
                    {activeHoldTimer % 60 < 10 ? `0${activeHoldTimer % 60}` : activeHoldTimer % 60}
                  </span>
                </div>
              )}
            </div>

            {holdErrorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{holdErrorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-[#1E2433] mb-1">Select Appointment Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#EAE5DF] rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#1E2433]">
                    Available Slots ({selectedDate})
                  </label>
                  <span className="text-[10px] text-[#8491A5] font-mono">+15m Buffer Rules</span>
                </div>

                {isLoadingSlots ? (
                  <div className="py-8 text-center text-xs text-[#8491A5] flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#D66A78]" />
                    <span>Calculating real-time slot availability...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 max-h-[220px] overflow-y-auto pr-1">
                    {dynamicSlots.map((s) => {
                      const isSelected = selectedTime === s.time;
                      return (
                        <button
                          key={s.time}
                          type="button"
                          disabled={!s.available}
                          onClick={() => handleSelectSlot(s.time)}
                          className={`py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-[#1E2433] text-white shadow-xs ring-2 ring-[#D66A78]'
                              : s.available
                              ? 'bg-white hover:bg-[#FDF2F3] text-[#1E2433] border border-[#EAE5DF]'
                              : 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed opacity-60 line-through'
                          }`}
                        >
                          {s.time}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: VISIT TYPE & OUTLET LOCATION */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-fade-in">
            <div className="border-b border-[#EAE5DF] pb-3">
              <h2 className="font-serif font-bold text-lg text-[#1E2433]">
                STEP 4: Select Service Visit Mode & Branch Outlet
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setBookingMode('online')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  bookingMode === 'online'
                    ? 'border-[#D66A78] bg-[#FDF2F3]/60 ring-1 ring-[#D66A78]'
                    : 'border-[#EAE5DF] bg-white'
                }`}
              >
                <Building2 className="w-5 h-5 text-[#D66A78] mb-1.5" />
                <h3 className="font-bold text-[#1E2433] text-xs">At Studio Outlet</h3>
                <p className="text-[11px] text-[#566176]">Visit our luxury atelier location</p>
              </button>

              <button
                type="button"
                onClick={() => setBookingMode('home_service')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  bookingMode === 'home_service'
                    ? 'border-[#D66A78] bg-[#FDF2F3]/60 ring-1 ring-[#D66A78]'
                    : 'border-[#EAE5DF] bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Home className="w-5 h-5 text-[#D66A78] mb-1.5" />
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold font-mono">
                    +{currency}{homeTravelFee} Travel
                  </span>
                </div>
                <h3 className="font-bold text-[#1E2433] text-xs">Doorstep Home Concierge</h3>
                <p className="text-[11px] text-[#566176]">Specialist arrives at your doorstep</p>
              </button>
            </div>

            {bookingMode === 'home_service' ? (
              <div>
                <label className="block text-xs font-bold text-[#1E2433] mb-1">
                  Complete Delivery Address & Landmark *
                </label>
                <textarea
                  rows={2}
                  required
                  value={homeAddress}
                  onChange={(e) => setHomeAddress(e.target.value)}
                  placeholder="Flat/House No., Building, Street, Landmark, Pin code"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#EAE5DF] rounded-xl text-xs"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-[#1E2433] mb-2">Select Outlet Branch</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {branches.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSelectedBranchId(b.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        selectedBranchId === b.id
                          ? 'border-[#D66A78] bg-[#FDF2F3]/60 ring-1 ring-[#D66A78]'
                          : 'border-[#EAE5DF] bg-white'
                      }`}
                    >
                      <span className="font-bold text-[#1E2433] text-xs block">{b.name}</span>
                      <span className="text-[11px] text-[#566176]">{b.address}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 5: COUPON / OFFER */}
        {currentStep === 5 && (
          <div className="space-y-4 animate-fade-in">
            <div className="border-b border-[#EAE5DF] pb-3">
              <h2 className="font-serif font-bold text-lg text-[#1E2433]">
                STEP 5: Apply Promotional Coupons & Rewards
              </h2>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-[#1E2433]">Enter Coupon / Voucher Code</label>
              <div className="flex gap-2 max-w-md">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. GLOW20"
                  className="flex-1 px-3.5 py-2.5 bg-white border border-[#EAE5DF] rounded-xl text-xs font-mono uppercase"
                />
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleApplyCoupon}
                  isLoading={isValidatingCoupon}
                  disabled={!couponCode.trim()}
                >
                  Apply Code
                </Button>
              </div>

              {appliedCoupon && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
                  <span>Code {appliedCoupon.code} applied successfully!</span>
                  <span>-{currency}{appliedCoupon.discount_amount} Off</span>
                </div>
              )}

              {couponError && <p className="text-xs text-rose-600 font-medium">{couponError}</p>}
            </div>
          </div>
        )}

        {/* STEP 6: CUSTOMER INFORMATION + OTP SIMULATION */}
        {currentStep === 6 && (
          <div className="space-y-4 animate-fade-in">
            <div className="border-b border-[#EAE5DF] pb-3 flex items-center justify-between">
              <div>
                <h2 className="font-serif font-bold text-lg text-[#1E2433]">
                  STEP 6: Customer Details & WhatsApp OTP Verification
                </h2>
                <p className="text-xs text-[#566176]">Verify contact info for instant WhatsApp receipts</p>
              </div>
              {user && <Badge variant="success" size="xs">Verified Profile</Badge>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-[#1E2433] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Priya Kapoor"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#EAE5DF] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E2433] mb-1">WhatsApp Phone Number *</label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    required
                    value={guestPhone}
                    onChange={(e) => {
                      setGuestPhone(e.target.value);
                      setIsOtpVerified(false);
                    }}
                    placeholder="+91 98765 43210"
                    className="flex-1 px-3.5 py-2.5 bg-white border border-[#EAE5DF] rounded-xl text-xs"
                  />
                  {!isOtpVerified && (
                    <Button type="button" variant="outline" size="sm" onClick={handleSendOtp}>
                      Send OTP
                    </Button>
                  )}
                </div>
              </div>

              {/* OTP Input Simulation */}
              {isOtpSent && !isOtpVerified && (
                <div className="sm:col-span-2 p-4 rounded-2xl bg-[#FAF4EB] border border-[#EAE5DF] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#1E2433]">Enter 6-Digit WhatsApp OTP</span>
                    <span className="text-[10px] text-[#C89B53] font-mono">Test Code: 123456</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value)}
                      placeholder="123456"
                      className="flex-1 px-3.5 py-2 bg-white border border-[#EAE5DF] rounded-xl font-mono text-center tracking-widest text-sm"
                    />
                    <Button type="button" variant="primary" size="sm" onClick={handleVerifyOtp}>
                      Verify OTP
                    </Button>
                  </div>
                </div>
              )}

              {isOtpVerified && (
                <div className="sm:col-span-2 p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp Phone Verified</span>
                </div>
              )}

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#1E2433] mb-1">Email Address</label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="priya@example.com"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#EAE5DF] rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Mandatory Protocol Checkboxes */}
            <div className="pt-3 border-t border-[#EAE5DF] space-y-2 text-xs">
              {categoryConfig.formFields.ageVerificationRequired && (
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ageConfirmed}
                    onChange={(e) => setAgeConfirmed(e.target.checked)}
                    className="mt-0.5 text-[#D66A78] rounded"
                  />
                  <span className="text-[#1E2433] font-semibold">I confirm that I am at least 18 years of age.</span>
                </label>
              )}

              {categoryConfig.formFields.consentWaiverRequired && (
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentWaiverAgreed}
                    onChange={(e) => setConsentWaiverAgreed(e.target.checked)}
                    className="mt-0.5 text-[#D66A78] rounded"
                  />
                  <span className="text-[#566176]">I sign the digital hygiene and liability waiver.</span>
                </label>
              )}
            </div>
          </div>
        )}

        {/* STEP 7: PAYMENT */}
        {currentStep === 7 && (
          <div className="space-y-4 animate-fade-in">
            <div className="border-b border-[#EAE5DF] pb-3">
              <h2 className="font-serif font-bold text-lg text-[#1E2433]">
                STEP 7: Payment Options & Order Summary
              </h2>
            </div>

            <div className="space-y-3">
              <div
                onClick={() => setPaymentOption('advance_online')}
                className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentOption === 'advance_online'
                    ? 'border-[#D66A78] bg-[#FDF2F3]/60 ring-1 ring-[#D66A78]'
                    : 'border-[#EAE5DF] bg-white'
                }`}
              >
                <div>
                  <span className="font-bold text-[#1E2433] text-xs block">
                    Advance Deposit ({advancePct * 100}%)
                  </span>
                  <span className="text-[11px] text-[#566176]">Pay remainder at studio counter</span>
                </div>
                <span className="font-mono font-bold text-sm text-[#D66A78]">
                  {currency}{calculatedAdvanceAmount.toFixed(2)}
                </span>
              </div>

              <div
                onClick={() => setPaymentOption('full_online')}
                className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentOption === 'full_online'
                    ? 'border-[#D66A78] bg-[#FDF2F3]/60 ring-1 ring-[#D66A78]'
                    : 'border-[#EAE5DF] bg-white'
                }`}
              >
                <div>
                  <span className="font-bold text-[#1E2433] text-xs block">Full Online Pre-Payment</span>
                  <span className="text-[11px] text-[#566176]">100% Settled</span>
                </div>
                <span className="font-mono font-bold text-sm text-[#D66A78]">
                  {currency}{finalTotalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Price Summary Breakdown */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DF] space-y-2 text-xs font-mono">
              <div className="flex justify-between text-[#566176]">
                <span>Services & Packages ({selectedServices.length + selectedPackages.length}):</span>
                <span>{currency}{baseServiceAmount.toFixed(2)}</span>
              </div>
              {travelFee > 0 && (
                <div className="flex justify-between text-[#566176]">
                  <span>Doorstep Travel Fee:</span>
                  <span>{currency}{travelFee.toFixed(2)}</span>
                </div>
              )}
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Discount:</span>
                  <span>-{currency}{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#566176]">
                <span>Taxes ({taxRate * 100}%):</span>
                <span>{currency}{taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#1E2433] font-bold text-sm pt-2 border-t border-[#EAE5DF]">
                <span>Final Total:</span>
                <span>{currency}{finalTotalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Stepper Footer Action Buttons */}
        <div className="pt-6 border-t border-[#EAE5DF] flex items-center justify-between">
          {currentStep > 1 ? (
            <Button variant="outline" size="sm" onClick={handlePrevStep} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Previous
            </Button>
          ) : (
            <span />
          )}

          <Button
            variant="primary"
            onClick={handleNextStep}
            isLoading={isSubmitting}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {currentStep === 7 ? 'Complete Reservation' : 'Continue to Next Step'}
          </Button>
        </div>
      </div>
    </div>
  );
};
