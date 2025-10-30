import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { WalletProvider } from "@/contexts/WalletContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Dashboard from "@/pages/Dashboard";
import BrowseProjects from "@/pages/BrowseProjects";
import ProjectDetails from "@/pages/ProjectDetails";
import MyPlots from "@/pages/MyPlots";
import OwnerPanel from "@/pages/OwnerPanel";
import Documentation from "@/pages/Documentation";
import HelpCenter from "@/pages/HelpCenter";
import TermsOfService from "@/pages/TermsOfService";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import AboutUs from "@/pages/AboutUs";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/browse" component={BrowseProjects} />
      <Route path="/project/:id" component={ProjectDetails} />
      <Route path="/my-plots" component={MyPlots} />
      <Route path="/owner" component={OwnerPanel} />
      <Route path="/docs" component={Documentation} />
      <Route path="/help" component={HelpCenter} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/about" component={AboutUs} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <WalletProvider>
        <TooltipProvider>
          <div className="flex flex-col min-h-screen bg-background">
            <Navbar />
            <main className="flex-1">
              <Router />
            </main>
            <Footer />
          </div>
          <Toaster />
          <ToastContainer 
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </TooltipProvider>
      </WalletProvider>
    </ThemeProvider>
  );
}

export default App;
