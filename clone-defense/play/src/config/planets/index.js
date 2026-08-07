// All planets in run order — the full 15-planet roster (PRD §16).
import { validatePlanets } from '../validate.js';
import p01 from './p01-christophsis.js';
import p02 from './p02-tatooine.js';
import p03 from './p03-coruscant.js';
import p04 from './p04-kamino.js';
import p05 from './p05-ryloth.js';
import p06 from './p06-naboo.js';
import p07 from './p07-felucia.js';
import p08 from './p08-geonosis.js';
import p09 from './p09-mandalore.js';
import p10 from './p10-nal-hutta.js';
import p11 from './p11-dathomir.js';
import p12 from './p12-mortis.js';
import p13 from './p13-mon-cala.js';
import p14 from './p14-umbara.js';
import p15 from './p15-oba-diah.js';

export const PLANETS = [p01, p02, p03, p04, p05, p06, p07, p08, p09, p10, p11, p12, p13, p14, p15];
validatePlanets(PLANETS);
