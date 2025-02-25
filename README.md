
# 🚀 API DOC FOR FRAMEWORK EXPRESS, FASTIFY, AND KOA WITH SWAGGER UI  


## **📌 Features** 
✅ **Supports Express, Koa, and Fastify** — Generate OpenAPI docs for any of these frameworks.  
✅ **Swagger UI Integration** — Visualize API documentation interactively. 
✅ **Generates YAML & JSON OpenAPI Files** — Saves `openapi.yaml` and `openapi.json` formats.  
✅ **Beta Feature: OpenAPI Files To Code Generation!** 🚀  


## **📖 Example Usage**  
Generate OpenAPI documentation for **Express, Koa, or Fastify** with one command! 🎯  

### ** Install Dependencies**  
```sh
npm install auto-doc-api
```

### ** Generate Doc**  
```sh
const { generateOpenAPISpec, writeOpenAPIFiles } = require("auto-doc-api");

const openapiSpec = generateOpenAPISpec("express",app); // pass framework name and application route as a parameter
writeOpenAPIFiles(openapiSpec, "./docs"); // generate doc file - .yaml and .json

```

### ** Setup swagger ui**  
```sh
const { setupSwaggerUI } = require("auto-doc-api");
setupSwaggerUI(app, openapiSpec); // generate swagger ui at /api-docs/swagger-ui

```

### ** express example**  
```sh
const express = require("express");
const { generateOpenAPISpec, writeOpenAPIFiles, setupSwaggerUI } = require("auto-doc-api");
const app = express();

const openapiSpec = generateOpenAPISpec("express",app); // pass framework name and application route as a parameter
writeOpenAPIFiles(openapiSpec, "./docs"); // generate doc file - .yaml and .json
setupSwaggerUI(app, openapiSpec); // generate swagger ui at /api-docs/swagger-ui

```

### ** fastify example**  
```sh
const fastify  = require("fastify");
const { generateOpenAPISpec, writeOpenAPIFiles, setupSwaggerUI } = require("auto-doc-api");
const app = fastify();

const openapiSpec = generateOpenAPISpec("express",app); // pass framework name and application route as a parameter
writeOpenAPIFiles(openapiSpec, "./docs"); // generate doc file - .yaml and .json
setupSwaggerUI(app, openapiSpec); // generate swagger ui at /api-docs/swagger-ui

```


### ** koa example**  
```sh
const Koa = require("koa");
const Router = require("@koa/router");
const app = new Koa();
const router = new Router();
const { generateOpenAPISpec, writeOpenAPIFiles, setupSwaggerUI } = require("auto-doc-api");

const openapiSpec = generateOpenAPISpec("express",router); // pass framework name and application route as a parameter
writeOpenAPIFiles(openapiSpec, "./docs"); // generate doc file - .yaml and .json
setupSwaggerUI(router, openapiSpec); // generate swagger ui at /api-docs/swagger-ui

```


## **🚀 Beta Feature**  
Generate Code from doc.yaml or doc.json file for **Express, Koa, or Fastify** with one command! 🎯  

### ** Generate Code**  
```sh
const { generateCodeFromOpenAPI } = require("auto-doc-api");

generateCodeFromOpenAPI("./docs/openapi.yaml", "./output","express");

```