const UPSTREAM = 'https://api.fogos.pt/v2/incidents/active';

export async function onRequestGet({ request, env }) {
    if (!env.FOGOS_API_KEY) {
        return jsonError(500, 'FOGOS_API_KEY not configured');
    }

    const incoming = new URL(request.url);
    const upstream = new URL(UPSTREAM);
    upstream.search = incoming.search;

    let upstreamResponse;
    try {
        upstreamResponse = await fetch(upstream, {
            headers: {
                'X-API-Key': env.FOGOS_API_KEY,
                'Accept': 'application/json',
            },
            cf: { cacheTtl: 30, cacheEverything: true },
        });
    } catch (err) {
        return jsonError(502, `Upstream fetch failed: ${err?.message || err}`);
    }

    const headers = new Headers({
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=15, s-maxage=30',
    });

    return new Response(upstreamResponse.body, {
        status: upstreamResponse.status,
        headers,
    });
}

function jsonError(status, message) {
    return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
}
