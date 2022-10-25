import 'zx/globals';

(async () => {
  const argv = process.argv.slice(2);
  await $`eslint --cache --ext js,jsx,ts,tsx ./`;
})();
