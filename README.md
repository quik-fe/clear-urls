# clear-urls

ClearURLs extension to js package.

> fork from https://github.com/ClearURLs/Addon

# background

此包将 ClearURLs 规则打包为一个 js package，以在其他项目中使用这些规则

本库不会储存和管理规则，一律在打包时从上游同步

# USAGE

install

```
npm i @quik-fe/clear-urls
```

```ts
import { clearUrl } from "@quik-fe/clear-urls";
const url =
  "https://www.bilibili.com/video/xxx/?spm_id_from=333.1007.tianma.1-1-1.click";
const cleaned = clearUrl(url);
console.log(cleaned);
```

output:

```json
{
  "changes": true,
  "url": "https://www.bilibili.com/video/xxx/",
  "redirect": false,
  "cancel": false,
  "providers": ["globalRules", "bilibili.com"]
}
```

## esm

```html
<div id="root"></div>
<script type="module">
  import { clearUrl } from "https://esm.run/@quik-fe/clear-urls@latest";
  const url =
    "https://www.bilibili.com/video/xxx/?spm_id_from=333.1007.tianma.1-1-1.click";
  const cleaned = clearUrl(url);
  console.log(cleaned);
  root.innerHTML = `<pre>${JSON.stringify(cleaned, null, 2)}</pre>`;
</script>
```

# build

sync upstream data

```
bash ./scripts/get_rules.sh
```

build

```
pnpm install
pnpm build
```

# LICENSE

AGPL-3.0 license
