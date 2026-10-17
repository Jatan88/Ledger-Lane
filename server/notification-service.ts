import { Injectable } from "./decorators";
import { shopState } from "./store";
import type { Payment } from "./types";

@Injectable()
export class NotificationService {
  notifyPayment(payment: Payment) {
    this.sendNotification(
      "Payment " + payment.id + " captured for " + payment.amountCents + " cents",
    );
    return payment.id;
  }

  sendNotification(message: string) {
    shopState.notifications[shopState.notifications.length] = message;
    return message;
  }
}

export const notificationService = new NotificationService();
