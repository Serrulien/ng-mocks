import { Pipe, PipeTransform } from '@angular/core';
import { getTestBed } from '@angular/core/testing';

import coreReflectPipeResolve from '../common/core.reflect.pipe-resolve';
import { Type } from '../common/core.types';
import { getMockedNgDefOf } from '../common/func.get-mocked-ng-def-of';
import { Mock } from '../common/mock';
import { MockOf } from '../common/mock-of';
import ngMocksUniverse from '../common/ng-mocks-universe';
import helperMockService from '../mock-service/helper.mock-service';

import { MockedPipe } from './types';

/**
 * @see https://github.com/ike18t/ng-mocks#how-to-mock-a-pipe
 */
export function MockPipes(...pipes: Array<Type<PipeTransform>>): Array<Type<PipeTransform>> {
  return pipes.map(pipe => MockPipe(pipe, undefined));
}

const getMockClass = (pipe: Type<any>, transform?: PipeTransform['transform']): Type<any> => {
  @Pipe(coreReflectPipeResolve(pipe))
  @MockOf(pipe, {
    init: (instance: PipeTransform) => {
      if (transform) {
        instance.transform = transform;
      }
      if (!instance.transform) {
        helperMockService.mock(instance, 'transform', `${instance.constructor.name}.transform`);
      }
    },
  })
  class PipeMock extends Mock {}

  return PipeMock;
};

/**
 * @see https://github.com/ike18t/ng-mocks#how-to-mock-a-pipe
 */
export function MockPipe<TPipe extends PipeTransform>(
  pipe: Type<TPipe>,
  transform?: TPipe['transform'],
): Type<MockedPipe<TPipe>>;

export function MockPipe<TPipe extends PipeTransform>(
  pipe: Type<TPipe>,
  transform?: TPipe['transform'],
): Type<MockedPipe<TPipe>> {
  // We are inside of an 'it'. It's fine to return a mock copy.
  if ((getTestBed() as any)._instantiated) {
    try {
      return getMockedNgDefOf(pipe, 'p');
    } catch (error) {
      // looks like an in-test mock.
    }
  }
  // istanbul ignore next
  if (ngMocksUniverse.flags.has('cachePipe') && ngMocksUniverse.cacheDeclarations.has(pipe)) {
    return ngMocksUniverse.cacheDeclarations.get(pipe);
  }

  const mock = getMockClass(pipe, transform);
  if (ngMocksUniverse.flags.has('cachePipe')) {
    ngMocksUniverse.cacheDeclarations.set(pipe, mock);
  }

  return mock as any;
}
