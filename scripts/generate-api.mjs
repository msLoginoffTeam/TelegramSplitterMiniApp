import { spawnSync } from 'node:child_process';
import { mkdir, rename, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const rootDirectory = fileURLToPath(new URL('../', import.meta.url));
const snapshotPath = fileURLToPath(new URL('../openapi/backend.json', import.meta.url));
const outputPath = fileURLToPath(new URL('../src/shared/api/generated/client.ts', import.meta.url));
const temporarySnapshotPath = fileURLToPath(
  new URL('../openapi/backend.tmp.json', import.meta.url),
);
const fromSnapshot = process.argv.includes('--from-snapshot');
const sourceUrl = process.env.OPENAPI_SOURCE_URL ?? 'http://localhost:5028/swagger/v1/swagger.json';

if (!fromSnapshot) {
  const response = await fetch(sourceUrl, { headers: { Accept: 'application/json' } });

  if (!response.ok) {
    throw new Error(`OpenAPI download failed (${response.status}) from ${sourceUrl}.`);
  }

  const document = await response.json();
  await mkdir(fileURLToPath(new URL('../openapi/', import.meta.url)), { recursive: true });
  await writeFile(temporarySnapshotPath, `${JSON.stringify(document, null, 2)}\n`);
  await rename(temporarySnapshotPath, snapshotPath);
}

const generator =
  process.platform === 'win32'
    ? fileURLToPath(new URL('../node_modules/.bin/react-query-swagger.cmd', import.meta.url))
    : fileURLToPath(new URL('../node_modules/.bin/react-query-swagger', import.meta.url));

const result = spawnSync(
  generator,
  [
    '/tanstack',
    `/input:${snapshotPath}`,
    `/output:${outputPath}`,
    '/template:Axios',
    '/serviceHost:.',
    '/use-recommended-configuration',
  ],
  { cwd: rootDirectory, stdio: 'inherit' },
);

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
