import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';

export default function ForgotPassword() {
  return (
    <Card>
      <h2 className="text-h3 font-semibold text-body mb-6 text-center">Forgot Password</h2>
      <p className="text-center text-muted">Forgot password flow will go here.</p>
      <div className="mt-6 text-center">
        <Link to="/login" className="font-medium text-primary hover:underline">
          Back to log in
        </Link>
      </div>
    </Card>
  );
}
