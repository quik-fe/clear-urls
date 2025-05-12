export class Provider {
  private name: string;
  private urlPattern?: RegExp;
  private enabled_rules: { [key: string]: boolean } = {};
  private disabled_rules: { [key: string]: boolean } = {};
  private enabled_exceptions: { [key: string]: boolean } = {};
  private disabled_exceptions: { [key: string]: boolean } = {};
  private canceling: boolean;
  private enabled_redirections: { [key: string]: boolean } = {};
  private disabled_redirections: { [key: string]: boolean } = {};
  private active: boolean;
  private enabled_rawRules: { [key: string]: boolean } = {};
  private disabled_rawRules: { [key: string]: boolean } = {};
  private enabled_referralMarketing: { [key: string]: boolean } = {};
  private disabled_referralMarketing: { [key: string]: boolean } = {};
  private methods: string[] = [];

  constructor(
    _name: string,
    _completeProvider: boolean = false,
    private _forceRedirection: boolean = false,
    _isActive: boolean = true
  ) {
    this.name = _name;
    this.canceling = _completeProvider;
    this.active = _isActive;

    if (_completeProvider) {
      this.enabled_rules[".*"] = true;
    }
  }

  /**
   * Returns whether redirects should be enforced via a "tabs.update"
   * @return {boolean}    whether redirects should be enforced
   */
  shouldForceRedirect(): boolean {
    return this._forceRedirection;
  }

  /**
   * Returns the provider name.
   * @return {String}
   */
  getName(): string {
    return this.name;
  }

  /**
   * Add URL pattern.
   *
   * @require urlPatterns as RegExp
   */
  setURLPattern(urlPatterns: string | RegExp): void {
    this.urlPattern = new RegExp(urlPatterns as string, "i");
  }

  /**
   * Return if the Provider Request is canceled
   * @return {Boolean} isCanceled
   */
  isCaneling(): boolean {
    return this.canceling;
  }

  /**
   * Check the url is matching the ProviderURL.
   *
   * @return {boolean}    ProviderURL as RegExp
   */
  matchURL(url: string): boolean {
    return this.urlPattern?.test(url) ?? (false && !this.matchException(url));
  }

  /**
   * Apply a rule to a given tuple of rule array.
   * @param enabledRuleArray      array for enabled rules
   * @param disabledRulesArray    array for disabled rules
   * @param {String} rule         RegExp as string
   * @param {boolean} isActive    Is this rule active?
   */
  private applyRule(
    enabledRuleArray: { [key: string]: boolean },
    disabledRulesArray: { [key: string]: boolean },
    rule: string,
    isActive: boolean = true
  ): void {
    if (isActive) {
      enabledRuleArray[rule] = true;

      if (disabledRulesArray[rule] !== undefined) {
        delete disabledRulesArray[rule];
      }
    } else {
      disabledRulesArray[rule] = true;

      if (enabledRuleArray[rule] !== undefined) {
        delete enabledRuleArray[rule];
      }
    }
  }

  /**
   * Add a rule to the rule array
   * and replace old rule with new rule.
   *
   * @param {String} rule        RegExp as string
   * @param {boolean} isActive   Is this rule active?
   */
  addRule(rule: string, isActive: boolean = true): void {
    this.applyRule(this.enabled_rules, this.disabled_rules, rule, isActive);
  }

  /**
   * Return all active rules as an array.
   *
   * @return Array RegExp strings
   */
  getRules(): string[] {
    return Object.keys(this.enabled_rules);
  }

  /**
   * Add a raw rule to the raw rule array
   * and replace old raw rule with new raw rule.
   *
   * @param {String} rule        RegExp as string
   * @param {boolean} isActive   Is this rule active?
   */
  addRawRule(rule: string, isActive: boolean = true): void {
    this.applyRule(
      this.enabled_rawRules,
      this.disabled_rawRules,
      rule,
      isActive
    );
  }

  /**
   * Return all active raw rules as an array.
   *
   * @return Array RegExp strings
   */
  getRawRules(): string[] {
    return Object.keys(this.enabled_rawRules);
  }

  /**
   * Add a referral marketing rule to the referral marketing array
   * and replace old referral marketing rule with new referral marketing rule.
   *
   * @param {String} rule        RegExp as string
   * @param {boolean} isActive   Is this rule active?
   */
  addReferralMarketing(rule: string, isActive: boolean = true): void {
    this.applyRule(
      this.enabled_referralMarketing,
      this.disabled_referralMarketing,
      rule,
      isActive
    );
  }

  /**
   * Add a exception to the exceptions array
   * and replace old with new exception.
   *
   * @param {String} exception   RegExp as string
   * @param {Boolean} isActive   Is this exception active?
   */
  addException(exception: string, isActive: boolean = true): void {
    if (isActive) {
      this.enabled_exceptions[exception] = true;

      if (this.disabled_exceptions[exception] !== undefined) {
        delete this.disabled_exceptions[exception];
      }
    } else {
      this.disabled_exceptions[exception] = true;

      if (this.enabled_exceptions[exception] !== undefined) {
        delete this.enabled_exceptions[exception];
      }
    }
  }

  /**
   * Add a HTTP method to methods list.
   *
   * @param {String} method HTTP Method Name
   */
  addMethod(method: string): void {
    if (!this.methods.includes(method)) {
      this.methods.push(method);
    }
  }

  /**
   * Check the requests' method.
   *
   * @param {requestDetails} details Requests details
   * @returns {boolean} should be filtered or not
   */
  matchMethod(details: { [key: string]: string }): boolean {
    if (this.methods.length === 0) return true;
    return this.methods.includes(details["method"]);
  }

  /**
   * Private helper method to check if the url
   * an exception.
   *
   * @param  {String} url     RegExp as string
   * @return {boolean}        if matching? true: false
   */
  private matchException(url: string): boolean {
    let result = false;

    for (const exception in this.enabled_exceptions) {
      if (result) break;

      const exception_regex = new RegExp(exception, "i");
      result = exception_regex.test(url);
    }

    return result;
  }

  /**
   * Add a redirection to the redirections array
   * and replace old with new redirection.
   *
   * @param {String} redirection   RegExp as string
   * @param {Boolean} isActive     Is this redirection active?
   */
  addRedirection(redirection: string, isActive: boolean = true): void {
    if (isActive) {
      this.enabled_redirections[redirection] = true;

      if (this.disabled_redirections[redirection] !== undefined) {
        delete this.disabled_redirections[redirection];
      }
    } else {
      this.disabled_redirections[redirection] = true;

      if (this.enabled_redirections[redirection] !== undefined) {
        delete this.enabled_redirections[redirection];
      }
    }
  }

  /**
   * Return all redirection.
   *
   * @return url
   */
  getRedirection(url: string): string | null {
    let re: string | null = null;

    for (const redirection in this.enabled_redirections) {
      const result = url.match(new RegExp(redirection, "i"));

      if (result && result.length > 0 && redirection) {
        re = new RegExp(redirection, "i").exec(url)?.[1] ?? null;
        break;
      }
    }

    return re;
  }
}
