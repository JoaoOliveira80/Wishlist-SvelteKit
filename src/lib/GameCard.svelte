<script>
  import GameCardNew from './GameCardNew.svelte';

  let { game, onDetails = () => {} } = $props();
</script>

<GameCardNew {game} {onDetails} />