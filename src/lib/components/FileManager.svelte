<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchRepos, type RepoInfo } from '$lib/github';

	interface Project {
		name: string;
		repo: string;
		fallbackDescription: string;
		fallbackLanguage: string;
	}

	const projects: Project[] = [
		{
			name: 'pardus-gnome-greeter',
			repo: 'pardus-gnome-greeter',
			fallbackDescription: 'A login/greeter screen for GNOME on Pardus',
			fallbackLanguage: 'Python',
		},
		{
			name: 'pardus-nvidia-installer',
			repo: 'pardus-nvidia-installer',
			fallbackDescription: 'NVIDIA driver installer for Pardus GNU/Linux',
			fallbackLanguage: 'Python',
		},
		{
			name: 'pardus-gnome-shortcuts',
			repo: 'pardus-gnome-shortcuts',
			fallbackDescription: 'GNOME keyboard shortcut manager for Pardus',
			fallbackLanguage: 'Python',
		},
	];

	let repos = $state<Record<string, RepoInfo>>({});
	let selected = $state(0);
	let containerEl: HTMLDivElement;
	let readmeCache = $state<Record<string, string>>({});
	let loadingReadme = $state(false);
	let selectedProject = $derived(projects[selected]);

	onMount(async () => {
		containerEl?.focus();
		repos = await fetchRepos();
		fetchReadme(projects[0].repo);
	});

	async function fetchReadme(repo: string) {
		if (readmeCache[repo]) return;
		loadingReadme = true;
		try {
			const res = await fetch(`https://api.github.com/repos/pardus/${repo}/readme`, {
				headers: { Accept: 'application/vnd.github.raw+json' },
			});
			if (res.ok) {
				readmeCache[repo] = await res.text();
			} else {
				readmeCache[repo] = 'README not available.';
			}
		} catch {
			readmeCache[repo] = 'Failed to fetch README.';
		}
		loadingReadme = false;
	}

	$effect(() => {
		fetchReadme(projects[selected].repo);
	});

	function getDescription(p: Project): string {
		return repos[p.repo]?.description || p.fallbackDescription;
	}

	function getLanguage(p: Project): string {
		return repos[p.repo]?.language || p.fallbackLanguage;
	}

	function getStars(p: Project): string {
		return repos[p.repo]?.stars?.toString() ?? '...';
	}

	function getCommits(p: Project): string {
		return repos[p.repo]?.totalCommits?.toString() ?? '...';
	}

	function getLastCommit(p: Project): { date: string; message: string } {
		const repo = repos[p.repo];
		if (!repo) return { date: '...', message: '...' };
		const date = repo.lastCommitDate !== '?'
			? new Date(repo.lastCommitDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
			: '...';
		return { date, message: repo.lastCommitMessage };
	}

	function getForks(p: Project): string {
		return repos[p.repo]?.forks?.toString() ?? '...';
	}

	function languageColor(lang: string): string {
		switch (lang.toLowerCase()) {
			case 'python': return 'bg-[#3572A5]';
			case 'javascript': return 'bg-[#f1e05a]';
			case 'typescript': return 'bg-[#3178c6]';
			case 'shell': return 'bg-[#89e051]';
			default: return 'bg-[var(--color-fg-dim)]';
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'j' || e.key === 'ArrowDown') {
			e.preventDefault();
			selected = Math.min(selected + 1, projects.length - 1);
		} else if (e.key === 'k' || e.key === 'ArrowUp') {
			e.preventDefault();
			selected = Math.max(selected - 1, 0);
		} else if (e.key === 'Enter' && !e.altKey) {
			e.preventDefault();
			window.open(`https://github.com/pardus/${projects[selected].repo}`, '_blank');
		}
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	class="h-full bg-[var(--color-bg)] font-mono text-sm text-[var(--color-fg)] outline-none flex flex-col"
	tabindex="0"
	bind:this={containerEl}
	onkeydown={handleKeydown}
>
	<!-- Path bar -->
	<div class="flex items-center justify-between px-4 py-2 border-b border-[var(--color-border)] shrink-0">
		<div class="flex items-center gap-2 text-xs text-[var(--color-fg-dim)]">
			<span class="text-[var(--color-accent)]">~</span>
			<span>/</span>
			<span class="text-[var(--color-fg)]">projects</span>
			<span>/</span>
			<span class="text-[var(--color-green)]">{projects[selected].name}</span>
		</div>
		<div class="text-xs text-[var(--color-fg-dim)]">
			j/k: navigate — Enter: open in GitHub
		</div>
	</div>

	<!-- Split pane -->
	<div class="flex flex-1 min-h-0">
		<!-- Left: project list -->
		<div class="w-64 shrink-0 border-r border-[var(--color-border)] overflow-auto p-2 space-y-1">
			{#each projects as project, i}
				<div
					class="px-2 py-1.5 rounded-sm text-xs cursor-default transition-colors {i === selected
						? 'bg-[var(--color-accent)] text-[var(--color-bar-bg)] font-bold'
						: 'text-[var(--color-fg)] hover:bg-[var(--color-surface)]'}"
				>
					<div class="flex items-center justify-between">
						<span class="truncate">{project.name}</span>
						<span class="{i === selected ? 'text-[var(--color-bar-bg)]' : 'text-[var(--color-yellow)]'}" style="font-variant-numeric: tabular-nums">
							★ {getStars(project)}
						</span>
					</div>
				</div>
			{/each}
		</div>

		<!-- Right: preview pane -->
		<div class="flex-1 overflow-auto p-4">
			<!-- Header -->
			<div class="mb-4">
				<h2 class="text-[var(--color-accent)] font-bold text-base mb-1">{selectedProject.name}</h2>
				<div class="text-[var(--color-fg-dim)] text-xs mb-3">{getDescription(selectedProject)}</div>

				<!-- Stats -->
				<div class="flex items-center gap-4 text-xs mb-3">
					<span class="flex items-center gap-1">
						<span class="inline-block w-2.5 h-2.5 rounded-full {languageColor(getLanguage(selectedProject))}"></span>
						{getLanguage(selectedProject)}
					</span>
					<span class="text-[var(--color-yellow)]">★ {getStars(selectedProject)}</span>
					<span class="text-[var(--color-fg-dim)]">⑂ {getForks(selectedProject)}</span>
					<span class="text-[var(--color-cyan)]">{getCommits(selectedProject)} commits</span>
				</div>

				<!-- Last commit -->
				<div class="border border-[var(--color-border)] rounded-sm px-3 py-2 text-xs">
					<div class="flex items-center justify-between">
						<span class="text-[var(--color-fg)]">Latest commit</span>
						<span class="text-[var(--color-fg-dim)]">{getLastCommit(selectedProject).date}</span>
					</div>
					<div class="text-[var(--color-fg-dim)] mt-1 truncate">{getLastCommit(selectedProject).message}</div>
				</div>
			</div>

			<div class="border-t border-[var(--color-border)] pt-3">
				<div class="text-xs text-[var(--color-fg-dim)] mb-2 uppercase tracking-wider">README.md</div>
				{#if loadingReadme && !readmeCache[selectedProject.repo]}
					<div class="text-[var(--color-fg-dim)] text-xs animate-pulse">Fetching README...</div>
				{:else}
					<pre class="text-xs text-[var(--color-fg)] whitespace-pre-wrap leading-relaxed">{readmeCache[selectedProject.repo] ?? 'Loading...'}</pre>
				{/if}
			</div>
		</div>
	</div>
</div>
