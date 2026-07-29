import { mount } from 'svelte';
import DentUI from '@nsis/dent-ui/DentUI.svelte';

mount(DentUI, {
  target: document.getElementById('app')!,
  props: {
    strict: false,
  }
});
