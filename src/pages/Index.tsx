import { Navigate } from 'react-router-dom';

// Redirect legacy index route to the main dashboard
const Index = () => <Navigate to="/" replace />;

export default Index;
