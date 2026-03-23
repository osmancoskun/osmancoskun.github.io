<script lang="ts">
	import Waybar from './Waybar.svelte';
	import Wallpaper from './Wallpaper.svelte';
</script>

<div class="fixed inset-0 bg-[var(--color-bg)] flex flex-col">
	<Waybar />

	<!-- Desktop area -->
	<div class="flex-1 relative overflow-hidden">
		<Wallpaper />
	</div>
</div>
