import { describe, expect, test } from 'vitest';
import {
  CATEGORIAS,
  IDIOMAS,
  categoriaPorEavmoda,
  categoriaPorSlug,
  slugCategoria,
} from '@/i18n/categorias';

describe('categorias', () => {
  test('cobre as nove categorias do site antigo, com o mesmo eavmoda', () => {
    const porEavmoda = Object.fromEntries(CATEGORIAS.map((c) => [c.eavmoda, c.id]));
    expect(porEavmoda).toEqual({
      3: 'cachoeiras',
      2: 'pousadas',
      6: 'passeios',
      4: 'restaurantes',
      13: 'campings',
      5: 'queijarias',
      15: 'artesanato',
      16: 'museus-e-igrejas',
      12: 'ranchos',
    });
  });

  test('toda categoria tem slug nos cinco idiomas', () => {
    for (const categoria of CATEGORIAS) {
      for (const idioma of IDIOMAS) {
        expect(categoria.slugs[idioma], `${categoria.id}/${idioma}`).toMatch(/^[a-z0-9-]+$/);
      }
    }
  });

  test('não há slug repetido dentro do mesmo idioma', () => {
    for (const idioma of IDIOMAS) {
      const slugs = CATEGORIAS.map((c) => c.slugs[idioma]);
      expect(new Set(slugs).size, `slugs repetidos em ${idioma}`).toBe(slugs.length);
    }
  });

  test('vai e volta entre slug e categoria', () => {
    expect(categoriaPorSlug('waterfalls', 'en')?.id).toBe('cachoeiras');
    expect(categoriaPorSlug('cascadas', 'es')?.eavmoda).toBe(3);
    expect(categoriaPorSlug('cachoeiras', 'en')).toBeNull();
    expect(slugCategoria('cachoeiras', 'de')).toBe('wasserfaelle');
  });

  test('o eavmoda da empresa vira a categoria da URL', () => {
    expect(categoriaPorEavmoda(2)?.id).toBe('pousadas');
    expect(categoriaPorEavmoda(999)).toBeNull();
    expect(categoriaPorEavmoda(null)).toBeNull();
  });
});
