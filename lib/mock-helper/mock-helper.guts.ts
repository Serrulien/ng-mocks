import { TestModuleMetadata } from '@angular/core/testing';

import { flatten, mapValues } from '../common/core.helpers';
import coreReflectModuleResolve from '../common/core.reflect.module-resolve';
import funcGetProvider from '../common/func.get-provider';
import { isNgDef } from '../common/func.is-ng-def';
import { isNgInjectionToken } from '../common/func.is-ng-injection-token';
import { isNgModuleDefWithProviders } from '../common/func.is-ng-module-def-with-providers';
import { MockComponent } from '../mock-component/mock-component';
import { MockDirective } from '../mock-directive/mock-directive';
import { MockModule } from '../mock-module/mock-module';
import { MockPipe } from '../mock-pipe/mock-pipe';
import mockProvider from '../mock-service/mock-provider';

type Data = {
  declarations: any[];
  exclude: Set<any>;
  imports: any[];
  keep: Set<any>;
  mock: Set<any>;
  providers: any[];
  skip: Set<any>;
};

const skipDef = (def: any, skip: Set<any>, exclude: Set<any>): boolean => {
  if (skip.has(def)) {
    return true;
  }
  skip.add(def);

  return exclude.has(def);
};

const createMeta = ({ keep, skip, exclude, imports, declarations, providers }: Data): TestModuleMetadata => {
  for (const def of keep) {
    if (skip.has(def) || exclude.has(def)) {
      continue;
    }
    if (isNgDef(def, 'm')) {
      imports.push(def);
    } else if (isNgDef(def, 'c') || isNgDef(def, 'd')) {
      declarations.push(def);
    } else if (isNgDef(def, 'p')) {
      declarations.push(def);
      providers.push(def);
    } else if (!isNgInjectionToken(def)) {
      providers.push(def);
    }
  }

  return { declarations, imports, providers };
};

const typeMap: Array<[any, string]> = [
  ['m', 'module'],
  ['c', 'component'],
  ['d', 'directive'],
  ['p', 'pipe'],
];

const getType = (def: any, keep: Set<any>): string => {
  if (isNgModuleDefWithProviders(def)) {
    return 'module-with-providers';
  }
  for (const [flag, value] of typeMap) {
    if (isNgDef(def, flag)) {
      return flag === 'm' && keep.has(def) ? `${value}-keep` : value;
    }
  }

  return '';
};

const handleModuleWithProviders = (data: Data, def: any): void => {
  if (data.skip.has(def.ngModule)) {
    return;
  }
  data.skip.add(def.ngModule);
  if (data.exclude.has(def.ngModule)) {
    return;
  }

  data.imports.push(data.keep.has(def.ngModule) ? def : MockModule(def));
};

const handleDeclaration = (data: Data, def: any, callback: any, bucket: any[]): void => {
  if (skipDef(def, data.skip, data.exclude)) {
    return;
  }

  bucket.push(data.keep.has(def) ? def : callback(def));
};

const handleDestructuring = (data: Data, def: any, callback: any): void => {
  if (skipDef(def, data.skip, data.exclude)) {
    return;
  }

  const meta = coreReflectModuleResolve(def);
  for (const toMock of flatten([meta.declarations, meta.imports])) {
    callback(data, toMock);
  }
  for (const toMock of meta.providers ? flatten(meta.providers) : []) {
    resolveProvider(data, toMock);
  }
};

const resolveProvider = ({ skip, keep, providers, exclude }: Data, def: any): void => {
  const provider = funcGetProvider(def);
  skip.add(provider);
  if (exclude.has(provider)) {
    return;
  }

  const providerDef = keep.has(provider) ? def : mockProvider(def);
  if (providerDef) {
    providers.push(providerDef);
  }
};

const resolveMap: Record<string, any> = {
  component: MockComponent,
  directive: MockDirective,
  pipe: MockPipe,
};

const resolve = (data: Data, def: any, skipDestruction = true): void => {
  if (!def) {
    return;
  }

  const type = getType(def, data.keep);

  if (type === 'module-with-providers') {
    handleModuleWithProviders(data, def);
  } else if (type === 'module-keep') {
    handleDeclaration(data, def, MockModule, data.imports); // MockModule won't be called because the def is kept.
  } else if (type === 'module' && skipDestruction) {
    handleDeclaration(data, def, MockModule, data.imports);
  } else if (type === 'module') {
    handleDestructuring(data, def, resolve);
  } else if (resolveMap[type]) {
    handleDeclaration(data, def, resolveMap[type], data.declarations);
  } else {
    resolveProvider(data, def);
  }
};

const generateData = (keep: any, mock: any, exclude: any): Data => ({
  declarations: [],
  exclude: new Set(flatten(exclude || [])),
  imports: [],
  keep: new Set(flatten(keep || [])),
  mock: new Set(flatten(mock || [])),
  providers: [],
  skip: new Set(),
});

export default (keep: any, mock: any = null, exclude: any = null): TestModuleMetadata => {
  const data: Data = generateData(keep, mock, exclude);

  for (const def of mapValues(data.mock)) {
    resolve(data, def, false);
  }

  return createMeta(data);
};
