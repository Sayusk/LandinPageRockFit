import { PLANS, getPlanBySlug } from '../data/plans.js';

export async function fetchPlans() {
  try {
    const res = await fetch('/api/plans');
    if (!res.ok) throw new Error('API indisponível');
    return await res.json();
  } catch {
    return PLANS;
  }
}

export function getPlan(slug) {
  return getPlanBySlug(slug);
}
