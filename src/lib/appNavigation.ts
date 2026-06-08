export const APP_NAVIGATION_EVENT = "app-navigation";

export type AppNavigationDetail = {
  href: string;
};

export function dispatchAppNavigation(href: string) {
  window.dispatchEvent(
    new CustomEvent<AppNavigationDetail>(APP_NAVIGATION_EVENT, {
      detail: { href },
    }),
  );
}
