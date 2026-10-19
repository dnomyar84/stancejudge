declare module "mannequin-js/src/bodies/Male.js" {
  import type { Object3D } from "three";
  export class Male extends Object3D {
    constructor(height?: number);
    stepOnGround(): void;
  }
}

declare module "mannequin-js/src/globals.js" {
  export const GROUND_LEVEL: number;
}
