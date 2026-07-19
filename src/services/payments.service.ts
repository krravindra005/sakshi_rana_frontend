import { Payment } from '../types/user';

export class PaymentsService {
  /**
   * Create a credit top-up purchase order
   */
  static async createOrder(amount: number, paymentMethod: string): Promise<{ success: boolean; data: { orderId: string; paymentUrl: string; amount: number; currency: string } }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const orderId = `pay_ord_${Math.floor(100000 + Math.random() * 900000)}`;
        
        console.log(`Payment order ${orderId} created for ${amount} INR via ${paymentMethod}`);
        
        resolve({
          success: true,
          data: {
            orderId,
            paymentUrl: `https://gateway.example.com/pay/${orderId}`,
            amount,
            currency: 'INR'
          }
        });
      }, 100);
    });
  }

  /**
   * Mock verifying order payment status
   */
  static async verifyPayment(orderId: string): Promise<Payment> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const payment: Payment = {
          id: `pay-${Date.now()}`,
          userId: 'usr-101',
          amount: 1000,
          currency: 'INR',
          paymentMethod: 'UPI',
          paymentStatus: 'completed',
          orderId,
          transactionId: `txn-${Math.floor(100000000 + Math.random() * 900000000)}`,
          createdAt: new Date().toISOString()
        };
        resolve(payment);
      }, 100);
    });
  }
}
