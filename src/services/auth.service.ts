import { apiClient, ApiResponse } from '../lib/api/client';
import { User } from '../types/api';

export class AuthService {
  /**
   * Register a new user via API V2
   */
  static async register(data: { name: string; email: string; phone: string; password?: string; password_confirmation?: string }): Promise<User> {
    await apiClient.csrfCookie();
    const payload = {
      ...data,
      password_confirmation: data.password_confirmation || data.password,
    };
    const response = await apiClient.post<ApiResponse<{ user: User; token?: string }>>('/auth/register', payload);
    if (response.data?.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    return response.data.user;
  }

  /**
   * Log in a user via API V2
   */
  static async login(loginInput: string, password?: string): Promise<User> {
    await apiClient.csrfCookie();
    const response = await apiClient.post<ApiResponse<{ user: User; token?: string }>>('/auth/login', {
      email: loginInput,
      login: loginInput,
      password: password || 'Password123!',
    });
    if (response.data?.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    return response.data.user;
  }

  /**
   * Log out current user via API V2
   */
  static async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignored if session already ended
    } finally {
      localStorage.removeItem('auth_token');
    }
  }

  /**
   * Get current authenticated user profile via API V2
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiClient.get<ApiResponse<User>>('/auth/me');
      return response.data;
    } catch {
      return null;
    }
  }

  /**
   * Request password reset link via API V2
   */
  static async forgotPassword(email: string): Promise<string> {
    await apiClient.csrfCookie();
    const response = await apiClient.post<ApiResponse<any>>('/auth/forgot-password', { email });
    return response.message || 'Password reset link sent to your email.';
  }

  /**
   * Reset password with token via API V2
   */
  static async resetPassword(data: { email: string; token: string; password: string; password_confirmation?: string }): Promise<string> {
    await apiClient.csrfCookie();
    const payload = {
      ...data,
      password_confirmation: data.password_confirmation || data.password,
    };
    const response = await apiClient.post<ApiResponse<any>>('/auth/reset-password', payload);
    return response.message || 'Password has been reset successfully.';
  }

  /**
   * Send 2Factor SMS OTP
   */
  static async sendSmsOtp(phone: string): Promise<{ session_id: string; message: string }> {
    const response = await apiClient.post<ApiResponse<{ session_id: string; message: string }>>('/user/send-sms-otp', { phone });
    return response.data;
  }

  /**
   * Verify 2Factor SMS OTP
   */
  static async verifySmsOtp(sessionId: string, otpCode: string): Promise<boolean> {
    const response = await apiClient.post<ApiResponse<{ verified: boolean }>>('/user/verify-sms-otp', {
      session_id: sessionId,
      otp_code: otpCode,
    });
    return response.data?.verified ?? true;
  }
}
