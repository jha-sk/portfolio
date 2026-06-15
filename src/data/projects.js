/*
 * Career OS content data — project capsules (D-01 / D-02).
 *
 * The 4 seed project NAMES are KNOWN facts (PROJECT.md). Every detail field
 * (overview, architecture, techStack, features, challenges, lessonsLearned,
 * githubUrl, demoUrl, screenshot) is a placeholder filled with real specifics
 * later (CNT2-01). Consumed by PRJ-01..05. See ./README.md for field shapes.
 */
import { TODO } from './placeholders.js';

const capsule = (id, name) => ({
  id,
  name,
  overview: TODO(`project.${id}.overview`),
  architecture: TODO(`project.${id}.architecture`),
  techStack: TODO(`project.${id}.techStack`),
  features: TODO(`project.${id}.features`),
  challenges: TODO(`project.${id}.challenges`),
  lessonsLearned: TODO(`project.${id}.lessonsLearned`),
  githubUrl: TODO(`project.${id}.githubUrl`),
  demoUrl: TODO(`project.${id}.demoUrl`),
  screenshot: TODO(`project.${id}.screenshot`),
});

export const projects = [
  capsule('git-automation-cli', 'Git Automation CLI'),
  capsule('devops-monitoring-dashboard', 'DevOps Monitoring Dashboard'),
  capsule('aem-automation-toolkit', 'AEM Automation Toolkit'),
  capsule('cloud-infrastructure-projects', 'Cloud Infrastructure Projects'),
];

export default projects;
