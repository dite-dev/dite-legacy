import { describe, expect, vi, test } from 'vitest'


test('class', () => {
  class A {
    public foo() {
      return 'foo';
    }
  }
  const a = new A();
  expect(a.foo()).toEqual('foo');
});
