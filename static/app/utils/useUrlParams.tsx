import {useCallback} from 'react';

import {browserHistory} from 'sentry/utils/browserHistory';
import {useLocation} from 'sentry/utils/useLocation';

// TODO(epurkhiser): Once we're on react-router 6 we should replace this with
// their useSearchParams hook

function useUrlParams(
  defaultKey: string,
  defaultValue: string
): {
  getParamValue: () => string;
  setParamValue: (value: string) => void;
};
function useUrlParams(defaultKey: string): {
  getParamValue: () => string | undefined;
  setParamValue: (value: string) => void;
};
function useUrlParams(): {
  getParamValue: (key: string) => string | undefined;
  setParamValue: (key: string, value: string) => void;
};
function useUrlParams(defaultKey?: string, defaultValue?: string) {
  const location = useLocation();

  const getParamValue = useCallback(
    (key: string) => {
      // location.query.key can return string[] but we expect a singular value from this function, so we return the first string (this is picked arbitrarily) if it's string[]
      return Array.isArray(location.query[key])
        ? location.query[key]?.at(0) ?? defaultValue
        : location.query[key] ?? defaultValue;
    },
    [defaultValue, location.query]
  );

  const setParamValue = useCallback(
    (key: string, value: string) => {
      const query = {...location.query, [key]: value};
      browserHistory.push({...location, query});
    },
    [location]
  );

  const getWithDefault = useCallback(
    () => getParamValue(defaultKey || ''),
    [getParamValue, defaultKey]
  );
  const setWithDefault = useCallback(
    (value: string) => setParamValue(defaultKey || '', value),
    [setParamValue, defaultKey]
  );

  if (defaultKey !== undefined) {
    return {
      getParamValue: getWithDefault,
      setParamValue: setWithDefault,
    };
  }

  return {
    getParamValue,
    setParamValue,
  };
}

export default useUrlParams;
