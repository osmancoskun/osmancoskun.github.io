<script lang="ts">
	import { onMount, tick } from 'svelte';
	import Waybar from './Waybar.svelte';
	import Wallpaper from './Wallpaper.svelte';
	import Window from './Window.svelte';
	import Terminal from './Terminal.svelte';

	interface WindowState {
		id: string;
		title: string;
		component: 'terminal';
		workspace: number;
	}

	let windows = $state<WindowState[]>([]);
	let activeWorkspace = $state(1);
	let nextId = 0;
	let desktopEl: HTMLDivElement;

	let visibleWindows = $derived(windows.filter((w) => w.workspace === activeWorkspace));

	async function focusActiveWorkspace() {
		await tick();
		const input = desktopEl?.querySelector<HTMLInputElement>(
			'.workspace-active input'
		);
		input?.focus();
	}

	function openTerminal() {
		windows.push({
			id: `win-${nextId++}`,
			title: 'foot — osman@osmancoskun:~',
			component: 'terminal',
			workspace: activeWorkspace,
		});
	}

	function closeWindow(id: string) {
		windows = windows.filter((w) => w.id !== id);
	}

	function isTerminalFocused(): boolean {
		const active = document.activeElement;
		return active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement;
	}

	onMount(() => {
		function handleKeydown(e: KeyboardEvent) {
			if (e.altKey && e.key === 'Enter') {
				e.preventDefault();
				openTerminal();
			}
			if (e.altKey && e.key === 'q') {
				e.preventDefault();
				const wsWindows = visibleWindows;
				if (wsWindows.length > 0) {
					closeWindow(wsWindows[wsWindows.length - 1].id);
				}
			}

			// Workspace switching: plain 1-5 when not in input, or Escape to unfocus
			const num = parseInt(e.key);
			if (num >= 1 && num <= 5 && !e.ctrlKey && !e.metaKey) {
				if (!isTerminalFocused() || e.altKey) {
					e.preventDefault();
					activeWorkspace = num;
					focusActiveWorkspace();
				}
			}

			if (e.key === 'Escape' && isTerminalFocused()) {
				if (document.activeElement instanceof HTMLElement) {
					document.activeElement.blur();
				}
			}
		}

		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});
</script>

<div class="fixed inset-0 bg-[var(--color-bg)] flex flex-col">
	<Waybar {activeWorkspace} onWorkspaceChange={(n) => { activeWorkspace = n; focusActiveWorkspace(); }} />

	<!-- Desktop area -->
	<div class="flex-1 relative overflow-hidden" bind:this={desktopEl}>
		<Wallpaper />

		{#each [1, 2, 3, 4, 5] as ws}
			{@const wsWindows = windows.filter((w) => w.workspace === ws)}
			{#if wsWindows.length > 0}
				<div class="absolute inset-0 flex gap-px p-1 {ws === activeWorkspace ? 'workspace-active' : 'invisible pointer-events-none'}">
					{#each wsWindows as win (win.id)}
						<div class="flex-1 min-w-0">
							<Window title={win.title} onClose={() => closeWindow(win.id)}>
								{#if win.component === 'terminal'}
									<Terminal />
								{/if}
							</Window>
						</div>
					{/each}
				</div>
			{/if}
		{/each}
	</div>
</div>
