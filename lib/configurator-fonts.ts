const GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Bebas+Neue&family=Oswald:wght@400;700&family=Roboto+Condensed:wght@400;700&display=swap";

const FONT_SPECS = [
  '1em "Inter"',
  '1em "Bebas Neue"',
  '1em "Oswald"',
  '1em "Roboto Condensed"',
];

let loaded = false;
let promise: Promise<void> | null = null;

export function areFontsLoaded(): boolean {
  return loaded;
}

export function loadConfiguratorFonts(): Promise<void> {
  if (loaded) return Promise.resolve();
  if (promise) return promise;

  promise = (async () => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = GOOGLE_FONTS_URL;

    await new Promise<void>((resolve, reject) => {
      link.onload = () => resolve();
      link.onerror = () => reject(new Error("Failed to load configurator fonts stylesheet"));
      document.head.appendChild(link);
    });

    await Promise.allSettled(FONT_SPECS.map((spec) => document.fonts.load(spec)));

    loaded = true;
  })();

  return promise;
}
