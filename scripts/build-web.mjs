import { mkdir, readFile, rm, writeFile, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

const workspaceRoot = process.cwd();
const outputPath = path.join(workspaceRoot, 'dist/apps/web');

async function buildWebApp() {
  await rm(outputPath, { recursive: true, force: true });
  await mkdir(outputPath, { recursive: true });

  await build({
    absWorkingDir: workspaceRoot,
    bundle: true,
    entryPoints: ['apps/web/src/main.ts'],
    entryNames: 'main',
    format: 'esm',
    outdir: outputPath,
    platform: 'browser',
    sourcemap: true,
    target: ['es2022'],
    tsconfig: 'tsconfig.base.json',
    loader: {
      '.css': 'css',
      '.html': 'text',
    },
    logLevel: 'info',
  });

  const indexHtml = await readFile(path.join(workspaceRoot, 'apps/web/src/index.html'), 'utf8');

  await writeFile(path.join(outputPath, 'index.html'), indexHtml);
  await copyFile(
    path.join(workspaceRoot, 'apps/web/public/favicon.ico'),
    path.join(outputPath, 'favicon.ico')
  );
}

buildWebApp().catch((error) => {
  console.error('Failed to build web app', error);
  process.exit(1);
});
