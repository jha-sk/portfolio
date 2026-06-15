/*
 * Career OS content data — mission-log experience entries (D-01 / D-02).
 *
 * Entry `id` slugs are stable known keys; every visible field (role, company,
 * timeline, description, technologies, achievements) is a placeholder filled
 * with the real career history later (CNT2-01). Consumed by EXP-01/02.
 * See ./README.md for the field shapes.
 */
import { TODO } from './placeholders.js';

const entry = (id) => ({
  id,
  role: TODO(`experience.${id}.role`),
  company: TODO(`experience.${id}.company`),
  timeline: TODO(`experience.${id}.timeline`),
  description: TODO(`experience.${id}.description`),
  technologies: TODO(`experience.${id}.technologies`),
  achievements: TODO(`experience.${id}.achievements`),
});

export const experience = [entry('mission-01'), entry('mission-02')];

export default experience;
