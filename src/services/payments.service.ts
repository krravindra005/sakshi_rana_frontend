import { apiClient, ApiResponse } from '../lib/api/client';
import { PaymentOrder } from '../types/api';

export class PaymentsService {
  /**
   * Create a payment order via POST /api/v2/payments/orders
   */
  static async createOrder(amount: number, provider: string = 'razorpay'): Promise<PaymentOrder> {
    const response = await apiClient.post<ApiResponse<PaymentOrder>>('/payments/orders', {
      amount,
      currency: 'INR',
      provider,
    });
    return response.data;
  }

  /**
   * Get payment details via GET /api/v2/payments/{id}
   */
  static async getPaymentDetails(id: string | number): Promise<PaymentOrder | null> {
    try {
      const response = await apiClient.get<ApiResponse<PaymentOrder>>(`/payments/${id}`);
      return response.data;
    } catch {
      return null;
    }
  }
}
