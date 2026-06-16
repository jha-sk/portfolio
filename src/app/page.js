import { SystemHero } from '@/components/system/system-hero';

/*
 * Home route — Career OS single-page layout.
 *
 * The 3D SystemHero is the entire page. Content sections (About, Skills,
 * Experience, Projects, CertsEducation, Contact) are now accessible via:
 *   1. Clicking 3D objects in the WebGL scene (camera fly-to + glass panel)
 *   2. The HUD nav buttons (bottom-center of the hero)
 *   3. Inline rendering inside SystemFallback (no-JS / reduced-motion / SSR for SEO)
 */
export default function HomePage() {
  return <SystemHero />;
}
