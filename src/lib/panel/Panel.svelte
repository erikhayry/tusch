<script lang="ts">
    export interface PanelProps {
        title: string
    }

    let {title}: PanelProps = $props();
</script>


<h2>{title}</h2>