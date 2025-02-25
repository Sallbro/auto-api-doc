const { extractExpressRoutes, extractFastifyRoutes, extractKoaRoutes }=require("./framework");

// openAPI 
function generateOpenAPISpec(framework, app, additional_info = {
    openapi: "3.0.0", info: {
        title: "Sample API",
        description: "Auto-generated OpenAPI documentation",
        version: "1.0.0",
    }
}) {
    let paths = {};
    let routes = [];
    switch (framework.toLowerCase()) {
        case "express":
            routes = extractExpressRoutes(app);
            break;
        case "fastify":
            routes = extractFastifyRoutes(app);
            break;
        case "koa":
            routes = extractKoaRoutes(app);
            break;
        default:
            throw new Error(`Unsupported framework: ${framework}`);
    }
    routes.forEach(({ path, methods, params }) => {
        paths[path] = {};

        methods.forEach((method) => {
            paths[path][method.toLowerCase()] = {
                summary: `Handle ${method} requests for ${path}`,
                parameters: params,
                responses: { "200": { description: "Success" } },
            };
        });
    });

    return {
        additional_info,
        paths
    };
}


module.exports = {
    generateOpenAPISpec
};