import { Injectable } from "./decorators";
import { shopState } from "./store";

@Injectable()
export class OversellWarningService {
  warnOversell(sku: string) {
    shopState.audits[shopState.audits.length] = "oversell " + sku;
    return sku;
  }
}

export const oversellWarningService = new OversellWarningService();
