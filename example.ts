import { clearUrl } from "./dist/main.mjs";
// import { clearUrl } from "./src/main";

const urls = [
  "https://www.bilibili.com/video/xxx/?spm_id_from=333.1007.tianma.1-1-1.click",
];

for (const url of urls) {
  const cleaned = clearUrl(url);
  console.log(cleaned);
}
