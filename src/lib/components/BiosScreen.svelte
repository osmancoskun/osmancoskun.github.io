<script lang="ts">
	import { onMount } from 'svelte';

	let { onComplete }: { onComplete: () => void } = $props();

	let visibleLines = $state(0);
	let showPressKey = $state(false);

	const biosLines = [
		'American Megatrends Inc.',
		'AMIBIOS (C) 2024 American Megatrends, Inc.',
		'OSMANCOSKUN.COM BIOS v1.0.0',
		'',
		'CPU: CaffeineCore i9-Espresso @ 4.20 GHz (Turbo Brew Enabled)',
		'Speed: 4.20 GHz    Count: Too Many Tabs',
		'',
		'Memory Test:  ∞ KB OK (but Chrome wants more)',
		'',
		'Press DEL to run Setup',
		'Press F12 for Boot Menu',
		'',
		'Initializing USB Controllers... Done.',
		'  1 Mechanical Keyboard found. RGB: Maximum.',
		'',
		'Checking NVRAM...',
		'  640 KB ought to be enough for anybody',
		'',
		'Detecting Primary Master... SSD Portfolio v2.0',
		'Detecting Primary Slave... None',
		'Detecting Secondary Master... None',
		'Detecting Secondary Slave... None',
		'',
	];

	onMount(() => {
		let i = 0;
		const interval = setInterval(() => {
			if (i < biosLines.length) {
				visibleLines = ++i;
			} else {
				clearInterval(interval);
				showPressKey = true;
			}
		}, 200);

		const handleSkip = () => {
			clearInterval(interval);
			onComplete();
		};

		window.addEventListener('click', handleSkip);
		window.addEventListener('keydown', handleSkip);

		return () => {
			clearInterval(interval);
			window.removeEventListener('click', handleSkip);
			window.removeEventListener('keydown', handleSkip);
		};
	});

	$effect(() => {
		if (showPressKey) {
			const timeout = setTimeout(() => onComplete(), 2500);
			return () => clearTimeout(timeout);
		}
	});
</script>

<div class="crt-powerup fixed inset-0 bg-[#1a1a1a] flex items-center justify-center">
	<!-- Monitor body -->
	<div class="crt-monitor">
		<!-- Monitor bezel -->
		<div class="crt-bezel">
			<!-- Glass surface -->
			<div class="crt-glass">
				<!-- Screen content -->
				<div class="crt-screen text-white font-mono text-sm p-8 select-none">
					<div class="max-w-3xl relative z-[1]">
						{#each biosLines.slice(0, visibleLines) as line, i}
							{#if i === 0}
								<div class="text-[var(--color-cyan)] font-bold text-2xl mb-2">{line}</div>
							{:else if i === 2}
								<div class="text-[var(--color-yellow)] mb-2">{line}</div>
							{:else}
								<div class="leading-6 {line === '' ? 'h-4' : ''}">{line}&nbsp;</div>
							{/if}
						{/each}
					</div>

					{#if showPressKey}
						<div class="absolute bottom-8 left-8 text-[var(--color-fg-dim)] animate-pulse z-[1]">
							Press any key to continue...
						</div>
					{/if}

					<div class="absolute bottom-8 right-8 text-[var(--color-fg-dim)] text-xs z-[1]">
						Click or press any key to skip
					</div>
				</div>

				<!-- Scanlines -->
				<div class="crt-scanlines absolute inset-0 pointer-events-none z-10"></div>
				<!-- Flicker -->
				<div class="crt-flicker absolute inset-0 pointer-events-none z-10"></div>
				<!-- Vignette — simulates convex glass darkening at edges -->
				<div class="crt-vignette absolute inset-0 pointer-events-none z-10"></div>
				<!-- Glass reflection -->
				<div class="crt-reflection absolute inset-0 pointer-events-none z-20"></div>
			</div>
		</div>

		<!-- Power LED -->
		<div class="crt-led"></div>
	</div>
</div>

<style>
	.crt-powerup {
		animation: crt-on 0.5s ease-out;
	}

	.crt-monitor {
		position: relative;
		width: 85%;
		max-width: 1100px;
		aspect-ratio: 4 / 3;
	}

	.crt-bezel {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			160deg,
			#3a3a3a 0%,
			#2a2a2a 30%,
			#1e1e1e 70%,
			#141414 100%
		);
		border-radius: 20px;
		padding: 28px 32px 40px;
		box-shadow:
			0 4px 20px rgba(0, 0, 0, 0.8),
			0 0 0 1px rgba(255, 255, 255, 0.05) inset,
			0 -2px 6px rgba(0, 0, 0, 0.5) inset;
	}

	.crt-glass {
		position: relative;
		width: 100%;
		height: 100%;
		border-radius: 16px / 14px;
		overflow: hidden;
		/* Convex glass: bright center, dark edges pushed inward */
		box-shadow:
			0 0 100px 30px rgba(0, 0, 0, 0.9) inset,
			0 0 40px 10px rgba(0, 0, 0, 0.6) inset,
			0 0 4px 2px rgba(0, 0, 0, 0.95) inset,
			0 0 2px 1px rgba(80, 160, 220, 0.08);
	}

	.crt-screen {
		position: relative;
		width: 100%;
		height: 100%;
		background: #050508;
		text-shadow:
			0 0 4px rgba(255, 255, 255, 0.4),
			0 0 10px rgba(100, 200, 255, 0.1);
	}

	.crt-scanlines {
		background: repeating-linear-gradient(
			0deg,
			transparent 0px,
			transparent 1px,
			rgba(0, 0, 0, 0.3) 1px,
			rgba(0, 0, 0, 0.3) 2px
		);
	}

	.crt-flicker {
		animation: crt-flicker 0.1s infinite;
		background: rgba(255, 255, 255, 0.015);
	}

	.crt-vignette {
		background: radial-gradient(
			ellipse 70% 65% at center,
			transparent 0%,
			rgba(0, 0, 0, 0.25) 55%,
			rgba(0, 0, 0, 0.7) 80%,
			rgba(0, 0, 0, 0.95) 100%
		);
	}

	.crt-reflection {
		background:
			linear-gradient(
				165deg,
				rgba(255, 255, 255, 0.06) 0%,
				rgba(255, 255, 255, 0.02) 20%,
				transparent 40%,
				transparent 100%
			),
			radial-gradient(
				ellipse 120% 50% at 30% 20%,
				rgba(255, 255, 255, 0.04) 0%,
				transparent 60%
			);
	}

	.crt-led {
		position: absolute;
		bottom: 12px;
		left: 50%;
		transform: translateX(-50%);
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #22c55e;
		box-shadow: 0 0 6px 2px rgba(34, 197, 94, 0.5);
		animation: led-pulse 2s ease-in-out infinite;
	}

	@keyframes crt-flicker {
		0% { opacity: 0.4; }
		50% { opacity: 1; }
		100% { opacity: 0.4; }
	}

	@keyframes led-pulse {
		0%, 100% { opacity: 0.7; }
		50% { opacity: 1; }
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
