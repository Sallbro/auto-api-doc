const { extractParams, formatPath } = require("./helper");

// extract express routes
function extractExpressRoutes(app) {
    let routes = [];

    function processStack(stack, prefix = "") {
        stack.forEach((middleware) => {
            if (middleware.route) {
                const path = formatPath(prefix + middleware.route.path);

                // Ignore wildcard (*) routes (like OPTIONS *)
                if (path === "*") return;

                const methods = Object.keys(middleware.route.methods)
                    .map((m) => m.toUpperCase())
                    .filter((method) => method !== "OPTIONS"); // Ignore OPTIONS

                const params = extractParams(path);

                routes.push({ path, methods, params });
            } else if (middleware.name === "router" && middleware.handle.stack) {
                let newPrefix = prefix;
                if (middleware.regexp) {
                    const match = middleware.regexp.source.match(/^\\\/([^\\]+)/);
                    if (match) {
                        newPrefix += "/" + match[1];
                    }
                }
                processStack(middleware.handle.stack, newPrefix);
            }
        });
    }

    processStack(app._router.stack);
    return routes;
}

// fastify express routes
function extractFastifyRoutes(fastify) {
    let routes = [];

    fastify.routes.forEach((route) => {
        if (!route.url || route.url === "*") return; // Ignore wildcard routes

        routes.push({
            path: route.url,
            methods: [route.method.toUpperCase()],
            params: extractParams(route.url),
        });
    });

    return routes;
}

// koa express routes
function extractKoaRoutes(router) {
    let routes = [];

    router.stack.forEach((layer) => {
        if (!layer.path || layer.path === "*") return; // Ignore wildcard routes

        routes.push({
            path: layer.path,
            methods: layer.methods.map((m) => m.toUpperCase()),
            params: extractParams(layer.path),
        });
    });

    return routes;
}

module.exports = { extractExpressRoutes, extractFastifyRoutes, extractKoaRoutes }
