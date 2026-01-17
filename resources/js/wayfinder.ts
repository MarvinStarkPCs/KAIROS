export type QueryParams = Record<
    string,
    | string
    | number
    | boolean
    | string[]
    | null
    | undefined
    | Record<string, string | number | boolean>
>;

type Method = "get" | "post" | "put" | "delete" | "patch" | "head" | "options";

let urlDefaults: Record<string, unknown> = {};

export type RouteDefinition<TMethod extends Method | Method[]> = {
    url: string;
} & (TMethod extends Method[] ? { methods: TMethod } : { method: TMethod });

export type RouteFormDefinition<TMethod extends Method> = {
    action: string;
    method: TMethod;
};

export type RouteQueryOptions = {
    query?: QueryParams;
    mergeQuery?: QueryParams;
};

export const queryParams = (options?: RouteQueryOptions) => {
    if (!options || (!options.query && !options.mergeQuery)) {
        return "";
    }

    const query = options.query ?? options.mergeQuery;
    const includeExisting = options.mergeQuery !== undefined;

    const getValue = (value: string | number | boolean) => {
        if (value === true) {
            return "1";
        }

        if (value === false) {
            return "0";
        }

        return value.toString();
    };

    const params = new URLSearchParams(
        includeExisting && typeof window !== "undefined"
            ? window.location.search
            : "",
    );

    for (const key in query) {
        if (query[key] === undefined || query[key] === null) {
            params.delete(key);
            continue;
        }

        if (Array.isArray(query[key])) {
            if (params.has(`${key}[]`)) {
                params.delete(`${key}[]`);
            }

            (query[key] as any[]).forEach((value) => {
                params.append(`${key}[]`, value.toString());
            });
        } else if (typeof query[key] === "object") {
            params.forEach((_, paramKey) => {
                if (paramKey.startsWith(`${key}[`)) {
                    params.delete(paramKey);
                }
            });

            for (const subKey in query[key] as Record<string, any>) {
                if (typeof (query[key] as any)[subKey] === "undefined") {
                    continue;
                }

                if (
                    ["string", "number", "boolean"].includes(
                        typeof (query[key] as any)[subKey],
                    )
                ) {
                    params.set(
                        `${key}[${subKey}]`,
                        getValue((query[key] as any)[subKey]),
                    );
                }
            }
        } else {
            params.set(key, getValue(query[key] as string | number | boolean));
        }
    }

    const str = params.toString();

    return str.length > 0 ? `?${str}` : "";
};

export const applyUrlDefaults = <T extends Record<string, unknown>>(
    args: T,
): T => {
    return {
        ...urlDefaults,
        ...args,
    } as T;
};

export const setUrlDefaults = (defaults: Record<string, unknown>) => {
    urlDefaults = defaults;
};

export const validateParameters = (
    args: Record<string, unknown> | undefined,
    allowed: string[]
) => {
    if (!args) return;

    const providedKeys = Object.keys(args);
    const invalid = providedKeys.filter(key => !allowed.includes(key));

    if (invalid.length > 0) {
        console.warn(
            `Invalid route parameters: ${invalid.join(', ')}. Allowed: ${allowed.join(', ')}`
        );
    }
};
