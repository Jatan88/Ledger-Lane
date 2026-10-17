import { Injectable } from "./decorators";
import { shopState } from "./store";

@Injectable()
export class RetryWarningService {
  warnDuplicateLedger(paymentId: string) {
    shopState.audits[shopState.audits.length] = "unguarded " + paymentId;
    return paymentId;
  }
}

export const retryWarningService = new RetryWarningService();
