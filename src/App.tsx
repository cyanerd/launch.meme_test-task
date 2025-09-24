import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryProvider } from './components/providers/QueryProvider';
import { ThemeProvider } from './components/providers/ThemeProvider';
import { PrivyProvider } from './context/PrivyContext';
import { SolanaWalletProvider } from './context/SolanaWalletContext';
import { AuthRedirectHandler } from './components/features/auth/AuthRedirectHandler';
import { TerminalLayout } from './components/layouts/TerminalLayout';
import { LoginModal } from './components/features/auth/LoginModal';
import { Snackbar } from './components/ui/Snackbar';
import { Home } from './pages/Home';
import { Create } from './pages/Create';
import { Portfolio } from './pages/Portfolio';
import { Profile } from './pages/Profile';
import { Rewards } from './pages/Rewards';
import './index.css';

function App() {
  return (
    <Router>
      <QueryProvider>
        <ThemeProvider>
          <PrivyProvider>
            <SolanaWalletProvider>
              <AuthRedirectHandler />
              <TerminalLayout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/portfolio" element={<Portfolio />} />
                  <Route path="/create" element={<Create />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/rewards" element={<Rewards />} />
                </Routes>
              </TerminalLayout>
              <LoginModal />
              <Snackbar />
            </SolanaWalletProvider>
          </PrivyProvider>
        </ThemeProvider>
      </QueryProvider>
    </Router>
  );
}

export default App;
