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

export class NucleusType extends EnumerationValue {
  public static readonly HYDROGEN_1 = new NucleusType(42.577, "hydrogen1");
  public static readonly NITROGEN_14 = new NucleusType(3.077, "nitrogen14");
  public static readonly SODIUM_23 = new NucleusType(11.262, "sodium23");
  public static readonly CARBON_13 = new NucleusType(10.708, "carbon13");
  public static readonly OXYGEN_17 = new NucleusType(5.772, "oxygen17");
  public static readonly SULFUR_33 = new NucleusType(3.272, "sulfur33");
  public static readonly UNKNOWN = new NucleusType(12.103, "unknown");

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
