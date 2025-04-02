import type { Wallet } from "@models/wallet/index.ts";
import type { CountryCode } from "@temboplus/frontend-core";

/**
 * Gets unique countries from a list of wallets
 * @param wallets Array of wallets
 * @returns Array of unique country codes
 */
export function getUniqueCountries(wallets: Wallet[]): CountryCode[] {
  const uniqueCountries = new Set<CountryCode>();
  wallets.forEach((wallet) => {
    if (wallet.countryCode) {
      uniqueCountries.add(wallet.countryCode as CountryCode);
    }
  });
  return Array.from(uniqueCountries);
}

/**
 * Gets wallets for a specific country
 * @param wallets Array of wallets
 * @param countryCode Country code to filter by
 * @returns Array of wallets for the specified country
 */
export function getWalletsByCountry(
  wallets: Wallet[],
  countryCode: CountryCode
): Wallet[] {
  return wallets.filter((wallet) => wallet.countryCode === countryCode);
}