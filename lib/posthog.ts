import posthog from "posthog-js";

const POSTHOG_KEY = "phc_GpKAybU9HEGoedbsSBB7p9WJHBHhBiqvIBwquAB1fCE";
const POSTHOG_HOST = "https://us.i.posthog.com";

let initialized = false;

export function initPostHog() {
  if (typeof window === "undefined" || initialized) return;

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: true,
  });

  initialized = true;
}

// ── Custom Event Helpers ──

export function trackEvent(event: string, properties?: Record<string, unknown>) {
  if (typeof window !== "undefined") {
    posthog.capture(event, properties);
  }
}

// Marketplace
export function trackSuiteView(slug: string, category: string) {
  trackEvent("suite_viewed", { slug, category });
}

export function trackSuiteSearch(query: string, resultCount: number) {
  trackEvent("suite_searched", { query, result_count: resultCount });
}

export function trackCategoryFilter(category: string) {
  trackEvent("category_filtered", { category });
}

export function trackSortChange(sort: string) {
  trackEvent("sort_changed", { sort });
}

export function trackSuiteDownload(slug: string, category: string) {
  trackEvent("suite_downloaded", { slug, category });
}

export function trackSuiteRated(slug: string, score: number) {
  trackEvent("suite_rated", { slug, score });
}

export function trackSuitePublishStart() {
  trackEvent("suite_publish_started");
}

export function trackSuitePublished(slug: string) {
  trackEvent("suite_published", { slug });
}

// Test Arena
export function trackTestStarted(slug: string) {
  trackEvent("test_started", { slug });
}

export function trackTestCompleted(slug: string, score: number, belt: string) {
  trackEvent("test_completed", { slug, score, belt });
}

// Auth
export function trackSignIn(provider: string) {
  trackEvent("user_signed_in", { provider });
}

// CTA clicks
export function trackCTAClick(cta: string, location: string) {
  trackEvent("cta_clicked", { cta, location });
}

// Infinite scroll
export function trackLoadMore(page: number) {
  trackEvent("marketplace_load_more", { page });
}
