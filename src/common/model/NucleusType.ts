/**
 * NucleusType.ts
 *
 * The sample nuclei offered on the NMR screen, each with its gyromagnetic ratio γ/2π.
 * PhET's list, identified by isotope: hydrogen-1, nitrogen-14, sodium-23, carbon-13,
 * oxygen-17, sulfur-33, and an unknown nucleus (copper-65) for students to identify.
 *
 * Values are magnitudes in MHz/T. Oxygen-17's γ is negative (it precesses the other way);
 * the sim uses only |γ|, which sets the resonance frequency.
 */

import { Enumeration, EnumerationValue } from "scenerystack/phet-core";
import { GYROMAGNETIC_RATIOS } from "../../SimplifiedMRIConstants.js";

export class NucleusType extends EnumerationValue {
  public static readonly HYDROGEN_1 = new NucleusType(GYROMAGNETIC_RATIOS.HYDROGEN_1, "hydrogen1");
  public static readonly NITROGEN_14 = new NucleusType(GYROMAGNETIC_RATIOS.NITROGEN_14, "nitrogen14");
  public static readonly SODIUM_23 = new NucleusType(GYROMAGNETIC_RATIOS.SODIUM_23, "sodium23");
  public static readonly CARBON_13 = new NucleusType(GYROMAGNETIC_RATIOS.CARBON_13, "carbon13");
  public static readonly OXYGEN_17 = new NucleusType(GYROMAGNETIC_RATIOS.OXYGEN_17, "oxygen17");
  public static readonly SULFUR_33 = new NucleusType(GYROMAGNETIC_RATIOS.SULFUR_33, "sulfur33");
  public static readonly UNKNOWN = new NucleusType(GYROMAGNETIC_RATIOS.UNKNOWN, "unknown");

  public static readonly enumeration = new Enumeration(NucleusType);

  /** |γ|/2π (MHz/T). */
  public readonly gyromagneticRatio: number;

  /** Key of the nucleus's name and colour. */
  public readonly key: string;

  public constructor(gyromagneticRatio: number, key: string) {
    super();
    this.gyromagneticRatio = gyromagneticRatio;
    this.key = key;
  }
}
