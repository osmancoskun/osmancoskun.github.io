<script lang="ts">
	const shortcuts = [
		{ keys: 'Alt + Enter', action: 'Terminal' },
		{ keys: 'Alt + D', action: 'Launcher' },
		{ keys: 'Esc, then 1-5', action: 'Workspace' },
		{ keys: 'Alt + P', action: 'Projects' },
		{ keys: 'Alt + H/L', action: 'Focus left/right' },
		{ keys: 'Alt + Q', action: 'Close window' },
	];
</script>

<div class="absolute inset-0 flex items-center justify-center">
	<div class="text-center space-y-8 opacity-30">
		<div class="text-6xl font-bold text-[var(--color-fg)] tracking-tight">
			sway
		</div>

		<div class="space-y-2">
			{#each shortcuts as shortcut}
				<div class="flex justify-between gap-12 text-sm">
					<span class="text-[var(--color-accent)] text-right min-w-[10rem]">{shortcut.keys}</span>
					<span class="text-[var(--color-fg-dim)] text-left min-w-[10rem]">{shortcut.action}</span>
				</div>
			{/each}
		</div>
	</div>
</div>
