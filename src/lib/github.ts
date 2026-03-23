import { browser } from '$app/environment';

export interface RepoInfo {
	name: string;
	stars: number;
	description: string;
	language: string;
	forks: number;
	openIssues: number;
	lastCommitDate: string;
	lastCommitMessage: string;
	totalCommits: number;
}

const REPOS = [
	'pardus-gnome-greeter',
	'pardus-nvidia-installer',
	'pardus-gnome-shortcuts',
];

let cache: Record<string, RepoInfo> = {};
let fetched = false;

async function fetchCommitInfo(name: string): Promise<{ date: string; message: string; total: number }> {
	try {
		const res = await fetch(`https://api.github.com/repos/pardus/${name}/commits?per_page=1`);
		if (!res.ok) return { date: '?', message: '?', total: 0 };

		const linkHeader = res.headers.get('Link');
		let total = 1;
		if (linkHeader) {
			const match = linkHeader.match(/page=(\d+)>; rel="last"/);
			if (match) total = parseInt(match[1]);
		}

		const commits = await res.json();
		const latest = commits[0];
		return {
			date: latest?.commit?.committer?.date ?? '?',
			message: latest?.commit?.message?.split('\n')[0] ?? '?',
			total,
		};
	} catch {
		return { date: '?', message: '?', total: 0 };
	}
}

export async function fetchRepos(): Promise<Record<string, RepoInfo>> {
	if (fetched) return cache;
	if (!browser) return cache;

	try {
		const results = await Promise.all(
			REPOS.map(async (name) => {
				const [repoRes, commitInfo] = await Promise.all([
					fetch(`https://api.github.com/repos/pardus/${name}`),
					fetchCommitInfo(name),
				]);

				if (!repoRes.ok) return null;
				const data = await repoRes.json();

				return {
					name,
					stars: data.stargazers_count ?? 0,
					description: data.description ?? 'No description',
					language: data.language ?? 'Unknown',
					forks: data.forks_count ?? 0,
					openIssues: data.open_issues_count ?? 0,
					lastCommitDate: commitInfo.date,
					lastCommitMessage: commitInfo.message,
					totalCommits: commitInfo.total,
				} as RepoInfo;
			})
		);

		for (const repo of results) {
			if (repo) cache[repo.name] = repo;
		}
		fetched = true;
	} catch {
		// silently fail
	}

	return cache;
}

export function getStars(repoName: string): string {
	return cache[repoName]?.stars?.toString() ?? '...';
}
