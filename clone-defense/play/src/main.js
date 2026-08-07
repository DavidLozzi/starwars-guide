// Entry — index.html loads only this file. Everything that wires config → sim → render → ui → meta
// lives in ./boot.js, behind a dynamic import so nothing evaluates until the environment checks out.

import { ready, note } from './ui/env.js';

if (ready()) await import('./boot.js');
else note();
