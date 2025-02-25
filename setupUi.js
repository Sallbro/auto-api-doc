const swaggerUi = require("swagger-ui-express");

// setup swagger ui
function setupSwaggerUI(app, openapiSpec) {
    app.use("/api-docs/swagger-ui", swaggerUi.serve, swaggerUi.setup(openapiSpec));
    console.log("Swagger UI available at /api-docs/swagger-ui");
}

module.exports={setupSwaggerUI}
