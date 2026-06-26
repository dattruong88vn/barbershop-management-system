export const APP_NAVIGATION_EVENT = "app-navigation";

export type AppNavigationDetail = {
  href: string;
  signOut?: boolean;
};

export function dispatchAppNavigation(
  href: string,
  detail?: Pick<AppNavigationDetail, "signOut">,
) {
  window.dispatchEvent(
    new CustomEvent<AppNavigationDetail>(APP_NAVIGATION_EVENT, {
      detail: { href, ...detail },
    }),
  );
}
