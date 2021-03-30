---
title: 'Alert'
description: 'Alert component'
---

### Alert with props

```vue demo
<template>
  <vui-alert :title="title" rounded="md" border />
</template>

<script>
export default {
  data() {
    return {
      title: 'Hello'
    }
  }
}
</script>
```

### Alert slots

```vue demo
<template>
  <vui-alert :closable="false" shadow="md">
    <template #title>
      World United
    </template>
  </vui-alert>
</template>
```

### Attributes

| Property | Description | Type | Accepted Values | Default |
| ------------ | ------------- | ------------- | ------------- | ------------- |
| border | border around div  | boolean  | true or false  |false  |
| Content Cell | Content Cell | Content Cell  | Content Cell  | Content Cell  |
