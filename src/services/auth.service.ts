import { UserProfile } from '../types/user';
import { UsersService } from './users.service';

export class AuthService {
  /**
   * Register a new user
   */
  static async register(data: { name: string; email: string; phone: string; password?: string }): Promise<UserProfile> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const profile = UsersService.register(data);
        resolve(profile);
      }, 50);
    });
  }

  /**
   * Log in a user
   */
  static async login(emailOrPhone: string, password?: string): Promise<UserProfile> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const profile = UsersService.login(emailOrPhone, password);
        resolve(profile);
      }, 50);
    });
  }

  /**
   * Log out current user
   */
  static async logout(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        UsersService.logout();
        resolve();
      }, 30);
    });
  }

  /**
   * Get current authenticated user profile
   */
  static async getCurrentUser(): Promise<UserProfile | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const isLoggedIn = UsersService.isLoggedIn();
        if (!isLoggedIn) {
          resolve(null);
        } else {
          resolve(UsersService.getProfile());
        }
      }, 30);
    });
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
    return new Promise((resolve) => {
      setTimeout(() => {
        const profile = UsersService.verifyEmail();
        resolve(profile);
      }, 50);
    });
  }

  /**
   * Verify phone number
   */
  static async verifyPhone(): Promise<UserProfile> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const profile = UsersService.verifyPhone();
        resolve(profile);
      }, 50);
    });
  }
}
