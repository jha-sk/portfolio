/*
 * Career OS content data — technology constellation nodes (D-01 / D-02).
 *
 * The 11 seed technologies (SKL-01/02/03). Each node's `name` and `category`
 * grouping are KNOWN facts; the `level`, `experience`, `relatedProjects`, and
 * `relatedTech` fields are placeholders filled from real history (CNT2-01).
 * See ./README.md for the convention and field shapes.
 */
import { TODO } from './placeholders.js';

const node = (id, name, category) => ({
  id,
  name,
  category,
  level: TODO(`skill.${id}.level`),
  experience: TODO(`skill.${id}.experience`),
  relatedProjects: TODO(`skill.${id}.relatedProjects`),
  relatedTech: TODO(`skill.${id}.relatedTech`),
});

export const skills = [
  node('golang', 'Golang', 'language'),
  node('react', 'React', 'frontend'),
  node('nextjs', 'Next.js', 'frontend'),
  node('nodejs', 'Node.js', 'backend'),
  node('docker', 'Docker', 'devops'),
  node('kubernetes', 'Kubernetes', 'devops'),
  node('aws', 'AWS', 'cloud'),
  node('linux', 'Linux', 'platform'),
  node('aem', 'AEM', 'platform'),
  node('git', 'Git', 'tooling'),
  node('devops', 'DevOps', 'practice'),
];

export default skills;
