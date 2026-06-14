/**
 * Legacy discover route shell — delegates to products listing layout so
 * /discover → /products redirects still run Order/UMS guards before redirect.
 */
export { default } from '../products/(listing)/layout';
