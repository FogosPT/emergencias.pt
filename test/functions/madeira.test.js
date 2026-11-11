// @vitest-environment node
// Pages Function tests live outside functions/: every file there becomes a
// route when Cloudflare Pages builds the project.
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { onRequestGet as occurrences } from '../../functions/api/v2/madeira/occurrences.js';
import { onRequestGet as currentEvent } from '../../functions/api/v2/madeira/events/current.js';

const env = { FOGOS_API_KEY: 'secret' };

describe('Pages Functions: /api/v2/madeira/*', () => {
    beforeEach(() => {
        global.fetch = vi.fn().mockResolvedValue(
            new Response('{"success":true,"data":[]}', { status: 200 })
        );
    });

    it('occurrences forwards only the allowed params with the API key', async () => {
        const request = new Request(
            'https://emergencias.pt/api/v2/madeira/occurrences?from=2026-11-10T00:00:00Z&municipality=Funchal&limit=50&evil=1&parish=&key=x'
        );
        const res = await occurrences({ request, env });
        expect(res.status).toBe(200);
        expect(res.headers.get('Cache-Control')).toBe('public, max-age=15, s-maxage=30');
        expect(await res.json()).toEqual({ success: true, data: [] });

        const [url, init] = global.fetch.mock.calls[0];
        const u = new URL(url);
        expect(u.origin + u.pathname).toBe('https://api.fogos.pt/v2/madeira/occurrences');
        expect(Object.fromEntries(u.searchParams)).toEqual({
            from: '2026-11-10T00:00:00Z', municipality: 'Funchal', limit: '50',
        });
        expect(init.headers['X-API-Key']).toBe('secret');
    });

    it('events/current hits the upstream without forwarding params', async () => {
        const request = new Request('https://emergencias.pt/api/v2/madeira/events/current?x=1');
        const res = await currentEvent({ request, env });
        expect(res.status).toBe(200);
        const [url, init] = global.fetch.mock.calls[0];
        expect(String(url)).toBe('https://api.fogos.pt/v2/madeira/events/current');
        expect(init.headers['X-API-Key']).toBe('secret');
    });

    it('passes the upstream status through', async () => {
        global.fetch.mockResolvedValue(new Response('{"error":"x"}', { status: 404 }));
        const res = await currentEvent({ request: new Request('https://e.pt/api/v2/madeira/events/current'), env });
        expect(res.status).toBe(404);
    });

    it('returns 500 without the secret and 502 when the upstream fails', async () => {
        const request = new Request('https://emergencias.pt/api/v2/madeira/occurrences');
        expect((await occurrences({ request, env: {} })).status).toBe(500);
        expect(global.fetch).not.toHaveBeenCalled();

        global.fetch.mockRejectedValue(new Error('down'));
        const res = await occurrences({ request, env });
        expect(res.status).toBe(502);
        expect((await res.json()).error).toMatch(/down/);
    });
});
