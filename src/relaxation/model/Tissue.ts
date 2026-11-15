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
import { TISSUE_TIMES } from "../../SimplifiedMRIConstants.js";

export class Tissue extends EnumerationValue {
  public static readonly FAT = new Tissue("fat", TISSUE_TIMES.FAT_T1, TISSUE_TIMES.FAT_T2);
  public static readonly WHITE_MATTER = new Tissue(
    "whiteMatter",
    TISSUE_TIMES.WHITE_MATTER_T1,
    TISSUE_TIMES.WHITE_MATTER_T2,
  );
  public static readonly GRAY_MATTER = new Tissue(
    "grayMatter",
    TISSUE_TIMES.GRAY_MATTER_T1,
    TISSUE_TIMES.GRAY_MATTER_T2,
  );
  public static readonly MUSCLE = new Tissue("muscle", TISSUE_TIMES.MUSCLE_T1, TISSUE_TIMES.MUSCLE_T2);
  public static readonly BLOOD = new Tissue("blood", TISSUE_TIMES.BLOOD_T1, TISSUE_TIMES.BLOOD_T2);
  public static readonly CSF = new Tissue("csf", TISSUE_TIMES.CSF_T1, TISSUE_TIMES.CSF_T2);
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
