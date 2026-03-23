<script lang="ts">
	const shortcuts = [
		{ keys: 'Super + Enter', action: 'Terminal' },
		{ keys: 'Super + D', action: 'Launcher' },
		{ keys: 'Super + 1-5', action: 'Workspace' },
		{ keys: 'Super + Q', action: 'Close window' },
		{ keys: 'Super + F', action: 'Fullscreen' },
		{ keys: 'Super + H/V', action: 'Split H/V' },
		{ keys: 'Super + Shift + E', action: 'Exit sway' },
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
