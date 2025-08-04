export interface Person {
  id: string;
  name: string;
  description?: string;
}

export interface PairRating {
  person1Id: string;
  person2Id: string;
  rating: number;
}

export interface Constraint {
  id: string;
  person1Id: string;
  person2Id: string;
  type: 'must-pair' | 'cannot-pair';
}

export interface Group {
  id: string;
  members: Person[];
  totalScore: number;
}

export type AppStep = 'input' | 'rating' | 'constraints' | 'configuration' | 'results';
export type AppStep = 'input' | 'rating' | 'configuration' | 'results';