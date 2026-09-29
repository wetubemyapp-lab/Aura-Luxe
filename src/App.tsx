/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { BusinessProvider, useBusiness } from './context/BusinessContext.tsx';
import { CustomerPageTab, AdminPageTab } from './types/index.ts';

import { Header } from './components/common/Header.tsx';
import { Footer } from './components/common/Footer.tsx';
import { MobileBottomNav } from './components/common/MobileBottomNav.tsx';
import { AuthModal } from './components/auth/AuthModal.tsx';

import { HomePage } from './pages/customer/HomePage.tsx';
import { ServicesPage } from './pages/customer/ServicesPage.tsx';
import { BookingPage } from './pages/customer/BookingPage.tsx';
import { MyBookingsPage } from './pages/customer/MyBookingsPage.tsx';
import { AboutPage } from './pages/customer/AboutPage.tsx';
import { ServiceDetailPage } from './pages/customer/ServiceDetailPage.tsx';
import { PackagesOffersPage } from './pages/customer/PackagesOffersPage.tsx';
import { TeamPage } from './pages/customer/TeamPage.tsx';
import { MediaReviewsPage } from './pages/customer/MediaReviewsPage.tsx';
import { ContactLocationFAQPage } from './pages/customer/ContactLocationFAQPage.tsx';
import { LegalPolicyPage } from './pages/customer/LegalPolicyPage.tsx';
import { UserProfilePage } from './pages/customer/UserProfilePage.tsx';
import { OptionalModulesPage } from './pages/customer/OptionalModulesPage.tsx';

import { AdminLayout } from './layouts/AdminLayout.tsx';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage.tsx';
import { AdminWebsitePage } from './pages/admin/AdminWebsitePage.tsx';
import { AdminBranchesPage } from './pages/admin/AdminBranchesPage.tsx';
import { AdminServicesPage } from './pages/admin/AdminServicesPage.tsx';
import { AdminBookingsPage } from './pages/admin/AdminBookingsPage.tsx';
import { AdminLedgerPage } from './pages/admin/AdminLedgerPage.tsx';
import { AdminAICopilotPage } from './pages/admin/AdminAICopilotPage.tsx';
import { AdminStaffPage } from './pages/admin/AdminStaffPage.tsx';
import { AdminPackagesPage } from './pages/admin/AdminPackagesPage.tsx';
import { AdminMarketingPage } from './pages/admin/AdminMarketingPage.tsx';
import { AdminMediaReviewsPage } from './pages/admin/AdminMediaReviewsPage.tsx';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage.tsx';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage.tsx';
import { AdminNotificationsPage } from './pages/admin/AdminNotificationsPage.tsx';
import { SEOManager } from './components/seo/SEOManager.tsx';

import { ToastProvider } from './components/ui/Toast.tsx';

