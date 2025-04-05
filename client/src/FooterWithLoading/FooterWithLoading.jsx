
import { useLoading } from '../components/contexts/LoadingContext';
import { Footer } from '../components/Footer/Footer';

const FooterWithLoading = ({ additionalClasses }) => {
  const { isLoading } = useLoading();
  
  if (isLoading) {
    return null; 
  }
  
  return <Footer additionalClasses={additionalClasses} />;
};

export default FooterWithLoading;