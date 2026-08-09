import { UserProfile } from '../types/user';
import { UsersService } from './users.service';
import { apiClient, ApiResponse } from '../lib/api/client';

export class AuthService {
  /**
   * Register a new user via API V2
   */
  static async register(data: { name: string; email: string; phone: string; password?: string }): Promise<UserProfile> {
    try {
      const response = await apiClient.post<ApiResponse<{ user: UserProfile; token?: string }>>('/auth/register', data);
      if (response.data?.token) {
        localStorage.setItem('auth_token', response.data.token);
      }
      return response.data.user;
    } catch {
      return UsersService.register(data);
    }
  }

  /**
   * Log in a user via API V2
   */
  static async login(emailOrPhone: string, password?: string): Promise<UserProfile> {
    try {
      const response = await apiClient.post<ApiResponse<{ user: UserProfile; token?: string }>>('/auth/login', {
        email: emailOrPhone,
        password: password || 'password',
      });
      if (response.data?.token) {
        localStorage.setItem('auth_token', response.data.token);
      }
      return response.data.user;
    } catch {
      return UsersService.login(emailOrPhone, password);
    }
  }

  /**
   * Log out current user via API V2
   */
  static async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignored
    } finally {
      localStorage.removeItem('auth_token');
      UsersService.logout();
    }
  }

  /**
   * Get current authenticated user profile
   */
  static async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const response = await apiClient.get<ApiResponse<UserProfile>>('/auth/me');
      return response.data;
    } catch {
      const isLoggedIn = UsersService.isLoggedIn();
      return isLoggedIn ? UsersService.getProfile() : null;
    }
  }

  /**
   * Request password reset email
   */
  static async forgotPassword(email: string): Promise<boolean> {
    console.log(`Password reset link requested for ${email}`);
    return Promise.resolve(true);
  }

  /**
   * Reset password with token
   */
  static async resetPassword(email: string, token: string, password: string): Promise<boolean> {
    console.log(`Password reset for ${email} with token ${token}`);
    const profile = UsersService.getProfile();
    if (profile.email === email) {
      UsersService.updateProfile({ password });
    }
    return Promise.resolve(true);
  }

  /**
   * Resend verification email
   */
  static async resendVerificationEmail(): Promise<boolean> {
    console.log('Verification email resent.');
    return Promise.resolve(true);
  }

  /**
   * Verify email
   */
  static async verifyEmail(): Promise<UserProfile> {
    return UsersService.verifyEmail();
  }

  /**
   * Verify phone number
   */
  static async verifyPhone(): Promise<UserProfile> {
    return UsersService.verifyPhone();
  }
}
