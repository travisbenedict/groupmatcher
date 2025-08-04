import { Person, PairRating, Constraint, Group } from '../types';

export function generatePairs(people: Person[]): Array<{ person1: Person; person2: Person }> {
  const pairs = [];
  for (let i = 0; i < people.length; i++) {
    for (let j = i + 1; j < people.length; j++) {
      pairs.push({ person1: people[i], person2: people[j] });
    }
  }
  return pairs;
}

export function getRatingForPair(person1Id: string, person2Id: string, ratings: PairRating[]): number {
  const rating = ratings.find(r => 
    (r.person1Id === person1Id && r.person2Id === person2Id) ||
    (r.person1Id === person2Id && r.person2Id === person1Id)
  );
  return rating?.rating || 3; // Default neutral rating
}

export function calculateGroupScore(group: Person[], ratings: PairRating[]): number {
  let totalScore = 0;
  for (let i = 0; i < group.length; i++) {
    for (let j = i + 1; j < group.length; j++) {
      totalScore += getRatingForPair(group[i].id, group[j].id, ratings);
    }
  }
  return totalScore;
}

export function optimizeGroups(
  people: Person[],
  ratings: PairRating[],
  constraints: Constraint[],
  groupSize: number
): Group[] {
  const numGroups = Math.ceil(people.length / groupSize);
  const groups: Group[] = Array.from({ length: numGroups }, (_, i) => ({
    id: `group-${i}`,
    members: [],
    totalScore: 0
  }));

  // Handle must-pair constraints first
  const mustPairConstraints = constraints.filter(c => c.type === 'must-pair');
  const cannotPairConstraints = constraints.filter(c => c.type === 'cannot-pair');
  
  const assignedPeople = new Set<string>();
  
  // Assign must-pair people to same groups
  for (const constraint of mustPairConstraints) {
    if (!assignedPeople.has(constraint.person1Id) && !assignedPeople.has(constraint.person2Id)) {
      const person1 = people.find(p => p.id === constraint.person1Id);
      const person2 = people.find(p => p.id === constraint.person2Id);
      
      if (person1 && person2) {
        // Find group with most space
        const targetGroup = groups.reduce((best, current) => 
          current.members.length < best.members.length ? current : best
        );
        
        if (targetGroup.members.length + 2 <= groupSize) {
          targetGroup.members.push(person1, person2);
          assignedPeople.add(person1.id);
          assignedPeople.add(person2.id);
        }
      }
    }
  }

  // Assign remaining people using greedy approach
  const unassignedPeople = people.filter(p => !assignedPeople.has(p.id));
  
  for (const person of unassignedPeople) {
    let bestGroup = null;
    let bestScore = -Infinity;
    
    for (const group of groups) {
      if (group.members.length >= groupSize) continue;
      
      // Check cannot-pair constraints
      const hasConflict = cannotPairConstraints.some(constraint => {
        const isInvolvedInConstraint = constraint.person1Id === person.id || constraint.person2Id === person.id;
        if (!isInvolvedInConstraint) return false;
        
        const otherPersonId = constraint.person1Id === person.id ? constraint.person2Id : constraint.person1Id;
        return group.members.some(member => member.id === otherPersonId);
      });
      
      if (hasConflict) continue;
      
      // Calculate score improvement if person joins this group
      let scoreImprovement = 0;
      for (const member of group.members) {
        scoreImprovement += getRatingForPair(person.id, member.id, ratings);
      }
      
      if (scoreImprovement > bestScore) {
        bestScore = scoreImprovement;
        bestGroup = group;
      }
    }
    
    if (bestGroup) {
      bestGroup.members.push(person);
    } else {
      // Find group with least members if no good fit
      const fallbackGroup = groups.reduce((best, current) => 
        current.members.length < best.members.length ? current : best
      );
      fallbackGroup.members.push(person);
    }
  }

  // Calculate final scores
  groups.forEach(group => {
    group.totalScore = calculateGroupScore(group.members, ratings);
  });

  return groups.filter(group => group.members.length > 0);
}

export function parseCsv(csvText: string): Person[] {
  const lines = csvText.trim().split('\n');
  const people: Person[] = [];
  
  for (let i = 1; i < lines.length; i++) { // Skip header
    const [name, description = ''] = lines[i].split(',').map(s => s.trim().replace(/"/g, ''));
    if (name) {
      people.push({
        id: `person-${Date.now()}-${i}`,
        name,
        description
      });
    }
  }
  
  return people;
}