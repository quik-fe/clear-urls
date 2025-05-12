import * as data from "../data/data.min.json";
import { Provider } from "./Provider";
import { removeFieldsFormURL } from "./removeFieldsFormURL";
import { Logger } from "./types";

const providers: Provider[] = [];

/**
 * Initialize the providers form the JSON object.
 *
 */
function createProviders() {
  const prvKeys = Object.keys(data.providers);
  for (let p = 0; p < prvKeys.length; p++) {
    //Create new provider
    providers.push(
      new Provider(
        prvKeys[p],
        data.providers[prvKeys[p]].completeProvider ?? false,
        data.providers[prvKeys[p]].forceRedirection ?? false
      )
    );

    //Add URL Pattern
    providers[p].setURLPattern(data.providers[prvKeys[p]].urlPattern ?? "");

    let rules = data.providers[prvKeys[p]].rules ?? [];
    //Add rules to provider
    for (let r = 0; r < rules.length; r++) {
      providers[p].addRule(rules[r]);
    }

    let rawRules = data.providers[prvKeys[p]].rawRules ?? [];
    //Add raw rules to provider
    for (let raw = 0; raw < rawRules.length; raw++) {
      providers[p].addRawRule(rawRules[raw]);
    }

    let referralMarketingRules =
      data.providers[prvKeys[p]].referralMarketing ?? [];
    //Add referral marketing rules to provider
    for (
      let referralMarketing = 0;
      referralMarketing < referralMarketingRules.length;
      referralMarketing++
    ) {
      providers[p].addReferralMarketing(
        referralMarketingRules[referralMarketing]
      );
    }

    let exceptions = data.providers[prvKeys[p]].exceptions ?? [];
    //Add exceptions to provider
    for (let e = 0; e < exceptions.length; e++) {
      providers[p].addException(exceptions[e]);
    }

    let redirections = data.providers[prvKeys[p]].redirections ?? [];
    //Add redirections to provider
    for (let re = 0; re < redirections.length; re++) {
      providers[p].addRedirection(redirections[re]);
    }

    let methods = data.providers[prvKeys[p]].methods ?? [];
    //Add HTTP methods list to provider
    for (let re = 0; re < methods.length; re++) {
      providers[p].addMethod(methods[re]);
    }
  }
}

createProviders();

export function clearUrl(url: string, logger?: Logger) {
  let result = {
    changes: false,
    url,
    redirect: false,
    cancel: false,
    // matched provider
    providers: [],
  } as any;

  /*
   * Call for every provider the removeFieldsFormURL method.
   */
  for (const provider of providers) {
    if (provider.matchURL(url)) {
      result.providers.push(provider.getName());
      const processed = removeFieldsFormURL({
        provider,
        pureUrl: url,
        logger,
      });
      result.url = processed.url;
      result.changes = result.changes ?? processed.changes;
      result.redirect = result.redirect ?? processed.redirect;
      result.cancel = result.cancel ?? processed.cancel;
      if (result.redirect || result.cancel) {
        return result;
      }
    }
  }
  return result;
}
