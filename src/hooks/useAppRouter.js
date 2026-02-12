import {
  AppLink,
  useAppLocation,
  useAppNavigate,
  useAppParams,
} from '../app/routerAdapter';

export { AppLink, useAppNavigate, useAppLocation, useAppParams };

export const useAppPathname = () => useAppLocation().pathname;

export const useAppRouter = () => {
  const navigate = useAppNavigate();
  const location = useAppLocation();
  const params = useAppParams();

  return {
    navigate,
    location,
    params,
    pathname: location.pathname,
  };
};
