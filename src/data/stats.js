/*
 * Career OS content data — dashboard stats (D-01 / D-02).
 *
 * Five labelled metrics for the dashboard cards (DASH-01). The labels and the
 * optional `unit` suffix are KNOWN; the numeric VALUES are placeholders until
 * filled with real figures (CNT2-01). See ./README.md for the convention.
 */
import { TODO } from './placeholders.js';

export const stats = [
  { id: 'years', label: 'Years of Experience', value: TODO('yearsOfExperience'), unit: '+' },
  { id: 'projects', label: 'Projects Built', value: TODO('projectsBuilt'), unit: '+' },
  { id: 'technologies', label: 'Technologies', value: TODO('technologiesCount'), unit: '+' },
  { id: 'repositories', label: 'Repositories', value: TODO('repositoriesCount'), unit: '' },
  {
    id: 'oss',
    label: 'Open Source Contributions',
    value: TODO('openSourceContributions'),
    unit: '+',
  },
];

export default stats;
