<!--https://vuejs.org/guide/components/props.html#props understanding props-->
<script setup>
const props = defineProps(['formSuccessMessage', 'formErrorMessage'])
</script>

<template>
  <v-alert
    dense
    v-if="props.formSuccessMessage"
    :text="props.formSuccessMessage"
    title="Success!"
    type="success"
    variant="outlined"
    density="compact"
    border="top"
    closable
  ></v-alert>

  <v-alert
    dense
    v-if="props.formErrorMessage"
    :text="props.formErrorMessage"
    title="haha tala!"
    type="error"
    variant="outlined"
    density="compact"
    border="top"
    closable
  ></v-alert>
</template>
