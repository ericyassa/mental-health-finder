
-- Add sidebar_group column to categories for accordion grouping
ALTER TABLE public.categories ADD COLUMN sidebar_group text;

-- Update categories with their group assignments based on original HTML accordion structure
UPDATE public.categories SET sidebar_group = '🧠 Mental Health Conditions' WHERE name IN (
  'Depression & Low Mood', 'Postnatal Depression', 'Anxiety', 'Panic Disorder',
  'Social Anxiety Disorder', 'Seasonal Affective Disorder (SAD)', 'OCD (Obsessive-Compulsive Disorder)',
  'Bipolar Disorder', 'Schizophrenia', 'Psychosis', 'PTSD (Post-Traumatic Stress Disorder)',
  'Borderline Personality Disorder (BPD)', 'Eating Disorders', 'Emotional Dysregulation & Self-Harm',
  'Self-Harm', 'Addiction - Drugs & Alcohol', 'ADHD', 'Autism Spectrum Disorder (ASD)',
  'Learning Disabilities', 'Trauma & PTSD', 'Recovery & Wellbeing'
);

UPDATE public.categories SET sidebar_group = '👨‍👩‍👧 Youth & Family Support' WHERE name IN (
  'Youth Mental Health', 'Mentoring & Personal Development', 'Parenting Support',
  'Family Wellbeing Services', 'Youth Social Services', 'Young People (11-25)',
  'Carers Support', 'Women''s Mental Health Services'
);

UPDATE public.categories SET sidebar_group = '🏠 Housing & Homelessness' WHERE name IN (
  'Emergency Accommodation', 'Supported Housing', 'Homelessness Recovery',
  'Youth Housing', 'Addiction & Housing Support'
);

UPDATE public.categories SET sidebar_group = '💼 Employment Support' WHERE name IN (
  'Employment for People in Recovery', 'Disability Employment', 'Job Training & Skills',
  'Supported Employment', 'Youth Employment'
);

UPDATE public.categories SET sidebar_group = '💰 Financial & Debt Support' WHERE name IN (
  'Debt Advice', 'Benefits & Grants', 'Budgeting Support',
  'Financial Crisis Support', 'Food & Financial Support'
);

UPDATE public.categories SET sidebar_group = '⚖️ Advocacy & Legal Support' WHERE name IN (
  'Independent Advocacy', 'NHS Complaints Advocacy', 'Welfare & Housing Law',
  'Mental Health Advocacy', 'LGBT+ Mental Health Support', 'Racism & Discrimination Support',
  'Domestic Abuse - Victims', 'Domestic Abuse - Perpetrators',
  'Sexual Violence & Abuse Support', 'Sexual Violence Support'
);

UPDATE public.categories SET sidebar_group = '🍞 Food & Emergency Aid' WHERE name IN (
  'Foodbanks', 'Community Food Support', 'Refugee Food & Support', 'Emergency Household Support'
);

UPDATE public.categories SET sidebar_group = '🪑 Furniture & Household Support' WHERE name IN (
  'Low-Cost Furniture', 'Appliance Support', 'Furniture Reuse', 'Community Sharing'
);

UPDATE public.categories SET sidebar_group = '👴 Older Adults & Ageing' WHERE name IN (
  'Dementia Support', 'Social Isolation & Loneliness', 'Elder Care Services', 'Bereavement & Loss'
);

UPDATE public.categories SET sidebar_group = '🏥 Physical Health & Wellbeing' WHERE name IN (
  'Chronic Pain Support', 'Sexual Health Services', 'Exercise & Activity Programmes', 'Long-Term Health Conditions'
);

UPDATE public.categories SET sidebar_group = '🎓 Education & Learning' WHERE name IN (
  'Adult Education', 'Digital Skills', 'English Language (ESOL)', 'Special Educational Needs (SEN)'
);

UPDATE public.categories SET sidebar_group = '🌍 Cultural & Community Support' WHERE name IN (
  'Refugee & Asylum Seeker Support', 'Faith-Based Support', 'BAME Mental Health', 'Community Centres & Hubs'
);

UPDATE public.categories SET sidebar_group = '♿ Disability & Accessibility' WHERE name IN (
  'Physical Disability Support', 'Sensory Impairment', 'Assistive Technology',
  'Disability Benefits & Rights', 'Transport & Mobility'
);

UPDATE public.categories SET sidebar_group = '🌿 Nature & Creative Therapies' WHERE name IN (
  'Ecotherapy & Nature', 'Art & Music Therapy', 'Animal-Assisted Therapy', 'Gardening & Allotments'
);

UPDATE public.categories SET sidebar_group = '🤝 Community & Volunteering' WHERE name IN (
  'Volunteering Opportunities', 'Peer Support Networks'
);

-- Special items without group: Signposting Board, Crisis Support, Suicide Prevention, AWP Staff Wellbeing
-- They stay with sidebar_group = NULL
