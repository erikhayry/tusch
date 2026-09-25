<script lang="ts">
	import Heading from "../../Heading.svelte";
	import Section from "../../Section.svelte";

</script>

<script module lang="ts">
	export let headingLevel1 = "Heading Level 1";
	export let headingLevel2 = "Heading Level 2";
	export let headingLevel2Sibling = "Heading Level 2 Sibling";
	export let headingLevel3 = "Heading Level 3";
	export let headingLevel4 = "Heading Level 4";
	export let headingLevel5 = "Heading Level 5";
	export let headingLevel6 = "Heading Level 6";
	export let headingLevelMax = "Heading Level Max";
</script>

<Heading>{headingLevel1}</Heading>

<Section>
  <Heading>{headingLevel2}</Heading>
  <Heading>{headingLevel2Sibling}</Heading>
  <Section>
    <Heading>{headingLevel3}</Heading>

    <Section>
      <Heading>{headingLevel4}</Heading>

      <Section>
      <Heading>{headingLevel5}</Heading>

      <Section>
        <Heading>{headingLevel6}</Heading>
        <Section>
          <Heading>{headingLevelMax}</Heading>
        </Section>
      </Section>
    </Section>
    </Section>
  </Section>
</Section>
