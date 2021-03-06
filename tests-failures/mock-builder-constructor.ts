import { InjectionToken, PipeTransform } from '@angular/core';
import * as assert from 'assert';
import { IMockBuilderResult, MockBuilder } from 'ng-mocks';
import { EMPTY, Observable } from 'rxjs';

class MyModule {
  public readonly name = 'MyModule';
}

const moduleWithProviders = {
  ngModule: MyModule,
  providers: [],
};

class MyComponent {
  public readonly name = 'MyComponent';
}

class MyDirective {
  public readonly name = 'MyDirective';
}

abstract class AbstractDirective {}

class MyPipe implements PipeTransform {
  public readonly name = 'MyPipe';

  public transform(value: string, arg1: boolean): boolean {
    return this.name.length > 0 && value.length > 0 && arg1;
  }
}

class MyService {
  public readonly name = 'MyService';

  public o$: Observable<number> = EMPTY;

  public echo(): Observable<number> {
    return this.o$;
  }
}

const TOKEN_UNKNOWN = new InjectionToken('TOKEN_UNKNOWN');

MockBuilder(MyModule);
MockBuilder(MyComponent);
MockBuilder(MyDirective);
MockBuilder(AbstractDirective);
MockBuilder(MyPipe);
MockBuilder(MyService);
MockBuilder(TOKEN_UNKNOWN);
MockBuilder('param');
MockBuilder(null, MyModule);
MockBuilder(null, MyComponent);
MockBuilder(null, MyDirective);
MockBuilder(null, AbstractDirective);
MockBuilder(null, MyPipe);
MockBuilder(null, MyService);
MockBuilder(null, null);
MockBuilder(null, undefined);
MockBuilder(undefined, null);
MockBuilder(undefined, undefined);

// @ts-expect-error: does not support not modules.
MockBuilder(null, TOKEN_UNKNOWN);

// @ts-expect-error: does not support not modules.
MockBuilder(null, 'param');

// @ts-expect-error: does not support modules with providers.
MockBuilder(null, moduleWithProviders);

// @ts-expect-error: does not support modules with providers.
MockBuilder(moduleWithProviders);

const promise1: Promise<IMockBuilderResult> = MockBuilder();
const promise2: Promise<IMockBuilderResult> = MockBuilder().mock(MyModule);
const promise3: Promise<IMockBuilderResult> = MockBuilder().keep(MyModule);
const promise4: Promise<IMockBuilderResult> = MockBuilder().exclude(MyModule);
const promise5: Promise<IMockBuilderResult> = MockBuilder().replace(MyModule, MyComponent);
assert(promise1);
assert(promise2);
assert(promise3);
assert(promise4);
assert(promise5);
