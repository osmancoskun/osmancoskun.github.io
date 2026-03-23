<script lang="ts">
	import BiosScreen from '$lib/components/BiosScreen.svelte';

	let phase = $state<'bios' | 'done'>('bios');
</script>

{#if phase === 'bios'}
	<BiosScreen onComplete={() => phase = 'done'} />
{:else}
	<div class="fixed inset-0 flex items-center justify-center text-[var(--color-fg-dim)]">
		Next phase coming soon...
	</div>
{/if}
