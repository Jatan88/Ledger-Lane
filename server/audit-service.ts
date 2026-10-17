import { Injectable } from "./decorators";
import { shopState } from "./store";

@Injectable()
export class AuditService {
  auditPaymentRetry(paymentId: string) {
    shopState.audits[shopState.audits.length] = paymentId;
    return paymentId;
  }
}

export const auditService = new AuditService();
