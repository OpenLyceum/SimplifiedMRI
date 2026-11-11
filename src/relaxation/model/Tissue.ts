/**
 * Tissue.ts
 *
 * Tissue presets for the Relaxation screen, with typical longitudinal (T1) and transverse
 * (T2) relaxation times at 1.5 T. Approximate literature values: Stanisz et al., Magn. Reson.
 * Med. 54, 507 (2005) for white matter, gray matter, muscle and blood; Bojorquez et al.,
 * Magn. Reson. Imaging 35, 69 (2017) for fat and cerebrospinal fluid. Real values vary by
 * a few tens of percent between studies.
 *
 * CUSTOM carries no times of its own: the T1 and T2 sliders set them.
 */

import { Enumeration, EnumerationValue } from "scenerystack/phet-core";

export class Tissue extends EnumerationValue {
  public static readonly FAT = new Tissue("fat", 340, 60);
  public static readonly WHITE_MATTER = new Tissue("whiteMatter", 880, 70);
  public static readonly GRAY_MATTER = new Tissue("grayMatter", 1120, 95);
  public static readonly MUSCLE = new Tissue("muscle", 1010, 45);
  public static readonly BLOOD = new Tissue("blood", 1440, 290);
  public static readonly CSF = new Tissue("csf", 4000, 2000);
  public static readonly CUSTOM = new Tissue("custom", null, null);

  public static readonly enumeration = new Enumeration(Tissue);

  /** Key of the tissue's name. */
  public readonly key: string;

  /** Longitudinal relaxation time (ms), or null for CUSTOM. */
  public readonly t1: number | null;

  /** Transverse relaxation time (ms), or null for CUSTOM. */
  public readonly t2: number | null;

  public constructor(key: string, t1: number | null, t2: number | null) {
    super();
    this.key = key;
    this.t1 = t1;
    this.t2 = t2;
  }
}
