import React, { useState, useEffect } from 'react';
import { UsersService } from '../../services/users.service';
import { useRouter } from '../../context/RouterContext';
import { 
  Mail, 
  Phone, 
  Lock, 
  User, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  ArrowRight, 
  ShieldCheck, 
  LogIn, 
  UserPlus, 
  X,
  Smartphone,
  Check,
  KeyRound,
  ArrowLeft
} from 'lucide-react';

interface AuthPageProps {
  initialMode?: 'login' | 'signup' | 'forgot_password' | 'reset_password';
  onClose?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'login', onClose }) => {
  const { route, navigateTo } = useRouter();

  const getRedirectTarget = (userRole?: string) => {
    const rawRole = userRole || UsersService.getProfile().role;
    const normalizedRole = rawRole?.toLowerCase().replace(/\s+/g, '_');

    if (normalizedRole === 'super_admin') {
      const redirect = route.searchParams.redirect ? decodeURIComponent(route.searchParams.redirect) : null;
      if (redirect && redirect.startsWith('/admin')) {
        return redirect;
      }
      return '/admin/dashboard';
    }

    if (normalizedRole === 'advertiser') {
      const redirect = route.searchParams.redirect ? decodeURIComponent(route.searchParams.redirect) : null;
      // An advertiser must NOT be redirected to admin routes
      if (redirect && !redirect.startsWith('/admin')) {
        return redirect;
      }
      return '/dashboard';
    }

    if (route.searchParams.redirect) {
      const redirect = decodeURIComponent(route.searchParams.redirect);
      if (!redirect.startsWith('/admin')) {
        return redirect;
      }
    }
    return '/dashboard';
  };

  const [mode, setMode] = useState<
    'login' | 'signup' | 'forgot_password' | 'reset_password' | 'verify_email' | 'verify_phone' | 'success'
  >(initialMode);
  
  // Form States - Signup
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  // Login States
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Forgot / Reset Password States
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [resetPasswordVal, setResetPasswordVal] = useState('');
  const [resetPasswordConfirm, setResetPasswordConfirm] = useState('');
  
  // Verification Code States
  const [emailCode, setEmailCode] = useState(['', '', '', '', '', '']);
  const [phoneOtp, setPhoneOtp] = useState(['', '', '', '', '', '']);
  
  // Timers and Resends
  const [emailTimer, setEmailTimer] = useState(30);
  const [phoneTimer, setPhoneTimer] = useState(30);
  const [canResendEmail, setCanResendEmail] = useState(false);
  const [canResendPhone, setCanResendPhone] = useState(false);
  
  // Error / Toast alerts
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Active registered user temp info
  const [registeredUser, setRegisteredUser] = useState<{ email: string; phone: string } | null>(null);

  // Auto-detect reset token in query params
  useEffect(() => {
    if (route.searchParams.token) {
      setResetToken(route.searchParams.token);
      if (route.searchParams.email) {
        setResetEmail(route.searchParams.email);
      }
      setMode('reset_password');
    }
  }, [route.searchParams]);

  // Countdown timers
  useEffect(() => {
    let eInterval: NodeJS.Timeout;
    if (mode === 'verify_email' && emailTimer > 0) {
      eInterval = setInterval(() => {
        setEmailTimer((prev) => {
          if (prev <= 1) {
            setCanResendEmail(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(eInterval);
  }, [mode, emailTimer]);

  useEffect(() => {
    let pInterval: NodeJS.Timeout;
    if (mode === 'verify_phone' && phoneTimer > 0) {
      pInterval = setInterval(() => {
        setPhoneTimer((prev) => {
          if (prev <= 1) {
            setCanResendPhone(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(pInterval);
  }, [mode, phoneTimer]);

  // Handle single key inputs in multi-digit input blocks
  const handleDigitChange = (
    value: string, 
    index: number, 
    type: 'email' | 'phone',
    targetArray: string[],
    setTargetArray: React.Dispatch<React.SetStateAction<string[]>>,
    nextIdPrefix: string
  ) => {
    const cleanVal = value.replace(/[^0-9]/g, '').slice(-1);
    const newArr = [...targetArray];
    newArr[index] = cleanVal;
    setTargetArray(newArr);

    // Auto-focus next input box if filled
    if (cleanVal && index < 5) {
      const nextInput = document.getElementById(`${nextIdPrefix}-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
    type: 'email' | 'phone',
    targetArray: string[],
    setTargetArray: React.Dispatch<React.SetStateAction<string[]>>,
    prevIdPrefix: string
  ) => {
    if (e.key === 'Backspace' && !targetArray[index] && index > 0) {
      const prevInput = document.getElementById(`${prevIdPrefix}-${index - 1}`);
      prevInput?.focus();
    }
  };

  // 1. Submit Login (POST /auth/login)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    if (!loginId || !loginPassword) {
      setError('Please fill in all login credentials.');
      return;
    }

    setLoading(true);
    try {
      const profile = await UsersService.login(loginId, loginPassword);
      setSuccessMsg('Logged in successfully!');
      
      const userRole = profile?.role || (profile?.roles && profile.roles[0]);

      setTimeout(() => {
        if (!UsersService.isFullyVerified()) {
          setMode('verify_email');
        } else {
          navigateTo(getRedirectTarget(userRole));
          if (onClose) onClose();
        }
      }, 800);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Submit Registration (POST /auth/register)
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!name || !email || !phone || !password) {
      setError('All registration fields are required.');
      return;
    }

    if (!termsAccepted) {
      setError('You must accept the terms of service & advertiser disclosure.');
      return;
    }

    setLoading(true);
    try {
      await UsersService.register({
        name,
        email,
        phone,
        password
      });
      
      setRegisteredUser({ email, phone });
      setSuccessMsg('Account created successfully!');
      
      setTimeout(() => {
        setMode('verify_email');
        setSuccessMsg(null);
      }, 1000);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Submit Forgot Password (POST /auth/forgot-password)
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!forgotEmail) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    try {
      const msg = await UsersService.forgotPassword(forgotEmail);
      setSuccessMsg(msg || 'Password reset link sent to your email.');
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Unable to send password reset link.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Submit Reset Password (POST /auth/reset-password)
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!resetEmail || !resetToken || !resetPasswordVal) {
      setError('Email, token, and new password are required.');
      return;
    }

    if (resetPasswordVal !== resetPasswordConfirm) {
      setError('Passwords do not match.');
      return;
    }

    if (resetPasswordVal.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      const msg = await UsersService.resetPassword({
        email: resetEmail,
        token: resetToken,
        password: resetPasswordVal,
        password_confirmation: resetPasswordConfirm
      });
      setSuccessMsg(msg || 'Password has been reset successfully. Redirecting to login...');
      setTimeout(() => {
        setSuccessMsg(null);
        setMode('login');
      }, 1800);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Password reset failed. Invalid or expired token.');
    } finally {
      setLoading(false);
    }
  };

  // Resend functions
  const resendEmailCode = () => {
    setCanResendEmail(false);
    setEmailTimer(30);
    setSuccessMsg('A fresh verification code has been dispatched to your email.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const resendPhoneOtp = () => {
    setCanResendPhone(false);
    setPhoneTimer(30);
    setSuccessMsg('A new 6-digit OTP SMS code has been sent to your mobile.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Verify Email Code
  const handleVerifyEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const codeString = emailCode.join('');
    
    if (codeString.length < 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    if (codeString === '123456') {
      setLoading(true);
      setTimeout(() => {
        UsersService.verifyEmail();
        setSuccessMsg('Email address verified successfully!');
        setLoading(false);
        setTimeout(() => {
          setSuccessMsg(null);
          setMode('verify_phone');
        }, 1000);
      }, 600);
    } else {
      setError('Invalid email verification code. Hint: Use 123456');
    }
  };

  // Verify Phone OTP Code
  const handleVerifyPhone = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const otpString = phoneOtp.join('');

    if (otpString.length < 6) {
      setError('Please enter the complete 6-digit OTP.');
      return;
    }

    if (otpString === '888888') {
      setLoading(true);
      setTimeout(() => {
        UsersService.verifyPhone();
        setSuccessMsg('Phone number authenticated!');
        setLoading(false);
        setTimeout(() => {
          setMode('success');
        }, 1000);
      }, 600);
    } else {
      setError('Invalid SMS OTP. Hint: Use 888888');
    }
  };

  // Final access trigger
  const handleEnterPlatform = () => {
    const profile = UsersService.getProfile();
    const userRole = profile?.role || (profile?.roles && profile.roles[0]);
    navigateTo(getRedirectTarget(userRole));
    if (onClose) onClose();
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-slate-50/50 px-4 py-12 md:py-16">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden transition-all duration-300">
        
        {/* Upper Accent Header */}
        <div className="bg-slate-900 text-white px-6 py-8 relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-indigo-600 p-1.5 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-indigo-100" />
            </span>
            <span className="text-xs font-mono tracking-widest text-slate-400 uppercase font-bold">
              Secure Access Gate
            </span>
          </div>
          
          {mode === 'login' && (
            <>
              <h2 className="text-2xl font-bold tracking-tight">Sign In to Account</h2>
              <p className="text-xs text-slate-400 mt-1">Unlock companion classifieds, promote ads, and access collections.</p>
            </>
          )}

          {mode === 'signup' && (
            <>
              <h2 className="text-2xl font-bold tracking-tight">Register New Profile</h2>
              <p className="text-xs text-slate-400 mt-1">Complete instant registration to securely list your classified ads.</p>
            </>
          )}

          {mode === 'forgot_password' && (
            <>
              <h2 className="text-2xl font-bold tracking-tight">Forgot Password</h2>
              <p className="text-xs text-slate-400 mt-1">Request a secure password reset link for your account.</p>
            </>
          )}

          {mode === 'reset_password' && (
            <>
              <h2 className="text-2xl font-bold tracking-tight">Reset Password</h2>
              <p className="text-xs text-slate-400 mt-1">Set a new password for your account using your security token.</p>
            </>
          )}

          {(mode === 'verify_email' || mode === 'verify_phone') && (
            <>
              <h2 className="text-2xl font-bold tracking-tight">Double Verification</h2>
              <p className="text-xs text-slate-400 mt-1">Confirm identity to authorize active platform access.</p>
            </>
          )}

          {mode === 'success' && (
            <>
              <h2 className="text-2xl font-bold tracking-tight text-emerald-400">Profile Activated!</h2>
              <p className="text-xs text-slate-400 mt-1">Both email and mobile verifications successfully authorized.</p>
            </>
          )}

          {onClose && (
            <button 
              onClick={onClose}
              className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 space-y-6">
          
          {/* Messages Alert */}
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs flex items-start gap-2.5 animate-pulse">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-xs flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* VIEW 1: LOGIN MODE (POST /auth/login) */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Email or Registered Phone
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    id="login-id"
                    type="text"
                    required
                    placeholder="Enter email or phone number"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Password
                  </label>
                  <button 
                    type="button" 
                    onClick={() => { setMode('forgot_password'); setError(null); setSuccessMsg(null); }}
                    className="text-xs text-indigo-600 hover:underline font-semibold"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="login-password"
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Login & Authorize</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <p className="text-xs text-slate-500">
                  Don't have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('signup'); setError(null); setSuccessMsg(null); }}
                    className="font-bold text-indigo-600 hover:underline"
                  >
                    Register Profile
                  </button>
                </p>
              </div>

            </form>
          )}

          {/* VIEW 2: SIGN UP MODE (POST /auth/register) */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Full Name / Agency Title
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    id="signup-name"
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    id="signup-email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    id="signup-phone"
                    type="tel"
                    placeholder="+91 99999 88888"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Password (min. 8 characters)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="signup-password"
                    type="password"
                    required
                    minLength={8}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white"
                  />
                </div>
              </div>

              {/* Legal Terms Checkbox */}
              <label className="flex items-start gap-2 text-[11px] text-slate-500 leading-normal cursor-pointer hover:text-slate-700">
                <input
                  id="signup-terms"
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 mt-0.5"
                />
                <span>
                  I declare that I am 18+ years of age, and I agree to the{' '}
                  <span className="font-semibold text-slate-700 underline">Terms of Use</span> &{' '}
                  <span className="font-semibold text-slate-700 underline">Privacy Policy</span>.
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Register & Verify Account</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <p className="text-xs text-slate-500">
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(null); setSuccessMsg(null); }}
                    className="font-bold text-indigo-600 hover:underline"
                  >
                    Login here
                  </button>
                </p>
              </div>

            </form>
          )}

          {/* VIEW 3: FORGOT PASSWORD MODE (POST /auth/forgot-password) */}
          {mode === 'forgot_password' && (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Registered Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    <span>Send Password Reset Link</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(null); setSuccessMsg(null); }}
                  className="text-slate-500 hover:text-slate-700 font-semibold flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Login</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('reset_password'); setError(null); setSuccessMsg(null); }}
                  className="text-indigo-600 hover:underline font-semibold"
                >
                  Have a Reset Token?
                </button>
              </div>
            </form>
          )}

          {/* VIEW 4: RESET PASSWORD MODE (POST /auth/reset-password) */}
          {mode === 'reset_password' && (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Account Email
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    id="reset-email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Reset Token
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </span>
                  <input
                    id="reset-token"
                    type="text"
                    required
                    placeholder="Paste reset token from email"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  New Password
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="reset-password-val"
                    type="password"
                    required
                    minLength={8}
                    placeholder="••••••••••••"
                    value={resetPasswordVal}
                    onChange={(e) => setResetPasswordVal(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Confirm New Password
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="reset-password-confirm"
                    type="password"
                    required
                    minLength={8}
                    placeholder="••••••••••••"
                    value={resetPasswordConfirm}
                    onChange={(e) => setResetPasswordConfirm(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Reset & Update Password</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(null); setSuccessMsg(null); }}
                  className="text-xs font-bold text-indigo-600 hover:underline"
                >
                  Return to Login
                </button>
              </div>
            </form>
          )}

          {/* VIEW: EMAIL VERIFICATION */}
          {mode === 'verify_email' && (
            <form onSubmit={handleVerifyEmail} className="space-y-5">
              
              {/* Step indicator */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider font-mono">
                  Step 1 of 2: Email Approval
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  Pending Verification
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full w-1/2 transition-all duration-500" />
              </div>

              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Verify Email Address</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  We have dispatched a verification link and code to your registered email address:{' '}
                  <span className="font-semibold text-slate-800">{registeredUser?.email || UsersService.getProfile().email}</span>.
                </p>
              </div>

              {/* Digit Inputs Grid */}
              <div className="space-y-2">
                <div className="flex justify-center gap-2">
                  {emailCode.map((digit, index) => (
                    <input
                      key={index}
                      id={`email-digit-${index}`}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(
                        e.target.value, 
                        index, 
                        'email', 
                        emailCode, 
                        setEmailCode, 
                        'email-digit'
                      )}
                      onKeyDown={(e) => handleKeyDown(
                        e, 
                        index, 
                        'email', 
                        emailCode, 
                        setEmailCode, 
                        'email-digit'
                      )}
                      className="w-11 h-12 text-center text-lg font-extrabold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900"
                    />
                  ))}
                </div>
                <div className="text-center">
                  <span className="inline-block px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-[10px] font-mono text-amber-800">
                    💡 Verification Code: <span className="font-extrabold">123456</span>
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Submit Code & Next Step</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center">
                  {canResendEmail ? (
                    <button
                      type="button"
                      onClick={resendEmailCode}
                      className="text-xs font-bold text-indigo-600 hover:underline"
                    >
                      Resend Verification Email
                    </button>
                  ) : (
                    <p className="text-xs text-slate-400">
                      Resend code available in{' '}
                      <span className="font-mono font-bold text-slate-600">{emailTimer}s</span>
                    </p>
                  )}
                </div>
              </div>

            </form>
          )}

          {/* VIEW: PHONE OTP VERIFICATION */}
          {mode === 'verify_phone' && (
            <form onSubmit={handleVerifyPhone} className="space-y-5">
              
              {/* Step indicator */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider font-mono">
                  Step 2 of 2: OTP SMS Code
                </span>
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 font-semibold">
                  <Check className="w-3.5 h-3.5" /> Email Confirmed
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full w-full transition-all duration-500" />
              </div>

              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 font-sans">Mobile OTP Authentication</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  We have transmitted a 6-digit dynamic OTP credentials via SMS to phone number:{' '}
                  <span className="font-semibold text-slate-800">{registeredUser?.phone || UsersService.getProfile().phone}</span>.
                </p>
              </div>

              {/* Digit Inputs Grid */}
              <div className="space-y-2">
                <div className="flex justify-center gap-2">
                  {phoneOtp.map((digit, index) => (
                    <input
                      key={index}
                      id={`phone-digit-${index}`}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(
                        e.target.value, 
                        index, 
                        'phone', 
                        phoneOtp, 
                        setPhoneOtp, 
                        'phone-digit'
                      )}
                      onKeyDown={(e) => handleKeyDown(
                        e, 
                        index, 
                        'phone', 
                        phoneOtp, 
                        setPhoneOtp, 
                        'phone-digit'
                      )}
                      className="w-11 h-12 text-center text-lg font-extrabold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900"
                    />
                  ))}
                </div>
                <div className="text-center">
                  <span className="inline-block px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-[10px] font-mono text-emerald-800">
                    💡 SMS OTP Verification Code: <span className="font-extrabold">888888</span>
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Complete Authentication</span>
                      <ShieldCheck className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center">
                  {canResendPhone ? (
                    <button
                      type="button"
                      onClick={resendPhoneOtp}
                      className="text-xs font-bold text-indigo-600 hover:underline"
                    >
                      Resend SMS OTP
                    </button>
                  ) : (
                    <p className="text-xs text-slate-400">
                      Resend SMS available in{' '}
                      <span className="font-mono font-bold text-slate-600">{phoneTimer}s</span>
                    </p>
                  )}
                </div>
              </div>

            </form>
          )}

          {/* VIEW: SUCCESS SCREEN */}
          {mode === 'success' && (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce">
                <Check className="w-8 h-8 font-bold" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-800 font-sans">Verification Successful!</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Both communication pathways (Email & SMS) have been authorized. Your account is now fully active.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100/50 flex flex-col gap-2 text-left">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Authorized Profile Settings</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono space-y-1 pl-6">
                  <div>• ID: {UsersService.getProfile().id}</div>
                  <div>• Profile: {UsersService.getProfile().name}</div>
                  <div>• Verified Email: Approved</div>
                  <div>• Mobile (SMS OTP): Active</div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleEnterPlatform}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                <span>Enter Marketplace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
