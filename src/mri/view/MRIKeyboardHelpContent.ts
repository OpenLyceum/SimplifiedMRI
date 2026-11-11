/**
 * MRIKeyboardHelpContent.ts
 *
 * Keyboard Shortcuts dialog for the MRI screen: sliders on the left;
 * time controls and basic actions (buttons, checkboxes, radio buttons) on the right. Wired
 * through the Screen's createKeyboardHelpNode.
 */

import {
  BasicActionsKeyboardHelpSection,
  SliderControlsKeyboardHelpSection,
  TimeControlsKeyboardHelpSection,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";

export class MRIKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    super(
      [new SliderControlsKeyboardHelpSection()],
      [new TimeControlsKeyboardHelpSection(), new BasicActionsKeyboardHelpSection({ withCheckboxContent: true })],
    );
  }
}
