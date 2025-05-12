import ipRangeCheck from "ip-range-check";
import { URLHashParams } from "./utils/URLHashParams";
import { Logger } from "./types";
import { Provider } from "./Provider";

/**
 * Extract the host without port from an url.
 * @param  {URL} url URL as String
 * @return {String}     host as string
 */
function extractHost(url: URL) {
  return url.hostname;
}

/**
 * Returns true if the url has a local host.
 * @param  {URL} url URL as object
 * @return {boolean}
 */
function checkLocalURL(url: URL) {
  let host = extractHost(url);

  if (!host.match(/^\d/) && host !== "localhost") {
    return false;
  }

  return (
    ipRangeCheck(host, [
      "10.0.0.0/8",
      "172.16.0.0/12",
      "192.168.0.0/16",
      "100.64.0.0/10",
      "169.254.0.0/16",
      "127.0.0.1",
    ]) || host === "localhost"
  );
}

/**
 * Decodes an URL, also one that is encoded multiple times.
 *
 * @see https://stackoverflow.com/a/38265168
 *
 * @param url   the url, that should be decoded
 */
function decodeURL(url) {
  let rtn = decodeURIComponent(url);

  while (isEncodedURI(rtn)) {
    rtn = decodeURIComponent(rtn);
  }

  // Required (e.g., to fix https://github.com/ClearURLs/Addon/issues/71)
  if (!rtn.startsWith("http")) {
    rtn = "http://" + rtn;
  }

  return rtn;
}

/**
 * Returns the given URL without searchParams and hash.
 * @param {URL} url the URL as object
 * @return {URL} the url without searchParams and hash
 */
function urlWithoutParamsAndHash(url: URL) {
  let newURL = url.toString();

  if (url.search) {
    newURL = newURL.replace(url.search, "");
  }

  if (url.hash) {
    newURL = newURL.replace(url.hash, "");
  }

  return new URL(newURL);
}
/**
 * Returns an URLSearchParams as string.
 * Does handle spaces correctly.
 */
function urlSearchParamsToString(searchParams: URLSearchParams) {
  const rtn: string[] = [];

  searchParams.forEach((value, key) => {
    if (value) {
      rtn.push(key + "=" + encodeURIComponent(value));
    } else {
      rtn.push(key);
    }
  });

  return rtn.join("&");
}
/**
 * Returns true, iff the given URI is encoded
 * @see https://stackoverflow.com/a/38265168
 */
function isEncodedURI(uri) {
  return uri !== decodeURIComponent(uri || "");
}

/**
 * Extract the fragments from an url.
 * @param  {URL} url URL as object
 * @return {URLHashParams}     fragments as URLSearchParams object
 */
function extractFragments(url) {
  return new URLHashParams(url);
}
/**
 * Helper function which remove the tracking fields
 * for each provider given as parameter.
 *
 * @param  {Provider} provider      Provider-Object
 * @param pureUrl                   URL as String
 * @param {boolean} quiet           if the action should be displayed in log and statistics
 * @return {Object}                  Array with changes and url fields
 */
export function removeFieldsFormURL({
  provider,
  pureUrl,
  localHostsSkipping = true,
  domainBlocking = true,
  loggingStatus = true,
  logger,
}: {
  provider: Provider;
  pureUrl: string;
  localHostsSkipping?: boolean;
  domainBlocking?: boolean;
  loggingStatus?: boolean;
  logger?: Logger;
}) {
  let url = pureUrl;
  let domain = "";
  let rules = provider.getRules();
  let changes = false;
  let rawRules = provider.getRawRules();
  let urlObject = new URL(url);
  let fields: URLSearchParams = new URLSearchParams();
  let fragments: URLHashParams = new URLHashParams(urlObject);
  const quiet = !logger;

  if (localHostsSkipping && checkLocalURL(urlObject)) {
    return {
      changes: false,
      url: url,
      cancel: false,
    };
  }

  /*
   * Expand the url by provider redirections. So no tracking on
   * url redirections form sites to sites.
   */
  let re = provider.getRedirection(url);
  if (re !== null) {
    url = decodeURL(re);

    //Log the action
    if (!quiet) {
      logger?.log(pureUrl, url, "log_redirect");
    }

    return {
      redirect: true,
      url: url,
    };
  }

  if (provider.isCaneling() && domainBlocking) {
    if (!quiet) logger?.log(pureUrl, pureUrl, "log_domain_blocked");
    return {
      cancel: true,
      url: url,
    };
  }

  /*
   * Apply raw rules to the URL.
   */
  rawRules.forEach(function (rawRule: string | RegExp) {
    let beforeReplace = url;
    url = url.replace(new RegExp(rawRule, "gi"), "");

    if (beforeReplace !== url) {
      //Log the action
      if (loggingStatus && !quiet) {
        logger?.log(beforeReplace, url, rawRule);
      }

      changes = true;
    }
  });

  urlObject = new URL(url);
  fields = urlObject.searchParams;
  fragments = extractFragments(urlObject);
  domain = urlWithoutParamsAndHash(urlObject).toString();

  /**
   * Only test for matches, if there are fields or fragments that can be cleaned.
   */
  if (fields.toString() !== "" || fragments.toString() !== "") {
    rules.forEach((rule: string) => {
      const beforeFields = fields.toString();
      const beforeFragments = fragments.toString();
      let localChange = false;

      for (const field of fields.keys()) {
        if (new RegExp("^" + rule + "$", "gi").test(field)) {
          fields.delete(field);
          changes = true;
          localChange = true;
        }
      }

      for (const fragment of fragments.keys()) {
        if (new RegExp("^" + rule + "$", "gi").test(fragment)) {
          fragments.delete(fragment);
          changes = true;
          localChange = true;
        }
      }

      //Log the action
      if (localChange && loggingStatus) {
        let tempURL = domain;
        let tempBeforeURL = domain;

        if (fields.toString() !== "") tempURL += "?" + fields.toString();
        if (fragments.toString() !== "") tempURL += "#" + fragments.toString();
        if (beforeFields.toString() !== "")
          tempBeforeURL += "?" + beforeFields.toString();
        if (beforeFragments.toString() !== "")
          tempBeforeURL += "#" + beforeFragments.toString();

        if (!quiet) logger?.log(tempBeforeURL, tempURL, rule);
      }
    });

    let finalURL = domain;

    if (fields.toString() !== "")
      finalURL += "?" + urlSearchParamsToString(fields);
    if (fragments.toString() !== "") finalURL += "#" + fragments.toString();

    url = finalURL
      .replace(new RegExp("\\?&"), "?")
      .replace(new RegExp("#&"), "#");
  }

  return {
    changes: changes,
    url: url,
  };
}
