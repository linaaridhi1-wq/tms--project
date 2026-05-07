/**
 * Yellomind Company Profile
 * This is the static anchor injected into every AI scoring prompt.
 * It defines WHO we are, so the LLM can score tenders relative to our capabilities.
 */
const COMPANY_PROFILE = {
  name: 'Yellomind',
  tagline: 'Business Transformation & IT Governance Consulting',
  founded: 2015,
  regions: ['Tunisia', 'UAE', 'Morocco', 'Algeria', 'MENA', 'Africa', 'France', 'Europe'],
  sectors: ['Government', 'Healthcare', 'Finance', 'Education', 'Telecom', 'Industry', 'Energy'],
  languages: ['French', 'Arabic', 'English'],

  service_catalog: [
    {
      code: 'S1-S4',
      area: 'Strategic Consulting & Digital Transformation',
      keywords: [
        'strategy', 'digital maturity', 'KPI', 'balanced scorecard',
        'change management', 'digital transformation', 'transformation digitale',
        'stratégie', 'maturité numérique', 'conduite du changement',
      ],
    },
    {
      code: 'S5-S8',
      area: 'PMO & Project Governance',
      keywords: [
        'PMO', 'P3M3', 'project management', 'portfolio', 'PRINCE2', 'governance',
        'gestion de projet', 'portefeuille de projets', 'gouvernance', 'bureau de projet',
      ],
    },
    {
      code: 'S9-S12',
      area: 'Enterprise Process Optimization',
      keywords: [
        'process reengineering', 'lean', 'six sigma', 'digitalization',
        'operations', 'optimisation', 'réingénierie', 'processus métier', 'BPM',
      ],
    },
    {
      code: 'S13-S19',
      area: 'Risk, Compliance & Resilience',
      keywords: [
        'ISO 27001', 'ISO 22301', 'GRC', 'risk management', 'COBIT',
        'business continuity', 'conformité', 'gestion des risques', 'PCA', 'PRA',
        'cybersecurity', 'sécurité', 'risk', 'risque',
      ],
    },
    {
      code: 'S20-S25',
      area: 'Enterprise Architecture',
      keywords: [
        'TOGAF', 'enterprise architecture', 'ADOIT', 'IT architecture', 'EAO',
        'architecture d\'entreprise', 'urbanisation', 'cartographie SI',
      ],
    },
    {
      code: 'S26-S30',
      area: 'IT Governance',
      keywords: [
        'COBIT', 'IT governance', 'IT risk', 'IT value management',
        'gouvernance IT', 'gouvernance informatique', 'schéma directeur',
      ],
    },
    {
      code: 'S31-S39',
      area: 'ISO Certification & Audit',
      keywords: [
        'ISO 9001', 'ISO 20000', 'ISO 27001', 'ISO 31000', 'ISO 42001',
        'ISO 21001', 'certification', 'audit', 'conformité ISO', 'accréditation',
      ],
    },
    {
      code: 'S40-S44',
      area: 'AI, Data Governance & Analytics',
      keywords: [
        'data governance', 'AI', 'analytics', 'OVALEDGE', 'data catalog',
        'GDPR', 'intelligence artificielle', 'gouvernance des données',
        'data management', 'business intelligence', 'BI', 'machine learning',
      ],
    },
    {
      code: 'S45-S50',
      area: 'Training & Capacity Building',
      keywords: [
        'training', 'formation', 'capacity building', 'certification prep',
        'workshop', 'atelier', 'e-learning', 'développement compétences',
      ],
    },
  ],

  typical_budget_range_eur: { min: 15000, max: 200000 },
  typical_team_size: '3-30 consultants',
  average_project_duration_weeks: { min: 4, max: 52 },

  certifications: [
    'TOGAF', 'COBIT 2019', 'P3M3', 'PRINCE2', 'ITIL 4',
    'PeopleCert', 'PECB ISO', 'MSP', 'MoP',
  ],

  track_record: '50+ projects delivered, 300+ workshops, 1000+ professionals trained',

  competitive_strengths: [
    'Deep MENA market expertise',
    'Bilingual French/Arabic delivery capability',
    'End-to-end ISO certification support',
    'Proven PMO setup track record in public sector',
    'AI & data governance emerging practice',
  ],
};

module.exports = COMPANY_PROFILE;
