import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { WalletProvider } from "@/contexts/WalletContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "@/components/Navbar";
import Dashboard from "@/pages/Dashboard";
import BrowseProjects from "@/pages/BrowseProjects";
import ProjectDetails from "@/pages/ProjectDetails";
import MyPlots from "@/pages/MyPlots";
import OwnerPanel from "@/pages/OwnerPanel";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/browse" component={BrowseProjects} />
      <Route path="/project/:id" component={ProjectDetails} />
      <Route path="/my-plots" component={MyPlots} />
      <Route path="/owner" component={OwnerPanel} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <WalletProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-background">
            <Navbar />
            <Router />
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
