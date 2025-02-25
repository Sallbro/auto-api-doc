const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

function generateCodeFromOpenAPI(openAPIFilePath, outputDir, framework = "express") {
  const fileExt = path.extname(openAPIFilePath);
  const openAPIData =
    fileExt === ".yaml" || fileExt === ".yml"
      ? yaml.load(fs.readFileSync(openAPIFilePath, "utf8"))
      : JSON.parse(fs.readFileSync(openAPIFilePath, "utf8"));

  if (!openAPIData.paths) openAPIData.paths = {};

  // Ensure a default "/" route exists
  if (!openAPIData.paths["/"]) {
    openAPIData.paths["/"] = {
      get: {
        summary: "Default route",
        responses: { "200": { description: "Success" } },
      },
    };
  }

  const paths = openAPIData.paths;
  const controllers = {};
  const routes = {};

  Object.entries(paths).forEach(([path, methods]) => {
    const pathParts = path.split("/").filter((p) => p);
    const resource = pathParts[0] || "root"; // Default to "root" for "/"

    const functionName = pathParts.join("_").replace(/{([^}]+)}/g, "_$1") || "index";

    if (!controllers[resource]) controllers[resource] = new Set();
    if (!routes[resource]) routes[resource] = [];

    Object.entries(methods).forEach(([method]) => {
      const formattedPath =
        "/" +
        pathParts
          .slice(1)
          .map((segment) => (segment.startsWith("{") ? `:${segment.slice(1, -1)}` : segment))
          .join("/");

      controllers[resource].add(`
exports.${functionName} = async (req, res, next) => {
  res.json({ message: "Handling ${method.toUpperCase()} request for ${path}" });
};`);

      let routeDefinition;
      if (framework === "express") {
        routeDefinition = `${resource}_router.${method}("${formattedPath}", ${functionName});`;
      } else if (framework === "koa") {
        routeDefinition = `router.${method}("${formattedPath}", ${functionName});`;
      } else if (framework === "fastify") {
        routeDefinition = `fastify.${method}("${formattedPath}", ${functionName});`;
      }

      routes[resource].push(routeDefinition);
    });
  });

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  if (!fs.existsSync(`${outputDir}/controller`)) fs.mkdirSync(`${outputDir}/controller`);
  if (!fs.existsSync(`${outputDir}/route`)) fs.mkdirSync(`${outputDir}/route`);

  Object.entries(controllers).forEach(([resource, methods]) => {
    fs.writeFileSync(`${outputDir}/controller/${resource}.controller.js`, [...methods].join("\n"));
  });

  Object.entries(routes).forEach(([resource, routeDefinitions]) => {
    const functionNames = [...controllers[resource]]
      .map((fn) => fn.match(/exports\.(\w+)/)?.[1])
      .filter(Boolean)
      .join(", ");

    let routeFileContent;
    if (framework === "express") {
      routeFileContent = `
const express = require("express");
const ${resource}_router = express.Router();
const { ${functionNames} } = require("../controller/${resource}.controller");

${routeDefinitions.join("\n")}

module.exports = ${resource}_router;`;
    } else if (framework === "koa") {
      routeFileContent = `
const Router = require("koa-router");
const router = new Router();
const { ${functionNames} } = require("../controller/${resource}.controller");

${routeDefinitions.join("\n")}

module.exports = router;`;
    } else if (framework === "fastify") {
      routeFileContent = `
async function ${resource}Routes(fastify, options) {
  const { ${functionNames} } = require("../controller/${resource}.controller");

  ${routeDefinitions.join("\n")}
}

module.exports = ${resource}Routes;`;
    }

    fs.writeFileSync(`${outputDir}/route/${resource}.js`, routeFileContent);
  });

  let indexFileContent;
  if (framework === "express") {
    indexFileContent = `
const express = require("express");
const app = express();
const bodyParser = require("body-parser");

app.use(bodyParser.json());

${Object.keys(routes)
  .map((resource) => `const ${resource}_router = require("./route/${resource}");`)
  .join("\n")}

${Object.keys(routes)
  .map((resource) => `app.use("/${resource === "root" ? "" : resource}", ${resource}_router);`)
  .join("\n")}

app.listen(3000, () => console.log("✅ Server running on http://localhost:3000"));`;
  } else if (framework === "koa") {
    indexFileContent = `
const Koa = require("koa");
const bodyParser = require("koa-bodyparser");
const app = new Koa();

app.use(bodyParser());

${Object.keys(routes)
  .map((resource) => `const ${resource}Routes = require("./route/${resource}");`)
  .join("\n")}

${Object.keys(routes)
  .map((resource) => `app.use(${resource}Routes.routes()).use(${resource}Routes.allowedMethods());`)
  .join("\n")}

app.listen(3000, () => console.log("✅ Server running on http://localhost:3000"));`;
  } else if (framework === "fastify") {
    indexFileContent = `
const fastify = require("fastify")({ logger: true });

${Object.keys(routes)
  .map((resource) => `const ${resource}Routes = require("./route/${resource}");`)
  .join("\n")}

${Object.keys(routes)
  .map((resource) => `fastify.register(${resource}Routes, { prefix: "/${resource === "root" ? "" : resource}" });`)
  .join("\n")}

fastify.listen({ port: 3000 }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log("✅ Server running on http://localhost:3000");
});`;
  }

  fs.writeFileSync(`${outputDir}/index.js`, indexFileContent);

  // Generate package.json
  const packageJson = {
    name: "api-generator",
    version: "1.0.0",
    description: "Generated API server",
    main: "index.js",
    scripts: {
      start: "node index.js",
    },
    dependencies: {},
  };

  if (framework === "express") {
    packageJson.dependencies = {
      express: "^4.18.2",
      "body-parser": "^1.20.2",
    };
  } else if (framework === "koa") {
    packageJson.dependencies = {
      koa: "^2.14.2",
      "koa-router": "^12.0.0",
      "koa-bodyparser": "^4.3.0",
    };
  } else if (framework === "fastify") {
    packageJson.dependencies = {
      fastify: "^4.22.3",
    };
  }

  fs.writeFileSync(`${outputDir}/package.json`, JSON.stringify(packageJson, null, 2));

  console.log("✅ Routes, Controllers, Index.js & package.json Generated Successfully!");
}

module.exports = { generateCodeFromOpenAPI };
