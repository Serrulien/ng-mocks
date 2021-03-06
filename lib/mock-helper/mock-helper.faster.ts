import { getTestBed, TestBed } from '@angular/core/testing';

import ngMocksUniverse from '../common/ng-mocks-universe';

import mockHelperFlushTestBed from './mock-helper.flush-test-bed';

export default () => {
  beforeAll(() => {
    if (ngMocksUniverse.global.has('bullet:customized')) {
      TestBed.resetTestingModule();
    }
    ngMocksUniverse.global.set('bullet', true);
  });

  afterEach(() => {
    mockHelperFlushTestBed();
    for (const fixture of (getTestBed() as any)._activeFixtures || /* istanbul ignore next */ []) {
      fixture.destroy();
    }
  });

  afterAll(() => {
    ngMocksUniverse.global.delete('bullet');
    if (ngMocksUniverse.global.has('bullet:reset')) {
      TestBed.resetTestingModule();
    }
  });
};
