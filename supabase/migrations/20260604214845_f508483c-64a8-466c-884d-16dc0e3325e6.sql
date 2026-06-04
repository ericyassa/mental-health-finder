
INSERT INTO public.services (category_id, name, type, description, sort_order) VALUES
('a79ae0df-b5f6-4860-9926-f36011c95995', 'Families in Focus (FiF) – South Gloucestershire', 'Family Support', 'Families in Focus (FiF) is our local name for the national Supporting Families initiative in South Gloucestershire. It provides intensive, whole-family support for families with multiple complex needs (including mental health, housing, employment, education, and domestic abuse). A keyworker coordinates services across agencies to reduce duplication and improve outcomes for children and parents.', 3);

INSERT INTO public.service_contacts (service_id, type, value, sort_order)
SELECT s.id, 'phone', '01454 868000', 1
FROM public.services s
WHERE s.name = 'Families in Focus (FiF) – South Gloucestershire'
UNION ALL
SELECT s.id, 'website', 'https://www.southglos.gov.uk/children-and-families/families-in-focus/', 2
FROM public.services s
WHERE s.name = 'Families in Focus (FiF) – South Gloucestershire'
UNION ALL
SELECT s.id, 'email', 'familiesinfocus@southglos.gov.uk', 3
FROM public.services s
WHERE s.name = 'Families in Focus (FiF) – South Gloucestershire';
