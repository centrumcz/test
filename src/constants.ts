import { Case, Challenge } from './types';

export const CASES: Case[] = [
  {
    id: 'office-alex',
    name: 'Alex',
    age: 32,
    initialWeight: 95,
    energy: 40,
    mood: 50,
    lifestyle: 'Highly sedentary, frequent late-night coding sessions.',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600&h=600',
    goal: 'Weight loss without burning out.'
  },
  {
    id: 'busy-sarah',
    name: 'Sarah',
    age: 42,
    initialWeight: 78,
    energy: 20,
    mood: 40,
    lifestyle: 'Full-time teacher and mother of two. Constantly stressed.',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600&h=600',
    goal: 'Regain energy and manage weight sustainably.'
  }
];

export const WEEKLY_CHALLENGES: Challenge[] = [
  {
    id: 'week-1',
    title: 'The Office Birthday Bash',
    description: 'It\'s Monday afternoon and the team is celebrating. There are donuts, bagels, and a giant chocolate cake in the breakroom. Everyone is hanging out.',
    options: [
      {
        label: 'Politely decline and stick to your lunch prep.',
        impactWeight: -0.5,
        impactEnergy: -10,
        impactMood: -10,
        feedback: 'Good discipline! Use of willpower kept calories low, but you missed out on social connection and felt a bit restricted.'
      },
      {
        label: 'Have a small slice of cake and join the chat.',
        impactWeight: 0.1,
        impactEnergy: 5,
        impactMood: 15,
        feedback: 'The "moderate" approach. A small caloric bump, but the social interaction and small treat boosted your mood significantly.'
      },
      {
        label: 'Go all out—it\'s a celebration!',
        impactWeight: 0.8,
        impactEnergy: -20,
        impactMood: 10,
        feedback: 'You enjoyed the moment, but the subsequent sugar crash left you sluggish for the rest of the day.'
      }
    ]
  },
  {
    id: 'week-2',
    title: 'Extreme Deadline Stress',
    description: 'You have a major project due Friday. You\'re exhausted and tempted to skip the gym to keep working or just sleep in.',
    options: [
      {
        label: 'Force a 20-min session to clear your head.',
        impactWeight: -0.3,
        impactEnergy: 20,
        impactMood: 10,
        feedback: 'Movement actually cleared your mental fog. Though hard to start, it paid off in productivity.'
      },
      {
        label: 'Order takeout and work through the night.',
        impactWeight: 0.5,
        impactEnergy: -30,
        impactMood: -20,
        feedback: 'Work is done, but your body is paying the price. High sodium and lack of sleep are showing on the scale.'
      }
    ]
  },
  {
    id: 'week-3',
    title: 'The Weekend BBQ',
    description: 'Friends invited you to a cookout. Alcohol, burgers, and side dishes are everywhere.',
    options: [
      {
        label: 'Stick to grilled chicken and sparkling water.',
        impactWeight: -0.4,
        impactEnergy: 5,
        impactMood: -5,
        feedback: 'Physically you feel great, though watching others eat ribs was a mental test.'
      },
      {
        label: 'Enjoy one burger and a drink, then stop.',
        impactWeight: 0.1,
        impactEnergy: 0,
        impactMood: 10,
        feedback: 'Balance is key. You participated in the fun without derailing your progress.'
      }
    ]
  },
  {
    id: 'week-4',
    title: 'Fatigue Hits Hard',
    description: 'You haven\'t seen progress on the scale this week. You feel like giving up on the plan.',
    options: [
      {
        label: 'Reflect on "non-scale victories" (better sleep).',
        impactWeight: -0.1,
        impactEnergy: 5,
        impactMood: 20,
        feedback: 'Mental resilience! Recognizing progress beyond weight keeps you motivated for the long haul.'
      },
      {
        label: 'Start a "crash diet" to force a results change.',
        impactWeight: -1.2,
        impactEnergy: -50,
        impactMood: -40,
        feedback: 'The weight dropped, but you are now irritable and exhausted. This is not sustainable.'
      }
    ]
  }
];
