/**
 * SimplifiedMRIPanel.ts
 *
 * A pre-themed Panel that automatically uses SimplifiedMRIColors for background and
 * border. Use this for all control panels and info boxes in the sim so that
 * default / projector mode switching is handled automatically.
 *
 * ── Basic usage ───────────────────────────────────────────────────────────────
 *
 *   import { SimplifiedMRIPanel } from "../../common/SimplifiedMRIPanel.js";
 *   import { VBox, Text } from "scenerystack/scenery";
 *
 *   const content = new VBox({
 *     children: [ new Text("label"), slider ],
 *     spacing: 8,
 *   });
 *   const panel = new SimplifiedMRIPanel(content);
 *
 * ── Overriding defaults ───────────────────────────────────────────────────────
 *
 *   // Wider margins, sharper corners, custom stroke
 *   const panel = new SimplifiedMRIPanel(content, { xMargin: 20, cornerRadius: 0 });
 *
 *   // Transparent background (decorative border only)
 *   const panel = new SimplifiedMRIPanel(content, { fill: "transparent" });
 */

import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { Node } from "scenerystack/scenery";
import { Panel, type PanelOptions } from "scenerystack/sun";
import SimplifiedMRIColors from "../SimplifiedMRIColors.js";
import { CONTROL_WIDTH, PANEL, PANEL_CORNER_RADIUS } from "../SimplifiedMRIConstants.js";

export type SimplifiedMRIPanelOptions = PanelOptions;

export class SimplifiedMRIPanel extends Panel {
  public constructor(content: Node, providedOptions?: SimplifiedMRIPanelOptions) {
    const options = optionize<SimplifiedMRIPanelOptions, EmptySelfOptions, PanelOptions>()(
      {
        fill: SimplifiedMRIColors.panelBackgroundColorProperty,
        stroke: SimplifiedMRIColors.panelBorderColorProperty,
        cornerRadius: PANEL_CORNER_RADIUS,
        xMargin: PANEL.X_MARGIN,
        yMargin: PANEL.Y_MARGIN,

        // Panels in a column share a width: the control width plus margins.
        minWidth: CONTROL_WIDTH + PANEL.CONTENT_WIDTH_INSET,
      },
      providedOptions,
    );
    super(content, options);
  }
}
