export interface Case {
  id: string;
  name: string;
  age: number;
  initialWeight: number;
  energy: number; // 0-100
  mood: number; // 0-100
  lifestyle: string;
  photoUrl: string;
  goal: string;
}

export interface Choice {
  label: string;
  impactWeight: number;
  impactEnergy: number;
  impactMood: number;
  feedback: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  options: Choice[];
}

export interface SimulationState {
  currentWeek: number;
  weight: number;
  energy: number;
  mood: number;
  history: {
    week: number;
    weight: number;
    energy: number;
    mood: number;
    choiceLabel: string;
  }[];
}