function MainApp() {
  const { user } = useAuth();
  const [activePortal, setActivePortal] = useState<'customer' | 'admin'>('customer');
  const [customerTab, setCustomerTab] = useState<CustomerPageTab>('website');
  const [adminTab, setAdminTab] = useState<AdminPageTab>('dashboard');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [preselectedServiceId, setPreselectedServiceId] = useState<number | undefined>(undefined);

  const handleNavigateToBooking = (serviceId?: number) => {
    if (serviceId) {
      setPreselectedServiceId(serviceId);
    }
    setCustomerTab('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToServices = () => {
    setCustomerTab('services');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToMyBookings = () => {
    setCustomerTab('my-bookings');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1E2433] selection:bg-[#D66A78] selection:text-white">
      {activePortal === 'customer' ? (
        <>
          <SEOManager currentTab={customerTab} />
          <Header
            currentTab={customerTab}
            onSelectTab={(tab) => {
              setCustomerTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenAuth={() => setAuthModalOpen(true)}
            onSwitchToAdmin={() => setActivePortal('admin')}
          />

          <main className="flex-1 pb-16 md:pb-0">
            {(customerTab === 'home' || customerTab === 'website') && (
              <HomePage
                onNavigateToBooking={handleNavigateToBooking}
                onNavigateToServices={handleNavigateToServices}
              />
            )}

            {customerTab === 'about' && (
              <AboutPage
                onNavigateToBooking={() => handleNavigateToBooking()}
                onNavigateToServices={() => handleNavigateToServices()}
              />
            )}

            {customerTab === 'services' && (
              <ServicesPage
                onSelectServiceForBooking={handleNavigateToBooking}
              />
            )}

            {customerTab === 'service-detail' && (
              <ServiceDetailPage
                serviceId={preselectedServiceId}
                onBack={() => setCustomerTab('services')}
                onBookService={(id) => handleNavigateToBooking(id)}
              />
            )}

            {(customerTab === 'packages' || customerTab === 'offers' || customerTab === 'coupons') && (
              <PackagesOffersPage
                initialTab={customerTab === 'packages' ? 'packages' : customerTab === 'offers' ? 'offers' : 'coupons'}
                onNavigateToBooking={(id) => handleNavigateToBooking(id)}
              />
            )}

            {(customerTab === 'team' || customerTab === 'team-detail') && (
              <TeamPage
                onNavigateToBooking={(id) => handleNavigateToBooking(id)}
              />
            )}

            {(customerTab === 'gallery' || customerTab === 'videos' || customerTab === 'reviews') && (
              <MediaReviewsPage
                initialTab={customerTab === 'gallery' ? 'gallery' : customerTab === 'videos' ? 'videos' : 'reviews'}
                onNavigateToBooking={() => handleNavigateToBooking()}
              />
            )}

            {(customerTab === 'contact' || customerTab === 'location' || customerTab === 'faq') && (
              <ContactLocationFAQPage
                initialTab={customerTab === 'contact' ? 'contact' : customerTab === 'location' ? 'location' : 'faq'}
                onNavigateToBooking={() => handleNavigateToBooking()}
              />
            )}

            {(customerTab === 'privacy' || customerTab === 'terms' || customerTab === 'cancellation-policy') && (
              <LegalPolicyPage
                initialTab={customerTab === 'privacy' ? 'privacy' : customerTab === 'terms' ? 'terms' : 'cancellation-policy'}
              />
            )}

            {customerTab === 'profile' && (
              <UserProfilePage
                onNavigateToBooking={() => handleNavigateToBooking()}
                onNavigateToBookings={handleNavigateToMyBookings}
                onOpenAuth={() => setAuthModalOpen(true)}
              />
            )}

            {(customerTab === 'blog' ||
              customerTab === 'membership' ||
              customerTab === 'gift-cards' ||
              customerTab === 'bridal' ||
              customerTab === 'home-service' ||
              customerTab === 'corporate') && (
              <OptionalModulesPage
                moduleType={customerTab as any}
                onNavigateToBooking={() => handleNavigateToBooking()}
              />
            )}

            {(customerTab === 'book' || customerTab === 'booking') && (
              <BookingPage
                initialServiceId={preselectedServiceId}
                onNavigateToMyBookings={handleNavigateToMyBookings}
                onOpenAuth={() => setAuthModalOpen(true)}
              />
            )}

            {customerTab === 'my-bookings' && (
              <MyBookingsPage
                onOpenAuth={() => setAuthModalOpen(true)}
                onNavigateToBooking={() => handleNavigateToBooking()}
              />
            )}
          </main>

          <Footer onSelectTab={(tab) => setCustomerTab(tab)} />

          {/* Customer Mobile Sticky Bottom Navigation Bar */}
          <MobileBottomNav
            currentTab={customerTab}
            onSelectTab={(tab) => {
              setCustomerTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenAuth={() => setAuthModalOpen(true)}
            onSwitchToAdmin={() => setActivePortal('admin')}
          />

          <AuthModal
            isOpen={authModalOpen}
            onClose={() => setAuthModalOpen(false)}
          />
        </>
      ) : (
        <AdminLayout
          currentTab={adminTab}
          onSelectTab={(tab) => setAdminTab(tab)}
          onSwitchToCustomer={() => setActivePortal('customer')}
        >
          {adminTab === 'dashboard' && (
            <AdminDashboardPage onNavigateTab={(tab) => setAdminTab(tab)} />
          )}

          {adminTab === 'bookings' && <AdminBookingsPage />}

          {adminTab === 'calendar' && <div className="p-8">Calendar View (Coming Soon)</div>}
          {adminTab === 'customers' && <div className="p-8">Customer Management (Coming Soon)</div>}
          {adminTab === 'payments' && <AdminLedgerPage />}
          {adminTab === 'reports' && <div className="p-8">Reports View (Coming Soon)</div>}
          {adminTab === 'website' && <AdminWebsitePage />}
          
          {adminTab === 'ai-copilot' && <AdminAICopilotPage />}

          {adminTab === 'notifications' && <AdminNotificationsPage />}

          {adminTab === 'services' && <AdminServicesPage />}

          {adminTab === 'staff' && <AdminStaffPage />}

          {adminTab === 'packages' && <AdminPackagesPage />}

          {adminTab === 'offers' && <AdminMarketingPage viewMode="offers" />}

          {adminTab === 'coupons' && <AdminMarketingPage viewMode="coupons" />}

          {adminTab === 'gallery' && <AdminMediaReviewsPage viewMode="gallery" />}

          {adminTab === 'videos' && <AdminMediaReviewsPage viewMode="videos" />}

          {adminTab === 'reviews' && <AdminMediaReviewsPage viewMode="reviews" />}

          {adminTab === 'audit-logs' && <AdminAuditLogsPage />}

          {adminTab === 'settings' && <AdminSettingsPage />}
        </AdminLayout>
      )}
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BusinessProvider>
          <ToastProvider>
            <MainApp />
          </ToastProvider>
        </BusinessProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
