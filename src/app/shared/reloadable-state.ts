import { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, Observable, switchMap } from 'rxjs';
import { LoadState, withLoadState } from './load-state';

export function reloadableState<T>(load: () => Observable<T>): {
  state: Signal<LoadState<T>>;
  reload: () => void;
} {
  const trigger = new BehaviorSubject<void>(undefined);
  const state = toSignal(
    trigger.pipe(switchMap(() => withLoadState(load()))),
    { initialValue: { status: 'loading' } as LoadState<T> },
  );
  return { state, reload: () => trigger.next() };
}
