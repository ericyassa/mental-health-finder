
-- Bristol Wellbeing College — moved
UPDATE public.service_contacts
SET value = 'https://www.second-step.co.uk/wellbeing-colleges/bristol-wellbeing-college/'
WHERE lower(type) = 'website'
  AND value = 'https://www.secondstep.co.uk/bristol-wellbeing-college';

-- Talking Money Bristol — old domain dead
UPDATE public.service_contacts
SET value = 'https://talkingmoney.org.uk/'
WHERE lower(type) = 'website'
  AND value = 'https://www.talkingmoneybristol.org.uk';

-- Bristol Bereavement Support Network — domain no longer resolves; redirect to national Cruse
UPDATE public.service_contacts
SET value = 'https://www.cruse.org.uk/get-support/find-support-in-your-area/'
WHERE lower(type) = 'website'
  AND value = 'https://bristolbereavementsupport.org.uk';

-- Families in Focus (FiF) — old page 404
UPDATE public.service_contacts
SET value = 'https://beta.southglos.gov.uk/families-in-focus/'
WHERE lower(type) = 'website'
  AND value = 'https://www.southglos.gov.uk/children-and-families/families-in-focus/';

-- Bristol CC Local Crisis & Prevention Fund — redirected to new slug
UPDATE public.service_contacts
SET value = 'https://www.bristol.gov.uk/residents/benefits-and-financial-help/crisis-payment-scheme/apply-for-an-emergency-payment'
WHERE lower(type) = 'website'
  AND value = 'https://www.bristol.gov.uk/residents/benefits-and-financial-help/local-crisis-prevention-fund-emergency-payments-and-household-goods/apply-for-an-emergency-payment';

-- Add Website + Right to Choose reference for Bristol ADHD Clinic (Psychiatry-UK RTC pathway)
INSERT INTO public.service_contacts (service_id, type, value)
SELECT 'da271033-8fa1-4d24-ad23-c7d84316f1d8'::uuid, 'Website', 'https://psychiatry-uk.com/right-to-choose/'
WHERE NOT EXISTS (
  SELECT 1 FROM public.service_contacts
  WHERE service_id = 'da271033-8fa1-4d24-ad23-c7d84316f1d8'::uuid
    AND lower(type) = 'website'
);

-- Add Website for AWP Adult ADHD Service
INSERT INTO public.service_contacts (service_id, type, value)
SELECT 'f5331fab-2363-4095-938b-e15cc70345c8'::uuid, 'Website', 'https://www.awp.nhs.uk/services/adhd'
WHERE NOT EXISTS (
  SELECT 1 FROM public.service_contacts
  WHERE service_id = 'f5331fab-2363-4095-938b-e15cc70345c8'::uuid
    AND lower(type) = 'website'
);
