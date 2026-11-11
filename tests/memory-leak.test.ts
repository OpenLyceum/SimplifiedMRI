/**
 * Memory-leak regression suite (fleet standard).
 *
 * Lists every model object with a dispose() and a factory that builds a fresh instance. The
 * shared harness in tests/helpers/memoryLeak.ts (template-owned) checks that each one is
 * garbage collected after dispose() and leaves no survivors across repeated cycles.
 */

import { Random, Vector2 } from "scenerystack/dot";
import { Detector } from "../src/common/model/Detector.js";
import { Nucleus } from "../src/common/model/Nucleus.js";
import { TimeModel } from "../src/common/TimeModel.js";
import { describeDisposalLeaks } from "./helpers/memoryLeak.js";

describeDisposalLeaks([
  { name: "TimeModel", create: () => new TimeModel(), idempotentDispose: true },
  { name: "Detector", create: () => new Detector() },
  { name: "Nucleus", create: () => new Nucleus(new Vector2(1, 2), "aligned", new Random({ seed: 1 })) },
]);
