import { describe, it, expect } from 'vitest';
import { getGlyphByNaturezaName, makeParishIcon } from './mapIcons.js';

describe('mapIcons', () => {
    it('maps SRPC-RAM natures (same ANEPC codes as the continent) to glyphs', () => {
        expect(getGlyphByNaturezaName('Movimento de massa')).toBe('🪨');
        expect(getGlyphByNaturezaName('Queda de Árvore')).toBe('🪵');
        expect(getGlyphByNaturezaName('Inundação de estruturas ou superfícies por precipitação intensa')).toBe('🌊');
        expect(getGlyphByNaturezaName('Dano ou Queda de redes de fornecimento eléctrico')).toBe('⚡');
        // unchanged continental rules
        expect(getGlyphByNaturezaName('Incêndio em Povoamento Florestal')).toBe('🌲');
    });

    it('parish icon shows the count and grows with it', () => {
        const small = makeParishIcon({ count: 1, nature: 'Queda de Árvore' });
        const big = makeParishIcon({ count: 30, nature: 'Queda de Árvore' });
        expect(small.options.html).toContain('>1<');
        expect(big.options.html).toContain('>30<');
        expect(big.options.iconSize[0]).toBeGreaterThan(small.options.iconSize[0]);
        expect(big.options.iconSize[0]).toBeLessThanOrEqual(64);
    });
});
