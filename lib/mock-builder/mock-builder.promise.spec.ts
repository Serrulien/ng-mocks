// tslint:disable no-console

import {
  Component,
  Directive,
  Injectable,
  InjectionToken,
  NgModule,
  Pipe,
  PipeTransform,
} from '@angular/core';

import { getTestBedInjection } from '../common/core.helpers';

import { MockBuilder } from './mock-builder';

@Injectable()
class TargetService {}

const TARGET_TOKEN = new InjectionToken('TARGET_TOKEN');

@Pipe({
  name: 'target',
})
class TargetPipe implements PipeTransform {
  protected name = 'pipe:';

  public transform(value: string): any {
    return `${this.name}${value}`;
  }
}

@Component({
  selector: 'target',
  template: 'target',
})
class TargetComponent {}

@Directive({
  selector: 'target',
})
class TargetDirective {}

@NgModule({
  declarations: [TargetComponent, TargetDirective, TargetPipe],
})
class TargetModule {}

describe('MockBuilderPromise', () => {
  // Thanks Ivy, it doesn't throw an error and we have to use injector.
  let backupWarn: typeof console.warn;
  let backupError: typeof console.error;

  beforeAll(() => {
    backupWarn = console.warn;
    backupError = console.error;
    console.error = console.warn = (...args: any[]) => {
      throw new Error(args.join(' '));
    };
  });

  afterAll(() => {
    console.error = backupError;
    console.warn = backupWarn;
  });

  it('skips dependencies in kept providers', async () => {
    await MockBuilder().keep(TargetService, { dependency: true });
    expect(getTestBedInjection(TargetService)).toBeFalsy();
  });

  it('adds non dependencies in kept providers', async () => {
    await MockBuilder().keep(TargetService);
    expect(getTestBedInjection(TargetService)).toBeTruthy();
  });

  it('skips dependencies in mock providers', async () => {
    await MockBuilder().mock(TargetService, TargetService, {
      dependency: true,
    });
    expect(getTestBedInjection(TargetService)).toBeFalsy();
  });

  it('adds non dependencies in mock providers', async () => {
    await MockBuilder().mock(TargetService);
    expect(getTestBedInjection(TargetService)).toBeTruthy();
  });

  it('respects several kept overloads', async () => {
    await MockBuilder()
      .keep({
        ngModule: TargetModule,
        providers: [
          {
            multi: true,
            provide: TARGET_TOKEN,
            useValue: 1,
          },
        ],
      })
      .keep({
        ngModule: TargetModule,
        providers: [
          {
            multi: true,
            provide: TARGET_TOKEN,
            useValue: 2,
          },
        ],
      });
    expect(getTestBedInjection(TARGET_TOKEN)).toEqual([1, 2]);
  });

  it('respects several mock overloads', async () => {
    await MockBuilder()
      .mock({
        ngModule: TargetModule,
        providers: [
          {
            multi: true,
            provide: TARGET_TOKEN,
            useValue: 1,
          },
        ],
      })
      .mock({
        ngModule: TargetModule,
        providers: [
          {
            multi: true,
            provide: TARGET_TOKEN,
            useValue: 2,
          },
        ],
      });
    expect(getTestBedInjection(TARGET_TOKEN)).toBeUndefined();
  });

  it('throws an error on a services replacement', () => {
    expect(() =>
      MockBuilder().replace(TargetModule, TargetService),
    ).toThrowError(/Cannot replace the declaration/);
    expect(() =>
      MockBuilder().replace(TargetService, TargetModule),
    ).toThrowError(/Cannot replace the declaration/);
  });
});
