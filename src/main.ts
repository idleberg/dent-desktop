import { mount } from 'svelte';
import DentUI from '@nsis/dent-ui/DentUI.svelte';

const THEME_ENDPOINT = '/api/prefs/theme';

// dent-ui reads and writes its theme preference through `localStorage`, which is
// scoped to the origin — and `deno desktop` serves on a different port each
// launch, so the store is empty on every boot. Seed it from the Deno-side store
// before mounting, and mirror later writes back so the choice survives a restart.
async function bridgeThemePreference(): Promise<void> {
  const response = await fetch(THEME_ENDPOINT);
  const theme = await response.text();

  localStorage.setItem('theme', theme);

  const nativeSetItem = Storage.prototype.setItem;

  Storage.prototype.setItem = function (key: string, value: string) {
    nativeSetItem.call(this, key, value);

    if (this === localStorage && key === 'theme') {
      void fetch(THEME_ENDPOINT, { method: 'PUT', body: value });
    }
  };
}

async function bootstrap(): Promise<void> {
  try {
    await bridgeThemePreference();
  } catch {
    // Preferences are a convenience; fall back to dent-ui's own defaults.
  }

  mount(DentUI, {
    target: document.getElementById('app')!,
    props: {
      strict: false,
    },
  });
}

bootstrap();
