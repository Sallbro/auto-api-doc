const { extractParams, formatPath } = require("./helper");

function extractExpressRoutes(app) {
    let routes = [];

    function processStack(stack, prefix = "") {
        stack.forEach((middleware) => {
            if (middleware.route) {
                // ✅ Construct full path with parent prefix
                const path = formatPath(prefix + middleware.route.path);
                if (path === "*") return; // Ignore wildcard OPTIONS *

                const methods = Object.keys(middleware.route.methods)
                    .map((m) => m.toUpperCase())
                    .filter((method) => method !== "OPTIONS"); // Ignore OPTIONS

                const params = extractParams(path);
                routes.push({ path, methods, params });

            } else if (middleware.name === "router" && middleware.handle.stack) {
                let newPrefix = prefix;

                if (middleware.regexp) {
                    const matchres=middleware.regexp.toString().match(/^\/([^?]+)/);
                    const matchedPrefix = matchres ? matchres[1].replace(/\\/g, "").replace(/\^/g, "").replace(/\/$/, "") : "";

                    if (matchedPrefix) {
                        newPrefix = formatPath(`${prefix}${matchedPrefix}`);
                    }
                }

                processStack(middleware.handle.stack, newPrefix);
            }
        });
    }

    processStack(app._router.stack);
    return routes;
}

function extractFastifyRoutes(fastify) {
    let routes = [];

    function processRoutes(instance, prefix = "") {
        instance.routes.forEach((route) => {
            if (!route.url || route.url === "*") return; // Ignore wildcard routes

            const fullPath = formatPath(`${prefix}${route.url}`);
            const methods = [route.method.toUpperCase()];
            const params = extractParams(fullPath);

            routes.push({ path: fullPath, methods, params });
        });

        // Process middleware and child instances (Fastify allows encapsulated instances)
        if (instance.children) {
            instance.children.forEach((child) => processRoutes(child, formatPath(`${prefix}${child.prefix}`)));
        }
    }

    processRoutes(fastify);
    return routes;
}

function extractKoaRoutes(router) {
    let routes = [];

    function processStack(stack, prefix = "") {
        stack.forEach((layer) => {
            if (layer.path && layer.methods) {
                const fullPath = formatPath(`${prefix}${layer.path}`);
                const methods = layer.methods.map((m) => m.toUpperCase());
                const params = extractParams(fullPath);

                routes.push({ path: fullPath, methods, params });
            } else if (layer.stack) {
                // Process nested middleware (like nested routers)
                processStack(layer.stack, formatPath(`${prefix}${layer.opts.prefix || ""}`));
            }
        });
    }

    processStack(router.stack);
    return routes;
}

module.exports = { extractExpressRoutes, extractFastifyRoutes, extractKoaRoutes }
