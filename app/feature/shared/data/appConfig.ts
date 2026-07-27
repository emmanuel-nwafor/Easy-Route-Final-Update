// Determine which UI mode the application is compiled for.
// Possible values: 'simple' | 'advanced'
// Defaults to 'simple' if EXPO_PUBLIC_APP_VARIANT is not specified.
export const APP_VARIANT: 'simple' | 'advanced' = 
  (process.env.EXPO_PUBLIC_APP_VARIANT as 'simple' | 'advanced') || 'simple';
