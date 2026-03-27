<script lang="ts">
	import { onMount } from 'svelte';

	let { onComplete }: { onComplete: () => void } = $props();

	interface ServiceLine {
		status: 'ok' | 'started' | 'reached' | 'listening';
		text: string;
		delay?: number;
	}

	let visibleLines = $state(0);

	const services: ServiceLine[] = [
		{ status: 'ok', text: 'Started systemd-journald.service — Journal Service.' },
		{ status: 'ok', text: 'Mounted /home/osman — There\'s no place like ~.', delay: 1200 },
		{ status: 'reached', text: 'target Local File Systems.' },
		{ status: 'ok', text: 'Started NetworkManager — Praying to the Wi-Fi gods.', delay: 1500 },
		{ status: 'reached', text: 'target Network (it\'s a miracle).', delay: 800 },
		{ status: 'ok', text: 'Started node-modules.service — Downloading the entire internet.', delay: 1500 },
		{ status: 'ok', text: 'Started git-blame.service — It was me. It\'s always me.', delay: 1200 },
		{ status: 'ok', text: 'Started pipewire.service — lo-fi hip hop beats to code to.', delay: 1000 },
		{ status: 'ok', text: 'Started dark-mode.service — Light mode users will be escorted out.', delay: 1200 },
		{ status: 'ok', text: 'Started sway.service — i3 but with commitment issues.', delay: 1200 },
		{ status: 'reached', text: 'target Graphical Interface.' },
		{ status: 'ok', text: 'Started greetd.service — Login Manager.' },
		{ status: 'reached', text: 'target Default — Welcome home.', delay: 800 },
	];

	function statusBadge(status: ServiceLine['status']): string {
		switch (status) {
			case 'ok':
				return '  OK  ';
			case 'started':
				return 'START ';
			case 'reached':
				return 'REACH ';
			case 'listening':
				return 'LISTEN';
		}
	}

	function statusColor(status: ServiceLine['status']): string {
		switch (status) {
			case 'ok':
				return 'text-[var(--color-green)]';
			case 'started':
				return 'text-[var(--color-cyan)]';
			case 'reached':
				return 'text-[var(--color-accent)]';
			case 'listening':
				return 'text-[var(--color-magenta)]';
		}
	}

	let skipped = false;

	function showNext(i: number) {
		if (skipped) return;
		if (i < services.length) {
			visibleLines = i + 1;
			const delay = services[i].delay ?? 250;
			setTimeout(() => showNext(i + 1), delay);
		} else {
			setTimeout(() => { if (!skipped) onComplete(); }, 1000);
		}
	}

	onMount(() => {
		showNext(0);

		const handleSkip = () => {
			skipped = true;
			onComplete();
		};

		const skipTimeout = setTimeout(() => {
			window.addEventListener('click', handleSkip);
			window.addEventListener('keydown', handleSkip);
		}, 100);

		return () => {
			clearTimeout(skipTimeout);
			skipped = true;
			window.removeEventListener('click', handleSkip);
			window.removeEventListener('keydown', handleSkip);
		};
	});
</script>

<div class="systemd-enter fixed inset-0 bg-black text-white font-mono text-sm p-8 overflow-hidden select-none">
	<div class="mb-4 text-[var(--color-fg-dim)]">
		Pardus 25 Gnu/Linux — Linux 6.12.0-osman
	</div>

	<div class="space-y-0.5">
		{#each services.slice(0, visibleLines) as service}
			<div class="flex gap-2">
				<span class="shrink-0 font-bold inline-flex"><span class="text-white">[</span><span class="{statusColor(service.status)} inline-block w-[6ch] text-center">{statusBadge(service.status)}</span><span class="text-white">]</span></span>
				<span>
					{#if service.status === 'reached'}
						Reached <span class="text-[var(--color-fg-dim)]">{service.text}</span>
					{:else if service.status === 'listening'}
						Listening <span class="text-[var(--color-fg-dim)]">{service.text}</span>
					{:else}
						{service.text}
					{/if}
				</span>
			</div>
		{/each}
	</div>

	<div class="absolute bottom-8 right-8 text-[var(--color-fg-dim)] text-xs">
		Click or press any key to skip
	</div>
</div>

<style>
	.systemd-enter {
		animation: crt-on 0.4s ease-out;
	}

	@keyframes crt-on {
		0% {
			opacity: 0;
			filter: brightness(30);
			transform: scaleY(0.005);
		}
		40% {
			opacity: 1;
			filter: brightness(5);
			transform: scaleY(0.005);
		}
		70% {
			filter: brightness(2);
			transform: scaleY(1.1);
		}
		100% {
			filter: brightness(1);
			transform: scaleY(1);
		}
	}
</style>
