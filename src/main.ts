/**
 * main.ts
 *
 * Entry point for the simulation. Initializes SceneryStack, creates the
 * screens, and starts the main event loop.
 *
 * !! CRITICAL IMPORT ORDER !!
 * brand.js MUST be the first import. Each module imports the next, so the import nesting is
 *
 *   main → brand → splash → assert → init
 *
 * and therefore the actual EXECUTION order (deepest import runs first) is the reverse:
 *
 *   init → assert → splash → brand → main
 *
 * SceneryStack requires this exact load order. Never reorder these imports.
 */

// brand.js MUST be first; importing it runs the whole chain (init→assert→splash→brand) before main.
import "./brand.js";

import { onReadyToLaunch, PreferencesModel, Sim } from "scenerystack/sim";
import { Tandem } from "scenerystack/tandem";
import { StringManager } from "./i18n/StringManager.js";
import { MRIScreen } from "./mri/MRIScreen.js";
import { NMRScreen } from "./nmr/NMRScreen.js";
import { SimplifiedMRIPreferencesModel } from "./preferences/SimplifiedMRIPreferencesModel.js";
import { SimplifiedMRIPreferencesNode } from "./preferences/SimplifiedMRIPreferencesNode.js";
import { RelaxationScreen } from "./relaxation/RelaxationScreen.js";
import SimplifiedMRIColors from "./SimplifiedMRIColors.js";

onReadyToLaunch(() => {
  const stringManager = StringManager.getInstance();

  // Simulation-specific preferences; initial values come from simplifiedMRIQueryParameters.
  const simPreferences = new SimplifiedMRIPreferencesModel(Tandem.ROOT.createTandem("preferences"));

  const screens = [
    new NMRScreen(simPreferences.snapToResonanceProperty, {
      name: stringManager.getScreenNames().nmrStringProperty,
      tandem: Tandem.ROOT.createTandem("nmrScreen"),
      backgroundColorProperty: SimplifiedMRIColors.backgroundColorProperty,
    }),
    new MRIScreen(simPreferences.snapToResonanceProperty, {
      name: stringManager.getScreenNames().mriStringProperty,
      tandem: Tandem.ROOT.createTandem("mriScreen"),
      backgroundColorProperty: SimplifiedMRIColors.backgroundColorProperty,
    }),
    new RelaxationScreen({
      name: stringManager.getScreenNames().relaxationStringProperty,
      tandem: Tandem.ROOT.createTandem("relaxationScreen"),
      backgroundColorProperty: SimplifiedMRIColors.backgroundColorProperty,
    }),
  ];

  const sim = new Sim(stringManager.getTitleStringProperty(), screens, {
    preferencesModel: new PreferencesModel({
      visualOptions: {
        // Adds a "Projector Mode" toggle in Preferences → Visual
        supportsProjectorMode: true,
        // Enables keyboard-navigation highlight outlines
        supportsInteractiveHighlights: true,
      },
      simulationOptions: {
        customPreferences: [
          {
            createContent: (tandem: Tandem) => new SimplifiedMRIPreferencesNode(simPreferences, tandem),
          },
        ],
      },
      localizationOptions: {
        // Adds a language picker in Preferences → Language
        supportsDynamicLocale: true,
      },
    }),

    // Optional: fill in credits shown in Help → About
    // Credits shown in Help → About. The original Java sim is PhET's "Simplified MRI".
    credits: {
      leadDesign: "Michael Dubson, Sam McKagan, Kathy Perkins, Carl Wieman (PhET original)",
      softwareDevelopment: "Ron LeMaster (PhET Java original); OpenLyceum SceneryStack port",
      team: "Danielle Harlow (PhET interviews)",
      qualityAssurance: "",
    },
  });

  sim.start();
});
