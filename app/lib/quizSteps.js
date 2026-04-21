export const QUIZ_STEPS = [
  {
    id: 'brewMethod',
    stepLabel: 'Step 1',
    eyebrow: 'Find your coffee match',
    title: 'How do you usually brew your coffee?',
    description:
      "We'll use this to match you with the most suitable roast profile.",
    options: [
      {value: 'espresso', label: 'Espresso'},
      {value: 'filter', label: 'Filter'},
      {value: 'moka', label: 'Moka pot'},
      {value: 'french_press', label: 'French press'},
      {value: 'milk_drinks', label: 'Milk drinks'},
      {value: 'not_sure', label: 'Not sure yet'},
    ],
  },
  {
    id: 'strength',
    stepLabel: 'Step 2',
    eyebrow: 'Find your coffee match',
    title: 'What strength do you prefer?',
    description: 'Choose the cup that feels closest to your daily taste.',
    options: [
      {value: 'light', label: 'Light'},
      {value: 'medium', label: 'Medium'},
      {value: 'strong', label: 'Strong'},
    ],
  },
  {
    id: 'taste',
    stepLabel: 'Step 3',
    eyebrow: 'Find your coffee match',
    title: 'Which flavour profile sounds best?',
    description: 'A simple preference is enough.',
    options: [
      {value: 'chocolatey', label: 'Chocolatey'},
      {value: 'nutty', label: 'Nutty'},
      {value: 'fruity', label: 'Fruity'},
      {value: 'balanced', label: 'Balanced'},
      {value: 'not_sure', label: 'Not sure'},
    ],
  },
  {
    id: 'acidity',
    stepLabel: 'Step 4',
    eyebrow: 'Find your coffee match',
    title: 'How much acidity is comfortable for you?',
    description: 'This helps avoid coffees that feel too sharp or too flat.',
    options: [
      {value: 'low', label: 'Low'},
      {value: 'medium', label: 'Medium'},
      {value: 'high', label: 'High'},
      {value: 'not_sure', label: 'Not sure'},
    ],
  },
  {
    id: 'experience',
    stepLabel: 'Step 5',
    eyebrow: 'Find your coffee match',
    title: 'What describes you better?',
    description:
      'We can keep it safer for beginners or more specific for experienced drinkers.',
    options: [
      {value: 'beginner', label: 'Beginner'},
      {value: 'experienced', label: 'I know what I like'},
    ],
  },
  {
    id: 'purpose',
    stepLabel: 'Step 6',
    eyebrow: 'Find your coffee match',
    title: 'What are you buying coffee for?',
    description: 'Final step.',
    options: [
      {value: 'everyday', label: 'Everyday coffee'},
      {value: 'special', label: 'Something special'},
      {value: 'gift', label: 'Gift'},
    ],
  },
];