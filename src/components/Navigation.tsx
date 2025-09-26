import { NavLink } from "react-router-dom";
import ConnectWallet from "./ConnectWallet";
import { Vote, BarChart3, Home, Wallet } from "lucide-react";

const Navigation = ({
  account,
  setAccount,
}: {
  account: string | null;
  setAccount: React.Dispatch<React.SetStateAction<string | null>>;
}) => {
  return (
    <nav className="border-b border-border bg-background-secondary/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Vote className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold gradient-text">VoteDAO</h1>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-3 py-2 rounded-lg transition-smooth ${
                    isActive
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`
                }
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </NavLink>

              {account && (
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-3 py-2 rounded-lg transition-smooth ${
                      isActive
                        ? "bg-primary/20 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`
                  }
                >
                  <Vote className="w-4 h-4" />
                  <span>Dashboard</span>
                </NavLink>
              )}

              <NavLink
                to="/results"
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-3 py-2 rounded-lg transition-smooth ${
                    isActive
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`
                }
              >
                <BarChart3 className="w-4 h-4" />
                <span>Results</span>
              </NavLink>
            </div>
          </div>

          <ConnectWallet setAccount={setAccount} />
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
