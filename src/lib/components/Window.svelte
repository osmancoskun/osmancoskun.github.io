<script lang="ts">
	let { title, onClose }: { title: string; onClose: () => void } = $props();
</script>

<div class="flex flex-col bg-[var(--color-surface)] border border-[var(--color-border)] rounded-sm overflow-hidden h-full">
	<!-- Title bar -->
	<div class="h-7 bg-[var(--color-bar-bg)] border-b border-[var(--color-border)] flex items-center justify-between px-3 shrink-0 select-none">
		<span class="text-xs text-[var(--color-fg-dim)]">{title}</span>
		<button
			class="text-xs text-[var(--color-red)] hover:text-white transition-colors"
			onclick={onClose}
		>✕</button>
	</div>

	<!-- Content -->
	<div class="flex-1 overflow-auto">
		<slot />
	</div>
</div>
