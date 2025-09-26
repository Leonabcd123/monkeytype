import { LayoutName, LayoutNameSchema } from "@monkeytype/schemas/layouts";

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
  keymapShowTopRow: boolean;
  type: string;
  keys: Keys;
};

export const customLayoutTemplate: Template = {
  keymapShowTopRow: false,
  type: "ansi",
  keys: {
    row1: [
      ["", "~"],
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

export const LayoutsList: LayoutName[] = LayoutNameSchema._def.values;
