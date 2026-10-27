import { describe, it, expect } from 'vitest';
import { filesOfProject } from 'tsarch';

describe('Regras de Arquitetura Limpa (Clean Architecture)', () => {
  it('a camada domain não deve depender de application, infrastructure ou api', async () => {
    const forbiddenLayers = ['application', 'infrastructure', 'api'];

    for (const layer of forbiddenLayers) {
      const violations = await filesOfProject()
        .inFolder('domain')
        .shouldNot()
        .dependOnFiles()
        .inFolder(layer)
        .check();

      expect(violations).toEqual([]);
    }
  });

  it('a camada application deve depender apenas de domain e não de infrastructure ou api', async () => {
    const forbiddenLayers = ['infrastructure', 'api'];

    for (const layer of forbiddenLayers) {
      const violations = await filesOfProject()
        .inFolder('application')
        .shouldNot()
        .dependOnFiles()
        .inFolder(layer)
        .check();

      expect(violations).toEqual([]);
    }
  });

  it('a camada infrastructure não deve depender da camada api', async () => {
    const violations = await filesOfProject()
      .inFolder('infrastructure')
      .shouldNot()
      .dependOnFiles()
      .inFolder('api')
      .check();

    expect(violations).toEqual([]);
  });
});
