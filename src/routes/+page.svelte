<script lang="ts">
	import { browser } from '$app/environment';
	import BiosScreen from '$lib/components/BiosScreen.svelte';
	import SystemdBoot from '$lib/components/SystemdBoot.svelte';
	import LoginScreen from '$lib/components/LoginScreen.svelte';
	import Desktop from '$lib/components/Desktop.svelte';

	const hasVisited = browser && localStorage.getItem('hasVisited') === 'true';
	let phase = $state<'bios' | 'systemd' | 'login' | 'desktop'>(hasVisited ? 'login' : 'bios');

	function onLoginComplete() {
		if (browser) localStorage.setItem('hasVisited', 'true');
		phase = 'desktop';
	}
</script>

{#if phase === 'bios'}
	<BiosScreen onComplete={() => phase = 'systemd'} />
{:else if phase === 'systemd'}
	<SystemdBoot onComplete={() => phase = 'login'} />
{:else if phase === 'login'}
	<LoginScreen onComplete={onLoginComplete} />
{:else}
	<Desktop />
{/if}
