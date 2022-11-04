import * as tsup from 'tsup';
import yArgs from 'yargs-parser';

(async () => {
  const args = yArgs(process.argv.slice(2));
  const stub = args?.stub || false;
  console.log(stub);
  await tsup.build({});
})();
