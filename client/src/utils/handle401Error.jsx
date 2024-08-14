let navigator = null;
let isAuthenticated = true;
let authStatusUpdater = () => {}; 

export const setNavigator = (nav) => {
  navigator = nav;
};

export const handle401Error = () => {
  if (navigator) {
    localStorage.clear();
    isAuthenticated = false; 
    authStatusUpdater();
    navigator('/sign-up');
  } else {
    console.error('Navigator is not set');
  }
};

export const getAuthStatus = () => isAuthenticated;

export const setAuthStatusUpdater = (updater) => {
  authStatusUpdater = updater; 
};
