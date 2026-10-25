import { describe, it, expect } from 'vitest';
import { filesOfProject } from 'tsarch';

describe('Clean Architecture Rules', () => {
  it('domain should not depend on application, infrastructure or api', async () => {
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

  it('application should only depend on domain and not on infrastructure or api', async () => {
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

  it('infrastructure should not depend on api', async () => {
    const violations = await filesOfProject()
      .inFolder('infrastructure')
      .shouldNot()
      .dependOnFiles()
      .inFolder('api')
      .check();

    expect(violations).toEqual([]);
  });
});
