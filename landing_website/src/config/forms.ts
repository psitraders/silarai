/**
 * Form submission configuration.
 *
 * The site is a static build with no backend, so demo requests are delivered by
 * Web3Forms (https://web3forms.com), which emails each submission to the address
 * the access key is registered against.
 *
 * The access key is NOT a secret — Web3Forms documents it as safe to expose in
 * client-side code, because it is an alias for a destination email address
 * rather than an API credential. Restrict it to your domain in the Web3Forms
 * dashboard so a copied key cannot be used from another site.
 *
 * Setup:
 *   1. Go to https://web3forms.com and enter the address that should receive
 *      demo requests (e.g. info@silarai.com). The key arrives by email.
 *   2. Put the key in `.env` as VITE_WEB3FORMS_ACCESS_KEY, and add it to your
 *      Azure Static Web Apps build environment variables.
 *   3. In the Web3Forms dashboard, restrict the key to your production domain.
 */

export const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

/** Public access key — an alias for the destination inbox, not a secret. */
export const WEB3FORMS_ACCESS_KEY: string = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY ?? '';

/** Shown in the success screen so the user knows where the request went. */
export const DEMO_REQUEST_RECIPIENT = 'info@silarai.com';

/** True when a key is configured. When false, the form fails loudly rather than pretending to succeed. */
export const isFormDeliveryConfigured = (): boolean => WEB3FORMS_ACCESS_KEY.trim().length > 0;
