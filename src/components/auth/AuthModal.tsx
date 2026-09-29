import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { UserRole } from '../../types/index.ts';
import { X, Lock, Mail, User, Phone, Sparkles, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
  defaultRole?: UserRole;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
  defaultRole = 'customer',
}) => {
  const { login, register, quickLogin } = useAuth();
  const { t, language } = useLanguage();

  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [role, setRole] = useState<UserRole>(defaultRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (!res.success) {
          setError(res.error || 'Failed to login');
        } else {
          onClose();
        }
      } else {
        const res = await register({ name, email, password, phone, role });
        if (!res.success) {
          setError(res.error || 'Failed to register');
        } else {
          onClose();
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (targetRole: UserRole) => {
    setLoading(true);
    setError(null);
    try {
      await quickLogin(targetRole);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#FAF8F5] border border-[#EAE5DF] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header decoration */}
        <div className="bg-[#1E2433] px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-[#D66A78] flex items-center justify-center text-white font-bold text-sm">
              AL
            </span>
            <div>
              <h2 className="text-lg font-serif tracking-wide font-medium">
                {mode === 'login' ? t('sign_in') : t('sign_up')}
              </h2>
              <p className="text-xs text-slate-300">Aura Luxe Platform OS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Quick Demo Login Bar */}
          <div className="mb-5 p-3.5 bg-[#FDF2F3]/60 border border-[#D66A78]/20 rounded-xl">
            <p className="text-xs font-semibold text-[#1E2433] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C89B53]" />
              {t('quick_demo_login')}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('customer')}
                disabled={loading}
                className="py-1.5 px-3 bg-white border border-[#EAE5DF] hover:border-[#D66A78] rounded-lg text-xs font-medium text-[#1E2433] transition-all flex items-center justify-center gap-1 shadow-xs"
              >
                <User className="w-3.5 h-3.5 text-[#D66A78]" />
                {t('role_customer')}
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                disabled={loading}
                className="py-1.5 px-3 bg-[#1E2433] hover:bg-[#2A3347] rounded-lg text-xs font-medium text-white transition-all flex items-center justify-center gap-1 shadow-xs"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#C89B53]" />
                {t('role_admin')}
              </button>
            </div>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex border-b border-[#EAE5DF] mb-5">
            <button
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`flex-1 pb-2.5 text-sm font-medium transition-all ${
                mode === 'login'
                  ? 'border-b-2 border-[#D66A78] text-[#1E2433] font-semibold'
                  : 'text-[#8491A5] hover:text-[#1E2433]'
              }`}
            >
              {t('sign_in')}
            </button>
            <button
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`flex-1 pb-2.5 text-sm font-medium transition-all ${
                mode === 'register'
                  ? 'border-b-2 border-[#D66A78] text-[#1E2433] font-semibold'
                  : 'text-[#8491A5] hover:text-[#1E2433]'
              }`}
            >
              {t('sign_up')}
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {language === 'hi' ? 'पूरा नाम' : 'Full Name'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Aditi Roy"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-[#D8CEBE] rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E07A5F]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {language === 'hi' ? 'फोन नंबर (वैकल्पिक)' : 'Phone Number (Optional)'}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 00000"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-[#D8CEBE] rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E07A5F]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {language === 'hi' ? 'खाता प्रकार' : 'Account Role'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('customer')}
                      className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                        role === 'customer'
                          ? 'bg-[#FAF0E6] border-[#E07A5F] text-[#0F172A] font-semibold'
                          : 'bg-white border-[#D8CEBE] text-slate-600'
                      }`}
                    >
                      {t('role_customer')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('admin')}
                      className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                        role === 'admin'
                          ? 'bg-[#FAF0E6] border-[#E07A5F] text-[#0F172A] font-semibold'
                          : 'bg-white border-[#D8CEBE] text-slate-600'
                      }`}
                    >
                      {t('role_admin')}
                    </button>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-[#1E2433] mb-1">
                {language === 'hi' ? 'ईमेल' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8491A5] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 glass-input rounded-lg text-sm text-[#1E2433]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1E2433] mb-1">
                {language === 'hi' ? 'पासवर्ड' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8491A5] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 glass-input rounded-lg text-sm text-[#1E2433]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary-accent w-full mt-2 py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all shadow-xs disabled:opacity-50"
            >
              {loading
                ? language === 'hi' ? 'कृपया प्रतीक्षा करें...' : 'Processing...'
                : mode === 'login'
                ? t('sign_in')
                : t('sign_up')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
