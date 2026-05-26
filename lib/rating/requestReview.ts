import * as StoreReview from 'expo-store-review';

export async function requestAppStoreReview(): Promise<boolean> {
  try {
    const available = await StoreReview.isAvailableAsync();
    if (!available) return false;
    await StoreReview.requestReview();
    return true;
  } catch (error) {
    console.warn('[rating] requestReview failed', error);
    return false;
  }
}
