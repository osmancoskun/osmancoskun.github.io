<script lang="ts">
	import BiosScreen from '$lib/components/BiosScreen.svelte';
	import SystemdBoot from '$lib/components/SystemdBoot.svelte';
	import LoginScreen from '$lib/components/LoginScreen.svelte';
	import Desktop from '$lib/components/Desktop.svelte';

	let phase = $state<'bios' | 'systemd' | 'login' | 'desktop'>('bios');
</script>

{#if phase === 'bios'}
	<BiosScreen onComplete={() => phase = 'systemd'} />
{:else if phase === 'systemd'}
	<SystemdBoot onComplete={() => phase = 'login'} />
{:else if phase === 'login'}
	<LoginScreen onComplete={() => phase = 'desktop'} />
{:else}
	<Desktop />
{/if}
