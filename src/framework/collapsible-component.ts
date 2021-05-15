export interface CollapsibleElement {
  id: string;
  title: string;
  img?: string;
  color?: string;
  size?: number;
  type?: string;

  satelites?: CollapsibleElement[];
}

export const SystemStruc = {
  System: ["Star"],
  Star: ["Planet"],
  Planet: ["Moon"],
};
