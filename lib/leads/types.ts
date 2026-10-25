/** One lead, normalised, on its way to whatever CRM this funnel uses. */
export type Lead = {
  firstName: string;
  lastName: string;
  email: string;
  /** E.164, already validated by the route. Adapters must never re-parse it. */
  phone: string;
  /** 2-letter ISO, derived from the phone. Close needs it for local-time views. */
  countryCode?: string;
  /** utm_source when the click carried one, else the funnel's own tag. */
  source?: string;
  smsConsent?: boolean;
  smsMarketingConsent?: boolean;
  /** utm_*, click ids, landing page, referrer. Logged, and passed to webhooks. */
  attribution?: Record<string, string>;
  /**
   * Deep links to this lead's record in the CRMs that already took it. Set by
   * the dispatcher, never by the caller: the ids do not exist until those
   * destinations have answered.
   */
  crmLinks?: { label: string; url: string }[];
};

export type DeliveryResult = {
  /** which adapter this came from, e.g. "close" */
  destination: string;
  ok: boolean;
  /** id of the record in that system, when it has one */
  id?: string;
  /** matched an existing record, so nothing new was created */
  duplicate?: boolean;
  /** why it failed. "not-configured" means the env vars are absent, which is
   *  not an error worth alerting on. */
  reason?: string;
};
