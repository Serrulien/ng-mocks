import { PipeTransform } from '@angular/core';

import { Type } from './core.types';
import { isNgType } from './func.is-ng-type';

const isModuleCheck = (def: any, ngType?: string): boolean => (!ngType || ngType === 'm') && isNgType(def, 'NgModule');
const isComponentCheck = (def: any, ngType?: string): boolean =>
  (!ngType || ngType === 'c') && isNgType(def, 'Component');
const isDirectiveCheck = (def: any, ngType?: string): boolean =>
  (!ngType || ngType === 'd') && isNgType(def, 'Directive');
const isPipeCheck = (def: any, ngType?: string): boolean => (!ngType || ngType === 'p') && isNgType(def, 'Pipe');
const isInjectableCheck = (def: any, ngType?: string): boolean =>
  (!ngType || ngType === 'i') && isNgType(def, 'Injectable');

/**
 * Checks whether a class was decorated by @NgModule.
 *
 * @see https://github.com/ike18t/ng-mocks#isngdef
 */
export function isNgDef(declaration: any, ngType: 'm'): declaration is Type<any>;

/**
 * Checks whether a class was decorated by @Component.
 *
 * @see https://github.com/ike18t/ng-mocks#isngdef
 */
export function isNgDef(declaration: any, ngType: 'c'): declaration is Type<any>;

/**
 * Checks whether a class was decorated by @Directive.
 *
 * @see https://github.com/ike18t/ng-mocks#isngdef
 */
export function isNgDef(declaration: any, ngType: 'd'): declaration is Type<any>;

/**
 * Checks whether a class was decorated by @Pipe.
 *
 * @see https://github.com/ike18t/ng-mocks#isngdef
 */
export function isNgDef(declaration: any, ngType: 'p'): declaration is Type<PipeTransform>;

/**
 * Checks whether a class was decorated by @Injectable.
 *
 * @see https://github.com/ike18t/ng-mocks#isngdef
 */
export function isNgDef(declaration: any, ngType: 'i'): declaration is Type<any>;

/**
 * Checks whether a class was decorated by a ng type.
 *
 * @see https://github.com/ike18t/ng-mocks#isngdef
 */
export function isNgDef(declaration: any): declaration is Type<any>;

export function isNgDef(declaration: any, ngType?: string): declaration is Type<any> {
  const isModule = isModuleCheck(declaration, ngType);
  const isComponent = isComponentCheck(declaration, ngType);
  const isDirective = isDirectiveCheck(declaration, ngType);
  const isPipe = isPipeCheck(declaration, ngType);
  const isInjectable = isInjectableCheck(declaration, ngType);

  return isModule || isComponent || isDirective || isPipe || isInjectable;
}
