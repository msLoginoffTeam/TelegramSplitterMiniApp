import { spawnSync } from 'node:child_process';
import { chmod, mkdir, readFile, readdir, rename, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const rootDirectory = fileURLToPath(new URL('../', import.meta.url));
const snapshotPath = fileURLToPath(new URL('../openapi/backend.json', import.meta.url));
const outputPath = fileURLToPath(new URL('../src/shared/api/generated/client.ts', import.meta.url));
const generatedDirectory = fileURLToPath(new URL('../src/shared/api/generated/', import.meta.url));
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

if (process.platform === 'darwin') {
  // `nswag-portable@13.20.0-v.17`, used by react-query-swagger, is published
  // without its declared macOS executable. Keep macOS generation reproducible
  // through the versioned local .NET tool; Linux and Windows retain the package binary.
  const restore = spawnSync('dotnet', ['tool', 'restore'], {
    cwd: rootDirectory,
    stdio: 'inherit',
  });
  if (restore.status !== 0) {
    process.exit(restore.status ?? 1);
  }

  const macExecutable = fileURLToPath(
    new URL('../node_modules/nswag-portable/bin/nswag-portable.mac', import.meta.url),
  );
  await writeFile(macExecutable, '#!/bin/sh\nexec dotnet tool run nswag "$@"\n');
  await chmod(macExecutable, 0o755);
}

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

// react-query-swagger currently emits trailing whitespace in some comments.
// Keep committed generated artifacts deterministic and compatible with `git diff --check`.
const generatedFiles = await readdir(generatedDirectory, { recursive: true });
await Promise.all(
  generatedFiles
    .filter((file) => file.endsWith('.ts'))
    .map(async (file) => {
      const filePath = join(generatedDirectory, file);
      const contents = await readFile(filePath, 'utf8');
      await writeFile(
        filePath,
        contents
          .replace(/[ \t]+$/gm, '')
          // NSwag portable uses a different NJsonSchema patch version on macOS.
          // Its generated TypeScript is identical here; keep the committed banner portable.
          .replace(
            /NJsonSchema v[\d.]+ \(Newtonsoft\.Json v/,
            'NJsonSchema v11.0.0.0 (Newtonsoft.Json v',
          ),
      );
    }),
);
