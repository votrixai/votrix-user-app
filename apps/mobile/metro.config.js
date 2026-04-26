const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const fs = require("fs");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

function collectNestedNodeModules(root) {
  if (!fs.existsSync(root)) {
    return [];
  }

  const nested = [];
  const visitPackages = (nodeModulesPath) => {
    const entries = fs.readdirSync(nodeModulesPath, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith(".")) {
        continue;
      }

      const entryPath = path.join(nodeModulesPath, entry.name);
      if (entry.name.startsWith("@")) {
        visitPackages(entryPath);
        continue;
      }

      const childNodeModules = path.join(entryPath, "node_modules");
      if (fs.existsSync(childNodeModules)) {
        nested.push(childNodeModules);
        visitPackages(childNodeModules);
      }
    }
  };

  visitPackages(root);
  return nested;
}

const projectNodeModules = path.resolve(projectRoot, "node_modules");
const workspaceNodeModules = path.resolve(monorepoRoot, "node_modules");

config.watchFolders = [...(config.watchFolders || []), monorepoRoot];
config.resolver.disableHierarchicalLookup = true;
config.resolver.nodeModulesPaths = [
  projectNodeModules,
  ...collectNestedNodeModules(projectNodeModules),
  workspaceNodeModules,
  ...collectNestedNodeModules(workspaceNodeModules),
];
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  react: path.resolve(projectNodeModules, "react"),
  "react-native": path.resolve(projectNodeModules, "react-native"),
  "react-native-reanimated": path.resolve(
    projectNodeModules,
    "react-native-reanimated",
  ),
  "react-native-worklets": path.resolve(
    workspaceNodeModules,
    "react-native-worklets",
  ),
};

module.exports = withNativeWind(config, { input: "./global.css" });
