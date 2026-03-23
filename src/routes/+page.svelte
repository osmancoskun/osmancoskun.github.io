<script lang="ts">
	import BiosScreen from '$lib/components/BiosScreen.svelte';
	import SystemdBoot from '$lib/components/SystemdBoot.svelte';

	let phase = $state<'bios' | 'systemd' | 'done'>('bios');
</script>

{#if phase === 'bios'}
	<BiosScreen onComplete={() => phase = 'systemd'} />
{:else if phase === 'systemd'}
	<SystemdBoot onComplete={() => phase = 'done'} />
{:else}
	<div class="fixed inset-0 flex items-center justify-center text-[var(--color-fg-dim)]">
		Next phase coming soon...
	</div>
{/if}
