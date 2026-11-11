/**
 * simplifiedMRIQueryParameters.ts
 *
 * Public query parameters for the simulation.
 *
 *   ?snapToResonance=false   turn off PhET's snap-to: releasing the field or frequency slider
 *                            close to resonance no longer moves it onto resonance, so
 *                            students have to find resonance themselves.
 */

import { logGlobal } from "scenerystack/phet-core";
import { QueryStringMachine } from "scenerystack/query-string-machine";
import SimplifiedMRINamespace from "../SimplifiedMRINamespace.js";

const simplifiedMRIQueryParameters = QueryStringMachine.getAll({
  snapToResonance: {
    type: "boolean",
    defaultValue: true,
    public: true,
  },
});

SimplifiedMRINamespace.register("simplifiedMRIQueryParameters", simplifiedMRIQueryParameters);

logGlobal("phet.chipper.queryParameters");

export default simplifiedMRIQueryParameters;
