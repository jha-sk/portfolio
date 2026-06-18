'use client';

/**
 * GithubStats — live proof-of-work pulled from the public GitHub API.
 *
 * Fetches the profile (public repos, followers) + the most-starred repos for
 * the given username, client-side (GitHub API supports CORS). Results are
 * cached in localStorage for an hour so repeat visits / re-opens don't burn
 * the unauthenticated rate limit. Fails silently (renders nothing) if the API
 * is unreachable or rate-limited — it's an enhancement, never a blocker.
 *
 * Dichromatic, mono, terminal-styled to match the Sourabh Jha portfolio.
 */

import { useEffect, useState } from 'react';
import { Star, GitBranch, Users, Github } from 'lucide-react';

const CACHE_KEY = 'sj-portfolio:gh-stats';
const TTL_MS = 60 * 60 * 1000; // 1 hour

async function fetchStats(username) {
  const [profileRes, reposRes] = await Promise.all([
    fetch(`https://api.github.com/users/${username}`),
    fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`),
  ]);
  if (!profileRes.ok || !reposRes.ok) throw new Error('github fetch failed');
  const profile = await profileRes.json();
  const repos = await reposRes.json();

  const topRepos = (Array.isArray(repos) ? repos : [])
    .filter((r) => !r.fork)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 3)
    .map((r) => ({
      name: r.name,
      url: r.html_url,
      stars: r.stargazers_count,
      lang: r.language,
    }));

  return {
    repos: profile.public_repos ?? 0,
    followers: profile.followers ?? 0,
    topRepos,
  };
}

function readCache(username) {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.username !== username) return null;
    if (Date.now() - parsed.at > TTL_MS) return null;
    return parsed.data;
  } catch (_) {
    return null;
  }
}

function writeCache(username, data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ username, at: Date.now(), data }));
  } catch (_) { /* ignore quota */ }
}

export function GithubStats({ username = 'jha-sk' }) {
  const [data, setData] = useState(null);
  const [state, setState] = useState('loading'); // loading | ready | error

  useEffect(() => {
    let alive = true;
    const cached = readCache(username);
    if (cached) {
      setData(cached);
      setState('ready');
      return undefined;
    }
    fetchStats(username)
      .then((d) => {
        if (!alive) return;
        setData(d);
        setState('ready');
        writeCache(username, d);
      })
      .catch(() => { if (alive) setState('error'); });
    return () => { alive = false; };
  }, [username]);

  if (state === 'error') return null; // enhancement only

  const Stat = ({ icon: Icon, value, label }) => (
    <span className="inline-flex items-center gap-1.5">
      <Icon className="w-3.5 h-3.5 text-fg3" aria-hidden="true" />
      <b className="text-fg" style={{ fontWeight: 600 }}>
        {state === 'loading' ? '—' : value}
      </b>
      <span className="text-fg3">{label}</span>
    </span>
  );

  return (
    <div
      className="mb-8 rounded-xl p-4"
      style={{
        background: 'rgba(178,213,229,0.04)',
        border: '1px solid rgba(178,213,229,0.12)',
      }}
    >
      {/* header row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <a
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 font-mono text-label text-fg2 hover:text-fg transition-colors"
        >
          <Github className="w-4 h-4" aria-hidden="true" />
          @{username}
          <span className="text-fg3">· live</span>
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: 'var(--fg)', boxShadow: '0 0 8px var(--fg)' }}
            aria-hidden="true"
          />
        </a>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-label">
          <Stat icon={GitBranch} value={data?.repos} label="repos" />
          <Stat icon={Users} value={data?.followers} label="followers" />
        </div>
      </div>

      {/* top repos */}
      {state === 'ready' && data?.topRepos?.length > 0 && (
        <div className="mt-3 flex flex-col gap-1.5 border-t pt-3" style={{ borderColor: 'rgba(178,213,229,0.1)' }}>
          {data.topRepos.map((r) => (
            <a
              key={r.name}
              href={r.url}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-between gap-3 font-mono text-label text-fg2 hover:text-fg transition-colors"
            >
              <span className="truncate">{r.name}</span>
              <span className="flex items-center gap-3 shrink-0 text-fg3">
                {r.lang && <span>{r.lang}</span>}
                <span className="inline-flex items-center gap-1">
                  <Star className="w-3 h-3" aria-hidden="true" />
                  {r.stars}
                </span>
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default GithubStats;
