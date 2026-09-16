<script lang="ts">
    export interface ComicProps {
        title: string
    }

    let {title}: ComicProps = $props();
</script>


<h2>{title}</h2>