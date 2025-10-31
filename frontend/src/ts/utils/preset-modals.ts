import { ValidatedHtmlInputElement } from "../elements/input-validation";

export let presetNameEl: ValidatedHtmlInputElement | null = null;

export function checkValidPresetName(
  presetEl: ValidatedHtmlInputElement | null
): boolean {
  if (presetEl?.getValidationResult().status === "failed") {
    return false;
  }

  return true;
}
