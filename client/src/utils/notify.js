import { toast } from 'react-toastify';

export const notify = (key) => {
  switch (key) {
    case 'success-data':
      toast.success('User Data successfully submitted!', {
        role: 'alert',
      });
      break;
    case 'success-register':
      toast.success('Your account is successfully created!', {
        role: 'alert',
      });
      break;
    case 'success-login':
      toast.success('Your successfully logged in!', {
        role: 'alert',
      });
      break;
    case 'success-logout':
      toast.success('You logged out successfully!', {
        role: 'alert',
      });
      break;
    case 'error':
      toast.error('An error occured. Please try submitting data again!', {
        role: 'alert',
      });
      break;
  }

  // toast.promise(
  //   func,
  //   {
  //     success: "User Data successfully submitted!",
  //     error: "An error occured. Please try submitting data again!",
  //     role: "alert",
  //   }
  // )
};
