export type NavigationSectionId =
  | 'command-center'
  | 'spatial-lab'
  | 'scenario-studio'
  | 'benchmark-arena'
  | 'dataset-explorer';

export interface NavigationItem {
  id: NavigationSectionId;
  label: string;
  badge?: string;
  iconName: string;
  description: string;
  phaseIntroduced: number;
}
