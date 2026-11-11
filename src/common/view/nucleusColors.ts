/**
 * nucleusColors.ts
 *
 * Maps each nucleus type to its body colour (PhET drew a differently coloured image for
 * each element).
 */

import type { ProfileColorProperty } from "scenerystack/scenery";
import SimplifiedMRIColors from "../../SimplifiedMRIColors.js";
import { NucleusType } from "../model/NucleusType.js";

export function nucleusColor(type: NucleusType): ProfileColorProperty {
  if (type === NucleusType.NITROGEN_14) {
    return SimplifiedMRIColors.nitrogen14ColorProperty;
  }
  if (type === NucleusType.SODIUM_23) {
    return SimplifiedMRIColors.sodium23ColorProperty;
  }
  if (type === NucleusType.CARBON_13) {
    return SimplifiedMRIColors.carbon13ColorProperty;
  }
  if (type === NucleusType.OXYGEN_17) {
    return SimplifiedMRIColors.oxygen17ColorProperty;
  }
  if (type === NucleusType.SULFUR_33) {
    return SimplifiedMRIColors.sulfur33ColorProperty;
  }
  if (type === NucleusType.UNKNOWN) {
    return SimplifiedMRIColors.unknownColorProperty;
  }
  return SimplifiedMRIColors.hydrogen1ColorProperty;
}
