<script lang="ts">
	import type { Snippet } from 'svelte';

	let { title, onClose, focused = false, children }: {
		title: string;
		onClose: () => void;
		focused?: boolean;
		children: Snippet;
	} = $props();
</script>

<div class="flex flex-col bg-[var(--color-surface)] border rounded-sm overflow-hidden h-full transition-colors {focused
	? 'border-[var(--color-accent)]'
	: 'border-[var(--color-border)]'}">
	<!-- Title bar -->
	<div class="h-7 border-b flex items-center justify-between px-3 shrink-0 select-none transition-colors {focused
		? 'bg-[var(--color-accent)] border-[var(--color-accent)]'
		: 'bg-[var(--color-bar-bg)] border-[var(--color-border)]'}">
		<span class="text-xs {focused ? 'text-[var(--color-bar-bg)] font-bold' : 'text-[var(--color-fg-dim)]'}">{title}</span>
		<button
			class="text-xs transition-colors {focused ? 'text-[var(--color-bar-bg)] hover:text-white' : 'text-[var(--color-red)] hover:text-white'}"
			onclick={onClose}
		>✕</button>
	</div>

	<!-- Content -->
	<div class="flex-1 overflow-auto">
		{@render children()}
	</div>
</div>
