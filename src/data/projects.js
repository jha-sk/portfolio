/*
 * Sourabh Jha portfolio content data — project capsules.
 */
export const projects = [
  {
    id: 'ash-os',
    name: 'Ash OS',
    stack: ['Linux', 'Shell', 'Lua', 'GitHub Actions', 'Docker'],
    summary: 'A lightweight Linux distribution optimized for older hardware with enhanced audio and performance.',
    highlight: '66.7% lower storage · 24% lower RAM vs Fedora',
    bullets: [
      'Developed a lightweight Linux distribution optimized for older hardware with enhanced audio and performance.',
      'Achieved 66.7% lower storage usage and 24% lower RAM consumption compared to Fedora.',
      'Automated ISO build and release flow using Docker and GitHub Actions.',
    ],
    github: 'https://github.com/jha-sk',
    demo: null,
  },
  {
    id: 'website-nativefier',
    name: 'Website Nativefier',
    stack: ['Go', 'Electron', 'Tailwind', 'Docker', 'Kubernetes', 'Terraform', 'Azure'],
    summary: 'A Go-based tool that converts websites into native-like Electron apps.',
    highlight: 'Deployed on AKS via Docker + Terraform',
    bullets: [
      'Built a Go-based tool that converts websites into native-like Electron apps.',
      'Deployed the tool using Docker, AKS, and Terraform with automated CI/CD via GitHub Actions.',
    ],
    github: 'https://github.com/jha-sk',
    demo: null,
  },
  {
    id: 'git-automation-cli',
    name: 'Git Automation CLI',
    stack: ['Go', 'Cobra', 'fsnotify', 'Git'],
    summary: 'A Git repository monitoring tool that tracks branches, commits, merges, and repo activity in real time.',
    highlight: 'Real-time multi-repo monitoring',
    bullets: [
      'Built a Git repository monitoring tool capable of tracking branch creation, deletion, commits, merges, and repository activity in real time.',
      'Implemented filesystem event monitoring using fsnotify and Git metadata inspection through native Git commands.',
      'Developed persistent logging, colorized terminal output, and multi-repository monitoring capabilities.',
      'Designed for developer productivity, repository auditing, and engineering workflow automation.',
    ],
    github: 'https://github.com/jha-sk',
    demo: null,
  },
];

export default projects;
