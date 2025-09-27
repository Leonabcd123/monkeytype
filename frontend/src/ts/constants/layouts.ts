import { LayoutNameSchema, updateLayouts } from "@monkeytype/schemas/layouts";
import Config from "../config";

type Key = string[];
type Row = Key[];
export type Keys = {
  row1: Row;
  row2: Row;
  row3: Row;
  row4: Row;
  row5: Row;
};

export type Template = {
  name: string;
  keymapShowTopRow: boolean;
  type: string;
  keys: Keys;
};

export const customLayoutTemplate: Template = {
  name: "default",
  keymapShowTopRow: false,
  type: "ansi",
  keys: {
    row1: [
      ["`", "~"],
      ["1", "!"],
      ["2", "@"],
      ["3", "#"],
      ["4", "$"],
      ["5", "%"],
      ["6", "^"],
      ["7", "&"],
      ["8", "*"],
      ["9", "("],
      ["0", ")"],
      ["-", "_"],
      ["=", "+"],
    ],
    row2: [[], [], [], [], [], [], [], [], [], [], [], [], []],
    row3: [[], [], [], [], [], [], [], [], [], [], []],
    row4: [[], [], [], [], [], [], [], [], [], []],
    row5: [[" "]],
  },
};

export function getLayoutsList(): readonly string[] {
  if (Config.layoutCreator.name !== null) {
    updateLayouts(Config.layoutCreator.name);
    return LayoutNameSchema._def.values;
  } else {
    return LayoutNameSchema._def.values;
  }
}
