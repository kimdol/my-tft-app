import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const projectDirectory = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../..",
);
const outputDirectory = resolve(projectDirectory, "..", "translations");
const locales = ["ko", "en", "zh", "zh_tw", "ja"];

const vite = await createServer({
  root: projectDirectory,
  envFile: false,
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "silent",
});

try {
  const { createBundledTranslationCatalog } = await vite.ssrLoadModule(
    "/src/features/i18n/translationCatalog.ts",
  );
  await mkdir(outputDirectory, { recursive: true });

  for (const locale of locales) {
    const catalog = createBundledTranslationCatalog(locale);
    await writeFile(
      resolve(outputDirectory, `${locale}.json`),
      `${JSON.stringify(catalog, null, 2)}\n`,
      "utf8",
    );
  }
} finally {
  await vite.close();
}
