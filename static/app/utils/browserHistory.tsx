import {browserHistory as react3BrowserHistory} from 'react-router';
import type {NavigateFunction} from 'react-router-dom';
import type {History} from 'history';

import {location6ToLocation3, locationDescriptorToTo} from './reactRouter6Compat';

/**
 * @deprecated Prefer using useNavigate
 *
 * browserHistory is a hold-over from react-router 3 days. In react-router 6
 * the useNavigate hook is the native way to trigger navigation events.
 *
 * browserHistory.push('/next')    -> navigate('/next')
 * browserHistory.replace('/next') -> navigate('/next', {replace: true})
 */
export let browserHistory = react3BrowserHistory;

/**
 * This shim sets the global `browserHistory` to a shim object that matches
 * react-router 3's browserHistory implementation
 */
export function DANGEROUS_SET_REACT_ROUTER_6_HISTORY(navigate: NavigateFunction) {
  // XXX(epurkhiser): The history object for react-router 6 is slightly
  // different in typing from the react-router 3 history. We need to shim some
  // of the functions to keep things working
  const compat6BrowserHistory: History = {
    push: to => navigate(locationDescriptorToTo(to)),
    replace: to => navigate(locationDescriptorToTo(to), {replace: true}),
    go: n => navigate(n),
    goBack: () => navigate(-1),
    goForward: () => navigate(1),

    // XXX(epurkhiser): react-router 6's BrowserHistory does not let you create
    // multiple lsiteners. This implementation is similar but allows multiple
    // listeners.
    listen: listener => {
      return () => {};

      const shimListener = () => {
        // XXX(epurkhiser): History object must be translated
        listener(location6ToLocation3(history.location));
      };

      window.addEventListener('popstate', shimListener);
      return () => window.removeEventListener('popstate', shimListener);
    },

    listenBefore: _hook => {
      // eslint-disable-next-line no-console
      console.error('browserHistory.listenBefore not implemented on react-router 6 shim');
      return () => {};
    },
    transitionTo: _location => {
      // eslint-disable-next-line no-console
      console.error('browserHistory.transitionTo not implemented on react-router 6 shim');
    },
    createKey: () => {
      // eslint-disable-next-line no-console
      console.error('browserHistory.createKey not implemented on react-router 6 shim');
      return '';
    },
    createPath: () => {
      // eslint-disable-next-line no-console
      console.error('browserHistory.createPath not implemented on react-router 6 shim');
      return '';
    },
    createHref: () => {
      // eslint-disable-next-line no-console
      console.error('browserHistory.createHref not implemented on react-router 6 shim');
      return '';
    },
    createLocation: () => {
      // eslint-disable-next-line no-console
      console.error(
        'browserHistory.createLocation not implemented on react-router 6 shim'
      );
      return undefined as any;
    },
    getCurrentLocation: () => {
      // eslint-disable-next-line no-console
      console.error(
        'browserHistory.getCurrentLocation not implemented on react-router 6 shim'
      );
      return undefined as any;
    },
  };

  browserHistory = compat6BrowserHistory;
}
