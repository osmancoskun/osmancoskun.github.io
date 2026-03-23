<script lang="ts">
	import { onMount } from 'svelte';

	let { onComplete }: { onComplete: () => void } = $props();

	let ready = $state(false);
	let typedUser = $state('');
	let showPasswordField = $state(false);
	let typedPassword = $state('');
	let loggingIn = $state(false);

	const username = 'osman';
	const fakePassword = '********';

	let phase = $state<'waiting' | 'typing-user' | 'typing-pass' | 'logging-in' | 'done'>('waiting');

	function typeText(text: string, onChar: (partial: string) => void, onDone: () => void) {
		let i = 0;
		const interval = setInterval(() => {
			if (i < text.length) {
				onChar(text.slice(0, ++i));
			} else {
				clearInterval(interval);
				onDone();
			}
		}, 100);
		return interval;
	}

	let activeInterval: ReturnType<typeof setInterval> | null = null;

	onMount(() => {
		setTimeout(() => {
			ready = true;

			setTimeout(() => {
				phase = 'typing-user';
				activeInterval = typeText(username, (t) => typedUser = t, () => {
					activeInterval = null;
					setTimeout(() => {
						showPasswordField = true;
						phase = 'typing-pass';
						setTimeout(() => {
							activeInterval = typeText(fakePassword, (t) => typedPassword = t, () => {
								activeInterval = null;
								phase = 'logging-in';
								loggingIn = true;
								setTimeout(() => {
									phase = 'done';
									setTimeout(() => onComplete(), 800);
								}, 1000);
							});
						}, 1000);
					}, 800);
				});
			}, 1000);
		}, 500);

		const handleSkip = () => {
			if (activeInterval) clearInterval(activeInterval);
			onComplete();
		};

		window.addEventListener('click', handleSkip);
		window.addEventListener('keydown', handleSkip);

		return () => {
			if (activeInterval) clearInterval(activeInterval);
			window.removeEventListener('click', handleSkip);
			window.removeEventListener('keydown', handleSkip);
		};
	});

	function cursorVisible(p: typeof phase, target: typeof phase): string {
		return p === target ? '' : 'invisible';
	}
</script>

<div class="fixed inset-0 bg-[var(--color-bg)] font-mono text-sm select-none flex flex-col justify-center items-center">
	{#if ready}
		<div class="border border-[var(--color-border)] rounded-sm w-full max-w-md">
			<!-- Header -->
			<div class="border-b border-[var(--color-border)] px-4 py-2 flex justify-between">
				<span class="text-[var(--color-fg)]">tuigreet</span>
				<span class="text-[var(--color-fg-dim)]">osmancoskun</span>
			</div>

			<!-- Body -->
			<div class="px-6 py-8 space-y-6">
				<!-- Greeting -->
				<div class="text-center space-y-1">
					<div class="text-[var(--color-fg-dim)]">Pardus/Debian GNU/Linux 13 (trixie) on tty1</div>
				</div>

				<!-- Username -->
				<div class="space-y-1">
					<label class="text-[var(--color-fg-dim)] text-xs uppercase tracking-wider">Username</label>
					<div class="border border-[var(--color-border)] {phase === 'typing-user' ? 'border-[var(--color-accent)]' : ''} rounded-sm px-3 py-1.5 flex items-center min-h-[2rem]">
						<span class="text-[var(--color-green)]">{typedUser}</span>
						<span class="animate-pulse text-[var(--color-accent)] {cursorVisible(phase, 'typing-user')}">|</span>
					</div>
				</div>

				<!-- Password -->
				{#if showPasswordField}
					<div class="space-y-1">
						<label class="text-[var(--color-fg-dim)] text-xs uppercase tracking-wider">Password</label>
						<div class="border border-[var(--color-border)] {phase === 'typing-pass' ? 'border-[var(--color-accent)]' : ''} rounded-sm px-3 py-1.5 flex items-center min-h-[2rem]">
							<span class="text-[var(--color-fg)]">{typedPassword}</span>
							<span class="animate-pulse text-[var(--color-accent)] {cursorVisible(phase, 'typing-pass')}">|</span>
						</div>
					</div>
				{/if}

				<!-- Login status -->
				{#if loggingIn}
					<div class="text-center">
						{#if phase === 'done'}
							<span class="text-[var(--color-green)]">Welcome back, {username}. Starting sway...</span>
						{:else}
							<span class="text-[var(--color-fg-dim)]">Authenticating...</span>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Footer -->
			<div class="border-t border-[var(--color-border)] px-4 py-2 flex justify-between text-xs text-[var(--color-fg-dim)]">
				<span>F2 Command</span>
				<span>F3 Session: sway</span>
				<span>F12 Power</span>
			</div>
		</div>

		<!-- Time -->
		<div class="mt-6 text-[var(--color-fg-dim)] text-xs">
			{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })} — tty1
		</div>
	{/if}

	<div class="absolute bottom-8 right-8 text-[var(--color-fg-dim)] text-xs">
		Click or press any key to skip
	</div>
</div>
