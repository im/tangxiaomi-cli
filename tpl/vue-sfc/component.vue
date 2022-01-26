<!--
* ${__className__}
* @author ${__author__}
* @date ${__date__}
* @since ${__version__}
-->

<template>
    <div>
        <h1>${__className__}</h1>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class ${__className__} extends Vue {

}
</script>

<style src="./${__component__}.styl" lang="stylus" scoped></style>
