import { describe, expect, test } from 'vitest';
import { caminhoEmOutroIdioma } from '@/i18n/caminhos';

describe('caminhoEmOutroIdioma', () => {
  test('empresa: traduz a categoria e mantém o slug', () => {
    expect(caminhoEmOutroIdioma('/cachoeiras/cachoeira-das-pacas-20501', 'pt', 'en')).toBe('/en/waterfalls/cachoeira-das-pacas-20501');
    expect(caminhoEmOutroIdioma('/en/waterfalls/cachoeira-das-pacas-20501', 'en', 'de')).toBe('/de/wasserfaelle/cachoeira-das-pacas-20501');
    expect(caminhoEmOutroIdioma('/de/wasserfaelle/cachoeira-das-pacas-20501', 'de', 'pt')).toBe('/cachoeiras/cachoeira-das-pacas-20501');
  });

  test('categoria e destino dentro da categoria', () => {
    expect(caminhoEmOutroIdioma('/cachoeiras', 'pt', 'es')).toBe('/es/cascadas');
    expect(caminhoEmOutroIdioma('/cachoeiras/capitolio', 'pt', 'fr')).toBe('/fr/cascades/capitolio');
  });

  test('rotas fixas, inclusive as aninhadas', () => {
    expect(caminhoEmOutroIdioma('/destinos/capitolio', 'pt', 'en')).toBe('/en/destinations/capitolio');
    expect(caminhoEmOutroIdioma('/conta/favoritos', 'pt', 'de')).toBe('/de/konto/favoriten');
    expect(caminhoEmOutroIdioma('/en/itineraries/serra-12', 'en', 'pt')).toBe('/roteiros/serra-12');
  });

  test('home e endereço desconhecido levam à home do idioma', () => {
    expect(caminhoEmOutroIdioma('/', 'pt', 'en')).toBe('/en');
    expect(caminhoEmOutroIdioma('/en', 'en', 'pt')).toBe('/');
    expect(caminhoEmOutroIdioma('/en/', 'en', 'es')).toBe('/es');
    expect(caminhoEmOutroIdioma('/qualquer-coisa', 'pt', 'en')).toBe('/en');
  });
});
