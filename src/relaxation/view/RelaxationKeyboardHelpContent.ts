/**
 * RelaxationKeyboardHelpContent.ts
 *
 * Keyboard Shortcuts dialog for the Relaxation screen: sliders and the combo box on the left;
 * time controls and basic actions (buttons, checkboxes, radio buttons) on the right. Wired
 * through the Screen's createKeyboardHelpNode.
 */

import {
  BasicActionsKeyboardHelpSection,
  ComboBoxKeyboardHelpSection,
  SliderControlsKeyboardHelpSection,
  TimeControlsKeyboardHelpSection,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";

export class RelaxationKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    super(
      [new SliderControlsKeyboardHelpSection(), new ComboBoxKeyboardHelpSection()],
      [new TimeControlsKeyboardHelpSection(), new BasicActionsKeyboardHelpSection({ withCheckboxContent: true })],
    );
  }
}
