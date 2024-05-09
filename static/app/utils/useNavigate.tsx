import {useCallback, useEffect, useRef} from 'react';
import {useNavigate as useReactRouter6Navigate} from 'react-router-dom';
import type {LocationDescriptor} from 'history';

import {USING_REACT_ROUTER_SIX} from 'sentry/constants';
import {useRouteContext} from 'sentry/utils/useRouteContext';
import {normalizeUrl} from 'sentry/utils/withDomainRequired';

import {locationDescriptorToTo} from './reactRouter6Compat';

type NavigateOptions = {
  replace?: boolean;
  state?: any;
};

interface ReactRouter3Navigate {
  (to: LocationDescriptor, options?: NavigateOptions): void;
  (delta: LocationDescriptor | number): void;
}

/**
 * Returns an imperative method for changing the location. Used by `<Link>`s, but
 * may also be used by other elements to change the location.
 *
 * @see https://reactrouter.com/hooks/use-navigate
 */
export function useNavigate() {
  if (USING_REACT_ROUTER_SIX) {
    // biome-ignore lint/correctness/useHookAtTopLevel: react-router-6 migration
    const router6Navigate = useReactRouter6Navigate();

    // XXX(epurkhiser): Translate legacy LocationDescriptor to To in the
    // navigate helper.

    // biome-ignore lint/correctness/useHookAtTopLevel: react-router-6 migration
    const navigate = useCallback<ReactRouter3Navigate>(
      (to: LocationDescriptor | number, options: NavigateOptions = {}) =>
        typeof to === 'number'
          ? router6Navigate(to)
          : router6Navigate(locationDescriptorToTo(to), options),
      [router6Navigate]
    );

    return navigate;
  }

  // biome-ignore lint/correctness/useHookAtTopLevel: react-router-6 migration
  const route = useRouteContext();

  const navigator = route.router;
  // biome-ignore lint/correctness/useHookAtTopLevel: react-router-6 migration
  const hasMountedRef = useRef(false);
  //
  // biome-ignore lint/correctness/useHookAtTopLevel: react-router-6 migration
  useEffect(() => {
    hasMountedRef.current = true;
  });

  // biome-ignore lint/correctness/useHookAtTopLevel: react-router-6 migration
  const navigate = useCallback<ReactRouter3Navigate>(
    (to: LocationDescriptor | number, options: NavigateOptions = {}) => {
      if (!hasMountedRef.current) {
        throw new Error(
          `You should call navigate() in a React.useEffect(), not when your component is first rendered.`
        );
      }
      if (typeof to === 'number') {
        return navigator.go(to);
      }

      const nextState = {
        pathname: normalizeUrl(to),
        state: options.state,
      };

      if (options.replace) {
        return navigator.replace(nextState as any);
      }

      return navigator.push(nextState as any);
    },
    [navigator]
  );
  return navigate;
}
