# Land Tokenization DApp - Complete Frontend Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Architecture](#project-architecture)
4. [File Structure](#file-structure)
5. [Core Concepts](#core-concepts)
6. [Component Breakdown](#component-breakdown)
7. [State Management](#state-management)
8. [Blockchain Integration](#blockchain-integration)
9. [IPFS Integration](#ipfs-integration)
10. [Routing & Navigation](#routing--navigation)
11. [Styling & Theming](#styling--theming)
12. [Data Flow](#data-flow)
13. [User Workflows](#user-workflows)
14. [Best Practices](#best-practices)

---

## 🎯 Project Overview

### What is This Project?
A **decentralized application (DApp)** for tokenizing land plots as NFTs (Non-Fungible Tokens) on the Ethereum blockchain. Users can:
- Browse land projects
- Purchase plot NFTs
- List plots for resale
- Manage owned plots
- (Owner only) Create land projects and mint plot NFTs

### Key Features
- ✅ **Blockchain-based**: All data stored on Ethereum smart contract
- ✅ **NFT Ownership**: Each plot is an ERC721 token
- ✅ **IPFS Storage**: Project images stored on decentralized IPFS
- ✅ **MetaMask Integration**: Wallet connection for transactions
- ✅ **Real-time Updates**: Direct blockchain queries
- ✅ **Responsive Design**: Works on desktop and mobile
- ✅ **Dark Mode**: Theme switching support

---

## 🛠 Technology Stack

### Core Technologies
```json
{
  "Frontend Framework": "React 18.3.1",
  "Language": "TypeScript 5.6.3",
  "Build Tool": "Vite 5.4.20",
  "Styling": "Tailwind CSS 3.4.17",
  "Blockchain Library": "ethers.js 6.13.4",
  "Routing": "wouter 3.3.5",
  "UI Components": "Radix UI (shadcn/ui)",
  "Icons": "lucide-react 0.468.0",
  "Forms": "react-hook-form 7.54.2",
  "Notifications": "react-toastify 10.0.6"
}
```

### Why These Technologies?

**React + TypeScript**
- Type safety prevents bugs
- Component reusability
- Large ecosystem

**Vite**
- Lightning-fast dev server
- Hot Module Replacement (HMR)
- Optimized production builds

**ethers.js**
- Industry standard for Ethereum
- Simple API for contract interactions
- MetaMask integration built-in

**Tailwind CSS**
- Utility-first approach
- Consistent design system
- Small bundle size

**Radix UI**
- Accessible components (ARIA compliant)
- Unstyled primitives
- Full keyboard navigation

---

## 🏗 Project Architecture

### Architecture Pattern
```
┌─────────────────────────────────────────────┐
│              USER INTERFACE                 │
│   (React Components + Tailwind Styling)    │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│         REACT CONTEXT PROVIDERS             │
│  - WalletContext (MetaMask connection)      │
│  - ThemeContext (Dark/Light mode)           │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│          CUSTOM REACT HOOKS                 │
│  - useBlockchainData.ts (Fetch data)        │
│  - useToast.ts (Notifications)              │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│         BLOCKCHAIN LIBRARY LAYER            │
│  - blockchain.ts (ethers.js wrapper)        │
│  - contract.ts (Contract ABI & address)     │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│        ETHEREUM SMART CONTRACT              │
│     LandTokenization.sol (ERC721)           │
│   Address: 0x991A529358D2dEc2Afc...         │
└─────────────────────────────────────────────┘
```

### Data Flow Direction
```
User Action (Click button)
    ↓
Component Handler (onClick)
    ↓
Blockchain Function (buyPlot)
    ↓
ethers.js Contract Call
    ↓
MetaMask Transaction Popup
    ↓
User Confirms
    ↓
Transaction Sent to Blockchain
    ↓
Wait for Confirmation
    ↓
Success Toast + Refresh Data
```

---

## 📁 File Structure

```
client/src/
│
├── main.tsx                 # App entry point
├── App.tsx                  # Root component with routing
├── index.css               # Global styles + Tailwind imports
│
├── components/             # Reusable UI components
│   ├── Navbar.tsx          # Top navigation bar
│   ├── LandProjectCard.tsx # Project card component
│   ├── PlotGrid.tsx        # Grid of plot NFTs
│   ├── BuyPlotModal.tsx    # Purchase modal dialog
│   ├── ListForSaleModal.tsx# Resale listing modal
│   ├── SearchFilterBar.tsx # Search & filter UI
│   ├── StatsCard.tsx       # Dashboard statistics
│   └── ui/                 # Radix UI primitives
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── badge.tsx
│       └── ... (20+ components)
│
├── pages/                  # Route-level components
│   ├── Dashboard.tsx       # Home page (/)
│   ├── BrowseProjects.tsx  # Project listing (/browse)
│   ├── ProjectDetails.tsx  # Plot grid view (/project/:id)
│   ├── MyPlots.tsx         # User's owned plots (/my-plots)
│   ├── OwnerPanel.tsx      # Admin panel (/owner)
│   └── not-found.tsx       # 404 page
│
├── contexts/               # React Context providers
│   ├── WalletContext.tsx   # MetaMask connection state
│   └── ThemeContext.tsx    # Dark/Light mode
│
├── hooks/                  # Custom React hooks
│   ├── useBlockchainData.ts # Fetch contract data
│   └── use-toast.ts        # Toast notifications
│
└── lib/                    # Utility libraries
    ├── blockchain.ts       # ethers.js contract functions
    ├── contract.ts         # ABI + contract address
    ├── pinata.ts           # IPFS image upload
    └── utils.ts            # Helper functions (cn, etc.)
```

---

## 🧠 Core Concepts

### 1. **Smart Contract Interaction**
Every data operation goes through the blockchain:
```typescript
// Reading data (FREE - no gas)
const project = await getLandProject(landId);

// Writing data (COSTS GAS - requires MetaMask)
await buyPlot(tokenId, price);
```

### 2. **NFT Lifecycle**
```
Project Created (numPlots: 20)
    ↓
Owner Mints Plot #1 → TokenId: 1 → Owner: Contract
    ↓
User Buys Plot #1 → Owner: 0x3b3e...fbc1 → Status: Sold
    ↓
User Lists for Resale → Status: Listed (resalePrice: 3.5 ETH)
    ↓
Another User Buys Resale → Owner: 0x8a9c...2d4f → Status: Sold
```

### 3. **Plot Status Colors**
- 🟢 **Green (Available)**: Owner = Contract, primarySale = true
- 🟡 **Yellow (Listed)**: resalePrice > 0
- ⚫ **Gray (Sold)**: Owner ≠ Contract, resalePrice = 0

### 4. **Gas Fees**
Every write operation requires ETH for gas:
- Create Project: ~200k gas (~$10-50 depending on gas price)
- Mint Plot: ~100k gas (~$5-25)
- Buy Plot: ~150k gas (~$7-35)
- List Resale: ~50k gas (~$2-10)

---

## 🧩 Component Breakdown

### 1. **main.tsx** (Entry Point)
```typescript
// Renders React app into DOM
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**What it does:**
- Finds `<div id="root">` in `index.html`
- Renders `<App />` component inside it
- StrictMode helps catch bugs in development

---

### 2. **App.tsx** (Root Component)
```typescript
function App() {
  return (
    <ThemeProvider>           {/* Dark/Light mode */}
      <WalletProvider>         {/* MetaMask connection */}
        <TooltipProvider>      {/* Radix UI tooltips */}
          <Navbar />           {/* Top navigation */}
          <Router />           {/* Page routing */}
          <Toaster />          {/* shadcn toasts */}
          <ToastContainer />   {/* react-toastify */}
        </TooltipProvider>
      </WalletProvider>
    </ThemeProvider>
  );
}
```

**Context Providers Explained:**
- **ThemeProvider**: Manages `theme` state ("light" | "dark")
- **WalletProvider**: Manages `account`, `chainId`, `isOwner`
- **TooltipProvider**: Required by Radix UI tooltips

**Why Multiple Toast Libraries?**
- `shadcn/ui` Toaster: UI component alerts
- `react-toastify`: Transaction success/error notifications

---

### 3. **WalletContext.tsx** (Critical!)
```typescript
interface WalletContextType {
  account: string | null;        // "0x3b3e4...fbc1" or null
  chainId: number | null;        // 1337 (local), 1 (mainnet)
  isOwner: boolean;              // true if contract owner
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}
```

**How Wallet Connection Works:**
```typescript
// 1. User clicks "Connect Wallet"
await connectWallet();

// 2. MetaMask popup appears
const accounts = await window.ethereum.request({ 
  method: 'eth_requestAccounts' 
});

// 3. Get account address
const account = accounts[0]; // "0x3b3e4...fbc1"

// 4. Get network
const chainId = await window.ethereum.request({ 
  method: 'eth_chainId' 
});

// 5. Check if owner
const owner = await getContractOwner(); // From smart contract
const isOwner = account.toLowerCase() === owner.toLowerCase();

// 6. Update state
setAccount(account);
setChainId(parseInt(chainId, 16));
setIsOwner(isOwner);
```

**Auto-Connect on Page Load:**
```typescript
useEffect(() => {
  const lastAccount = localStorage.getItem('lastConnectedAccount');
  if (lastAccount) {
    connectWallet(); // Auto-reconnect
  }
}, []);
```

**Account Change Detection:**
```typescript
window.ethereum.on('accountsChanged', (accounts) => {
  if (accounts.length === 0) {
    disconnectWallet(); // User locked MetaMask
  } else {
    connectWallet(); // User switched account
  }
});
```

---

### 4. **useBlockchainData.ts** (Data Fetching Hooks)

#### **useAllLandProjects()**
```typescript
export function useAllLandProjects() {
  const [projects, setProjects] = useState<LandProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const blockchainProjects = await getAllLandProjects(); // From blockchain.ts
    
    const formatted = await Promise.all(
      blockchainProjects.map(async (project) => ({
        id: Number(project.landId),
        name: project.landName,
        location: project.location,
        numPlots: Number(project.numPlots),
        plotsMinted: await getPlotsMinted(Number(project.landId)),
        basePrice: weiToEther(project.basePrice),
        // ... more fields
      }))
    );
    
    setProjects(formatted);
  };

  return { projects, loading, error, refetch: fetchProjects };
}
```

**Usage in Component:**
```typescript
function BrowseProjects() {
  const { projects, loading } = useAllLandProjects();
  
  if (loading) return <Loader2 className="animate-spin" />;
  
  return (
    <div>
      {projects.map(project => (
        <LandProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
```

#### **useProjectPlots(landId, numPlots, ownerAddress)**
```typescript
const fetchPlots = async () => {
  const totalSupply = await getTotalSupply(); // How many NFTs exist?
  const allPlots = [];
  
  // Loop through all minted NFTs
  for (let tokenId = 1; tokenId <= totalSupply; tokenId++) {
    const plotInfo = await getPlotInfo(tokenId);
    
    // Only include plots from this landId
    if (Number(plotInfo.landId) === landId) {
      const owner = await getPlotOwner(tokenId);
      const resalePrice = await getResalePrice(tokenId);
      
      // Determine status
      let status: "available" | "listed" | "sold";
      if (owner === ownerAddress) {
        status = "available"; // Contract still owns it
      } else if (Number(resalePrice) > 0) {
        status = "listed";    // Listed for resale
      } else {
        status = "sold";      // Owned by user
      }
      
      allPlots.push({
        tokenId,
        plotNumber: Number(plotInfo.plotNumber),
        status,
        price: weiToEther(plotInfo.price),
        owner,
        resalePrice: Number(resalePrice) > 0 ? weiToEther(resalePrice) : undefined,
      });
    }
  }
  
  setPlots(allPlots);
};
```

**Why Loop Through All Tokens?**
The smart contract doesn't have a `getPlotsByLandId()` function, so we must:
1. Get total supply (e.g., 50 NFTs minted)
2. Loop through tokenIds 1-50
3. Filter by landId
4. Build plot array

---

### 5. **blockchain.ts** (Core Functions)

#### **Setup Contract Instance**
```typescript
import { ethers } from "ethers";
import { LAND_CONTRACT_ADDRESS, LAND_CONTRACT_ABI } from "./contract";

function getContract() {
  if (!window.ethereum) {
    throw new Error("MetaMask not installed");
  }
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  
  return new ethers.Contract(
    LAND_CONTRACT_ADDRESS,
    LAND_CONTRACT_ABI,
    signer
  );
}
```

**What's Happening:**
- `BrowserProvider`: Connects to MetaMask's Ethereum node
- `getSigner()`: Gets user's account for signing transactions
- `Contract`: Creates instance to call smart contract functions

#### **Read Functions (No Gas)**
```typescript
export async function getLandProject(landId: number) {
  const contract = await getContract();
  const project = await contract.landProjects(landId);
  return {
    landId: project.landId,
    landName: project.landName,
    location: project.location,
    totalArea: project.totalArea,
    // ... more fields
  };
}

export async function getPlotInfo(tokenId: number) {
  const contract = await getContract();
  return await contract.plots(tokenId);
}

export async function getTotalSupply() {
  const contract = await getContract();
  const supply = await contract.totalSupply();
  return Number(supply);
}
```

**Key Point:** Reading is FREE because it doesn't modify blockchain state.

#### **Write Functions (Costs Gas)**
```typescript
export async function buyPlot(tokenId: number, priceInEther: string) {
  const contract = await getContract();
  
  // Convert ETH to Wei (1 ETH = 1e18 Wei)
  const priceInWei = ethers.parseEther(priceInEther);
  
  // Send transaction with ETH value
  const tx = await contract.buyPlot(tokenId, { value: priceInWei });
  
  // Wait for blockchain confirmation
  await tx.wait();
  
  return tx;
}

export async function mintPlot(landId: number) {
  const contract = await getContract();
  const tx = await contract.mintPlot(landId);
  await tx.wait();
  return tx;
}

export async function listForSale(tokenId: number, priceInEther: string) {
  const contract = await getContract();
  const priceInWei = ethers.parseEther(priceInEther);
  const tx = await contract.listForSale(tokenId, priceInWei);
  await tx.wait();
  return tx;
}
```

**Transaction Flow:**
```
1. contract.buyPlot(tokenId, { value: priceInWei })
   ↓ Returns transaction object immediately
2. MetaMask popup: "Confirm transaction?"
   ↓ User clicks "Confirm"
3. Transaction sent to blockchain
   ↓ Status: Pending (hash available)
4. await tx.wait()
   ↓ Waits for miner to include in block
5. Transaction confirmed!
   ↓ Status: Success (receipt available)
```

---

### 6. **Navbar.tsx** (Navigation Bar)
```typescript
function Navbar() {
  const { account, isOwner, connectWallet, disconnectWallet } = useWallet();
  const { theme, setTheme } = useTheme();

  return (
    <nav>
      <Link href="/">
        <LandPlot className="h-8 w-8" />
        <span className="text-xl font-bold">LandToken</span>
      </Link>

      <div className="flex gap-4">
        <NavLink href="/">Dashboard</NavLink>
        <NavLink href="/browse">Browse</NavLink>
        <NavLink href="/my-plots">My Plots</NavLink>
        {isOwner && <NavLink href="/owner">Owner Panel</NavLink>}
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              {theme === "dark" ? <Moon /> : <Sun />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setTheme("light")}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              Dark
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Wallet Button */}
        {account ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Wallet className="h-4 w-4 mr-2" />
                {account.slice(0, 6)}...{account.slice(-4)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={disconnectWallet}>
                Disconnect
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button onClick={connectWallet}>
            Connect Wallet
          </Button>
        )}
      </div>
    </nav>
  );
}
```

**Key Features:**
- **Conditional rendering**: Owner Panel only shows if `isOwner`
- **Account truncation**: "0x3b3e4...fbc1" saves space
- **Theme toggle**: Sun/Moon icon switches themes
- **Responsive**: Collapses to hamburger menu on mobile

---

### 7. **Dashboard.tsx** (Home Page)
```typescript
function Dashboard() {
  const { account, connectWallet } = useWallet();
  const { projects, loading } = useAllLandProjects();

  // Calculate statistics
  const totalProjects = projects.length;
  const totalPlots = projects.reduce((sum, p) => sum + p.numPlots, 0);
  const totalMinted = projects.reduce((sum, p) => sum + p.plotsMinted, 0);
  const availablePlots = totalMinted; // Simplified

  return (
    <div>
      <section className="hero">
        <h1>Tokenize Land Ownership</h1>
        <p>Buy, sell, and trade land plots as NFTs</p>
        {!account && (
          <Button onClick={connectWallet}>Get Started</Button>
        )}
      </section>

      <section className="stats">
        <StatsCard
          title="Total Projects"
          value={totalProjects}
          icon={<Building2 />}
        />
        <StatsCard
          title="Total Plots"
          value={totalPlots}
          icon={<Grid3x3 />}
        />
        <StatsCard
          title="Minted Plots"
          value={totalMinted}
          icon={<Tag />}
        />
        <StatsCard
          title="Available"
          value={availablePlots}
          icon={<DollarSign />}
        />
      </section>

      <section className="featured-projects">
        <h2>Featured Projects</h2>
        <div className="grid">
          {projects.slice(0, 3).map(project => (
            <LandProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>
    </div>
  );
}
```

---

### 8. **BrowseProjects.tsx** (Project Listing)
```typescript
function BrowseProjects() {
  const { projects, loading } = useAllLandProjects();
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 100]);

  const filteredProjects = projects.filter(project => {
    // Search by name
    const matchesSearch = project.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    // Filter by location
    const matchesLocation = locationFilter.length === 0 ||
      locationFilter.includes(project.location);

    // Filter by price
    const price = parseFloat(project.basePrice);
    const matchesPrice = price >= priceRange[0] && price <= priceRange[1];

    return matchesSearch && matchesLocation && matchesPrice;
  });

  return (
    <div>
      <SearchFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        locationFilter={locationFilter}
        onLocationChange={setLocationFilter}
        priceRange={priceRange}
        onPriceRangeChange={setPriceRange}
      />

      <div className="grid grid-cols-3 gap-6">
        {filteredProjects.map(project => (
          <LandProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
```

**Filter Logic:**
- **Search**: Case-insensitive name matching
- **Location**: Multi-select checkbox filter
- **Price Range**: Slider with min/max values

---

### 9. **ProjectDetails.tsx** (Plot Grid View)
```typescript
function ProjectDetails() {
  const [, params] = useRoute("/project/:id");
  const landId = parseInt(params?.id || "0");
  
  const { project, loading: loadingProject } = useLandProject(landId);
  const [contractOwner, setContractOwner] = useState("");
  const { plots, loading: loadingPlots } = useProjectPlots(
    landId, 
    project?.numPlots || 0, 
    contractOwner
  );

  const [selectedPlot, setSelectedPlot] = useState(null);
  const [buyModalOpen, setBuyModalOpen] = useState(false);

  useEffect(() => {
    const fetchOwner = async () => {
      const owner = await getContractOwner();
      setContractOwner(owner);
    };
    fetchOwner();
  }, []);

  const handlePlotClick = (plot) => {
    setSelectedPlot({
      tokenId: plot.tokenId,
      plotNumber: plot.plotNumber,
      price: plot.status === "listed" ? plot.resalePrice : plot.price,
      landName: project.name,
      isResale: plot.status === "listed",
    });
    setBuyModalOpen(true);
  };

  return (
    <div>
      <section className="project-info">
        <h1>{project.name}</h1>
        <p>{project.location}</p>
        <div className="stats">
          <div>Total Area: {project.totalArea} sq.ft</div>
          <div>Plot Size: {project.plotSize} sq.ft</div>
          <div>Plots: {project.plotsMinted} / {project.numPlots}</div>
          <div>Base Price: {project.basePrice} ETH</div>
        </div>
        <img src={getIpfsUrl(project.imageUrl)} alt={project.name} />
      </section>

      <section className="plot-grid">
        <h2>Plot Availability</h2>
        
        {/* Color Legend */}
        <div className="legend">
          <div>🟢 Available ({availablePlots})</div>
          <div>🟡 Listed ({listedPlots})</div>
          <div>⚫ Sold ({soldPlots})</div>
        </div>

        {plots.length === 0 ? (
          <div className="empty-state">
            <p>No Plots Available Yet</p>
            <p>The owner needs to mint plots first.</p>
          </div>
        ) : (
          <PlotGrid plots={plots} onPlotClick={handlePlotClick} />
        )}
      </section>

      <BuyPlotModal
        open={buyModalOpen}
        onClose={() => setBuyModalOpen(false)}
        plot={selectedPlot}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}
```

**Plot Grid Rendering:**
```typescript
// PlotGrid.tsx
function PlotGrid({ plots, onPlotClick }) {
  return (
    <div className="grid grid-cols-12 gap-2">
      {plots.map(plot => (
        <Tooltip key={plot.tokenId}>
          <TooltipTrigger asChild>
            <button
              onClick={() => plot.status !== "sold" && onPlotClick(plot)}
              className={getPlotColor(plot.status)}
              disabled={plot.status === "sold"}
            >
              #{plot.plotNumber}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Plot #{plot.plotNumber}</p>
            <p>Token ID: {plot.tokenId}</p>
            <Badge>{plot.status}</Badge>
            <p>Price: {plot.price} ETH</p>
            {plot.owner && <p>Owner: {plot.owner}</p>}
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
```

---

### 10. **MyPlots.tsx** (User's Owned Plots)
```typescript
function MyPlots() {
  const { account, connectWallet } = useWallet();
  const { plots, loading } = useUserOwnedPlots(account);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [listModalOpen, setListModalOpen] = useState(false);

  const handleListForSale = (plot) => {
    setSelectedPlot({
      tokenId: plot.tokenId,
      plotNumber: plot.plotNumber,
      landName: plot.landName,
      originalPrice: plot.purchasePrice,
    });
    setListModalOpen(true);
  };

  const handleUnlist = async (tokenId) => {
    try {
      await unlistFromSale(tokenId);
      toast.success("Plot unlisted!");
      window.location.reload();
    } catch (error) {
      toast.error("Failed to unlist plot");
    }
  };

  if (!account) {
    return (
      <div className="empty-state">
        <h2>Connect Your Wallet</h2>
        <Button onClick={connectWallet}>Connect Wallet</Button>
      </div>
    );
  }

  return (
    <div>
      <h1>My Plots</h1>
      <Badge>{plots.length} Plots</Badge>

      {plots.length === 0 ? (
        <div className="empty-state">
          <p>No plots owned yet</p>
          <Button asChild>
            <Link href="/browse">Browse Projects</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {plots.map(plot => (
            <Card key={plot.tokenId}>
              <CardHeader>
                <h3>{plot.landName}</h3>
                <Badge>Plot #{plot.plotNumber}</Badge>
              </CardHeader>
              <CardContent>
                <p>Token ID: {plot.tokenId}</p>
                <p>Purchase Price: {plot.purchasePrice} ETH</p>
                {plot.isListed && (
                  <Badge variant="secondary">
                    Listed: {plot.listingPrice} ETH
                  </Badge>
                )}
              </CardContent>
              <CardFooter>
                {plot.isListed ? (
                  <Button 
                    variant="destructive"
                    onClick={() => handleUnlist(plot.tokenId)}
                  >
                    <X className="mr-2" />
                    Unlist
                  </Button>
                ) : (
                  <Button onClick={() => handleListForSale(plot)}>
                    <Tag className="mr-2" />
                    List for Sale
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <ListForSaleModal
        open={listModalOpen}
        onClose={() => setListModalOpen(false)}
        plot={selectedPlot}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}
```

---

### 11. **OwnerPanel.tsx** (Admin Panel)
```typescript
function OwnerPanel() {
  const { account, isOwner, connectWallet } = useWallet();
  const { projects, loading, refetch } = useAllLandProjects();
  const [creating, setCreating] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    landName: "",
    totalArea: "",
    plotSize: "",
    location: "",
    contactNumber: "",
    description: "",
    basePrice: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);

    try {
      // 1. Upload image to IPFS if selected
      let imageHash = "";
      if (imageFile) {
        toast.info("Uploading image to IPFS...");
        const result = await uploadImageToPinata(imageFile);
        imageHash = result.ipfsHash;
        toast.success("Image uploaded!");
      }

      // 2. Create land project on blockchain
      await createLandProject({
        landName: formData.landName,
        totalArea: parseInt(formData.totalArea),
        plotSize: parseInt(formData.plotSize),
        imageHash,
        description: formData.description,
        contactNumber: formData.contactNumber,
        location: formData.location,
        basePriceInEther: formData.basePrice,
      });

      toast.success("Project created!");
      
      // 3. Reset form
      setFormData({ ...defaultFormData });
      setImageFile(null);
      
      // 4. Refresh project list
      setTimeout(() => refetch(), 2000);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  const handleMintPlot = async (landId) => {
    try {
      await mintPlot(landId);
      toast.success("Plot minted!");
      setTimeout(() => refetch(), 2000);
    } catch (error) {
      toast.error("Failed to mint plot");
    }
  };

  const handleMintMultiplePlots = async (landId, count) => {
    let successCount = 0;
    
    for (let i = 0; i < count; i++) {
      try {
        await mintPlot(landId);
        successCount++;
        toast.success(`Plot ${i + 1}/${count} minted!`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        if (error.code === 4001) {
          toast.error("Transaction rejected");
          break;
        }
        toast.error(`Failed to mint plot ${i + 1}`);
      }
    }
    
    if (successCount > 0) {
      toast.success(`${successCount} plots minted!`);
      setTimeout(() => refetch(), 2000);
    }
  };

  if (!account) {
    return (
      <div className="empty-state">
        <h2>Owner Access Required</h2>
        <Button onClick={connectWallet}>Connect Wallet</Button>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="empty-state">
        <h2>Access Denied</h2>
        <p>Connected account is not the contract owner.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Owner Panel</h1>
      <Badge variant="secondary" className="bg-green-600">
        Contract Owner
      </Badge>

      {/* Create Project Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Land Project</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Input
              label="Land Name"
              value={formData.landName}
              onChange={(e) => setFormData({ 
                ...formData, 
                landName: e.target.value 
              })}
              required
            />
            
            <Input
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData({ 
                ...formData, 
                location: e.target.value 
              })}
              required
            />
            
            {/* ... more form fields ... */}

            {/* Image Upload */}
            <div>
              <Label>Project Image</Label>
              {imageFile ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" />
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setImageFile(null)}
                  >
                    <X />
                  </Button>
                </div>
              ) : (
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                />
              )}
            </div>

            <Button type="submit" disabled={creating}>
              {creating ? "Creating..." : "Create Project"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Manage Existing Projects */}
      <div>
        <h2>Manage Existing Projects</h2>
        <div className="grid grid-cols-3 gap-6">
          {projects.map(project => (
            <div key={project.id}>
              <LandProjectCard project={project} />
              
              {/* Minting Progress */}
              <div className="progress-bar">
                <span>{project.plotsMinted} / {project.numPlots}</span>
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${(project.plotsMinted / project.numPlots) * 100}%` 
                  }}
                />
              </div>

              {/* Minting Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={() => handleMintPlot(project.id)}
                  disabled={project.plotsMinted >= project.numPlots}
                >
                  Mint 1
                </Button>
                <Button
                  onClick={() => handleMintMultiplePlots(project.id, 5)}
                  disabled={project.plotsMinted >= project.numPlots}
                  variant="secondary"
                >
                  Mint 5
                </Button>
                <Button
                  onClick={() => handleMintMultiplePlots(
                    project.id, 
                    project.numPlots - project.plotsMinted
                  )}
                  disabled={project.plotsMinted >= project.numPlots}
                  variant="outline"
                >
                  Mint All ({project.numPlots - project.plotsMinted})
                </Button>
              </div>

              {/* Deactivate Button */}
              {project.plotsMinted >= project.numPlots && (
                <Button
                  onClick={() => handleDeactivate(project.id)}
                  variant="destructive"
                >
                  Deactivate Project
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

**Key Features:**
- **Form validation**: Required fields marked with *
- **Image upload**: Preview before uploading to IPFS
- **Batch minting**: Mint 1, 5, or all plots at once
- **Progress tracking**: Visual bar shows minted/total
- **Access control**: Only contract owner can access

---

## 🔗 IPFS Integration (Pinata)

### **pinata.ts** (IPFS Upload)
```typescript
const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_API_SECRET = import.meta.env.VITE_PINATA_API_SECRET;
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

export async function uploadImageToPinata(file: File) {
  // 1. Validate file
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // 2. Create FormData
  const formData = new FormData();
  formData.append('file', file);
  formData.append('pinataMetadata', JSON.stringify({
    name: file.name,
  }));

  // 3. Upload to Pinata
  const response = await fetch(
    'https://api.pinata.cloud/pinning/pinFileToIPFS',
    {
      method: 'POST',
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_API_SECRET,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error('Pinata upload failed');
  }

  const data = await response.json();
  return {
    ipfsHash: data.IpfsHash,
    pinSize: data.PinSize,
  };
}

export function getIpfsUrl(hash: string): string {
  if (!hash) return "";
  
  // Convert IPFS hash to public gateway URL
  if (hash.startsWith('Qm') || hash.startsWith('baf')) {
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
  }
  
  // If already a URL, return as-is
  return hash;
}

export function validateImageFile(file: File) {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File too large (max 10MB)' };
  }
  
  return { valid: true };
}
```

**How Image Upload Works:**
```
1. User selects file
   ↓
2. Validate file (type, size)
   ↓
3. Show preview in browser
   ↓
4. User submits form
   ↓
5. Upload to Pinata API
   ↓
6. Get IPFS hash: "QmX1b3..."
   ↓
7. Store hash in smart contract
   ↓
8. When displaying: Convert hash to URL
   "https://gateway.pinata.cloud/ipfs/QmX1b3..."
```

---

## 🎨 Styling & Theming

### **Tailwind Configuration**
```javascript
// tailwind.config.ts
export default {
  darkMode: ["class"],
  content: ["./client/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // ... more color tokens
      },
    },
  },
};
```

### **CSS Variables (index.css)**
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  /* ... more variables */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 210 40% 98%;
  /* ... dark mode overrides */
}
```

### **Theme Context**
```typescript
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) {
      setTheme(saved);
      document.documentElement.classList.toggle("dark", saved === "dark");
    }
  }, []);

  const toggleTheme = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

**How Theme Works:**
1. Read `localStorage` on mount
2. Apply `dark` class to `<html>` if dark mode
3. CSS variables change based on `.dark` class
4. Components use `bg-background`, `text-foreground`, etc.
5. Colors automatically adjust!

---

## 🔄 Data Flow Example

### **Complete Purchase Flow**

#### **1. User Clicks Plot**
```typescript
// ProjectDetails.tsx
<PlotGrid 
  plots={plots} 
  onPlotClick={(plot) => {
    setSelectedPlot(plot);
    setBuyModalOpen(true);
  }} 
/>
```

#### **2. Modal Opens**
```typescript
// BuyPlotModal.tsx
function BuyPlotModal({ open, onClose, plot, onSuccess }) {
  const [buying, setBuying] = useState(false);

  const handleBuy = async () => {
    setBuying(true);
    
    try {
      if (plot.isResale) {
        await buyResale(plot.tokenId, plot.price);
      } else {
        await buyPlot(plot.tokenId, plot.price);
      }
      
      toast.success("Purchase successful!");
      onSuccess();
    } catch (error) {
      if (error.code === 4001) {
        toast.error("Transaction rejected");
      } else {
        toast.error("Purchase failed");
      }
    } finally {
      setBuying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Buy Plot #{plot.plotNumber}</DialogTitle>
        </DialogHeader>
        
        <div>
          <p>Land: {plot.landName}</p>
          <p>Price: {plot.price} ETH</p>
          {plot.isResale && <Badge>Resale</Badge>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleBuy} disabled={buying}>
            {buying ? (
              <>
                <Loader2 className="animate-spin mr-2" />
                Processing...
              </>
            ) : (
              "Confirm Purchase"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

#### **3. Blockchain Call**
```typescript
// blockchain.ts
export async function buyPlot(tokenId: number, priceInEther: string) {
  const contract = await getContract();
  const priceInWei = ethers.parseEther(priceInEther);
  
  const tx = await contract.buyPlot(tokenId, { value: priceInWei });
  await tx.wait(); // Wait for confirmation
  
  return tx;
}
```

#### **4. MetaMask Popup**
```
┌──────────────────────────────────────┐
│  MetaMask Notification               │
├──────────────────────────────────────┤
│  Contract Interaction                │
│                                      │
│  LandTokenization                    │
│  0x991A52...0586                     │
│                                      │
│  Function: buyPlot                   │
│  Parameters:                         │
│    tokenId: 1                        │
│    value: 2.5 ETH                    │
│                                      │
│  Gas Fee: 0.002 ETH                  │
│  Total: 2.502 ETH                    │
│                                      │
│  [Reject]           [Confirm]        │
└──────────────────────────────────────┘
```

#### **5. Transaction Pending**
```typescript
// After user confirms in MetaMask
const tx = await contract.buyPlot(tokenId, { value: priceInWei });
// tx.hash = "0xabc123..."

toast.info("Transaction submitted! Waiting for confirmation...");
```

#### **6. Wait for Confirmation**
```typescript
await tx.wait(); // Blocks until mined
// tx.blockNumber = 12345
// tx.status = 1 (success)

toast.success("Purchase successful!");
```

#### **7. Refresh UI**
```typescript
onSuccess(); // Callback from parent

// ProjectDetails.tsx
onSuccess={() => {
  setTimeout(() => {
    window.location.reload(); // Refresh page
  }, 2500);
}}
```

---

## 📱 User Workflows

### **New User Journey**

#### **Step 1: Connect Wallet**
```
Visit site → Click "Connect Wallet" → MetaMask popup → 
Select account → Approve → Connected!
```

#### **Step 2: Browse Projects**
```
Click "Browse" → See project cards → Apply filters → 
Click project → See plot grid
```

#### **Step 3: Buy Plot**
```
Click green plot → Buy modal opens → Confirm purchase → 
MetaMask popup → Confirm → Wait → Success! → Plot turns gray
```

#### **Step 4: View Owned Plots**
```
Click "My Plots" → See owned NFTs → Click "List for Sale" →
Enter price → Confirm → MetaMask → Plot listed!
```

---

### **Owner Journey**

#### **Step 1: Access Owner Panel**
```
Connect as owner account → "Owner Panel" appears in nav → Click
```

#### **Step 2: Create Project**
```
Fill form (name, location, area, etc.) → Upload image → 
Submit → MetaMask confirm → Project created!
```

#### **Step 3: Mint Plots**
```
Scroll to project → Click "Mint All (20)" → Confirm 20 transactions →
Wait → All plots minted!
```

#### **Step 4: Monitor Sales**
```
Check project card → See "15 / 20 plots sold" → Revenue tracked on-chain
```

---

## 🛠 Best Practices

### **1. Error Handling**
```typescript
try {
  await buyPlot(tokenId, price);
  toast.success("Success!");
} catch (error: any) {
  // User rejected transaction
  if (error.code === 4001) {
    toast.error("Transaction rejected");
    return;
  }
  
  // Insufficient funds
  if (error.message.includes("insufficient funds")) {
    toast.error("Insufficient ETH balance");
    return;
  }
  
  // Generic error
  console.error("Purchase error:", error);
  toast.error("Purchase failed. Please try again.");
}
```

### **2. Loading States**
```typescript
const [loading, setLoading] = useState(false);

const handleAction = async () => {
  setLoading(true);
  try {
    await blockchainFunction();
  } finally {
    setLoading(false); // Always reset loading
  }
};

return (
  <Button disabled={loading}>
    {loading ? (
      <>
        <Loader2 className="animate-spin mr-2" />
        Processing...
      </>
    ) : (
      "Submit"
    )}
  </Button>
);
```

### **3. Optimistic Updates**
```typescript
// Show success immediately, refresh in background
const handleBuy = async () => {
  await buyPlot(tokenId, price);
  
  toast.success("Purchase successful!");
  
  // Give user time to see success message
  setTimeout(() => {
    window.location.reload(); // Refresh to get latest data
  }, 2500);
};
```

### **4. Transaction Confirmations**
```typescript
const tx = await contract.buyPlot(tokenId, { value: price });

// Show pending toast
toast.info("Transaction submitted! Waiting for confirmation...");

// Wait for 1 confirmation
await tx.wait(1);

// Wait for 3 confirmations (more secure)
await tx.wait(3);
```

### **5. Gas Estimation**
```typescript
try {
  // Estimate gas before sending
  const gasEstimate = await contract.buyPlot.estimateGas(
    tokenId, 
    { value: price }
  );
  
  console.log("Estimated gas:", gasEstimate.toString());
  
  // Add 20% buffer for safety
  const gasLimit = gasEstimate * 120n / 100n;
  
  // Send with custom gas limit
  const tx = await contract.buyPlot(tokenId, { 
    value: price,
    gasLimit 
  });
} catch (error) {
  toast.error("Transaction would fail. Check your balance.");
}
```

### **6. Preventing Double-Clicks**
```typescript
const [processing, setProcessing] = useState(false);

const handleSubmit = async () => {
  if (processing) return; // Prevent double-click
  
  setProcessing(true);
  try {
    await blockchainFunction();
  } finally {
    setProcessing(false);
  }
};
```

### **7. Input Validation**
```typescript
const validateForm = () => {
  if (!formData.landName.trim()) {
    toast.error("Land name is required");
    return false;
  }
  
  if (parseInt(formData.totalArea) <= 0) {
    toast.error("Total area must be positive");
    return false;
  }
  
  if (parseFloat(formData.basePrice) <= 0) {
    toast.error("Base price must be positive");
    return false;
  }
  
  return true;
};

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) return;
  
  // Proceed with submission
};
```

---

## 🔍 Debugging Tips

### **1. Check MetaMask Connection**
```typescript
// In browser console
window.ethereum.isConnected() // Should return true

window.ethereum.selectedAddress // Your account address

window.ethereum.chainId // "0x539" for local network (1337)
```

### **2. View Contract State**
```typescript
// Read contract data directly
import { getContract } from './lib/blockchain';

const contract = await getContract();

// Check total supply
const supply = await contract.totalSupply();
console.log("Total NFTs:", supply.toString());

// Check specific plot
const plot = await contract.plots(1);
console.log("Plot 1:", plot);

// Check owner
const owner = await contract.owner();
console.log("Contract owner:", owner);
```

### **3. Monitor Transactions**
```typescript
const tx = await contract.buyPlot(tokenId, { value: price });

console.log("Transaction hash:", tx.hash);
console.log("From:", tx.from);
console.log("To:", tx.to);
console.log("Value:", tx.value.toString());

const receipt = await tx.wait();
console.log("Block number:", receipt.blockNumber);
console.log("Gas used:", receipt.gasUsed.toString());
console.log("Status:", receipt.status); // 1 = success, 0 = failed
```

### **4. Check Network**
```typescript
const { ethereum } = window;

const chainId = await ethereum.request({ method: 'eth_chainId' });
console.log("Chain ID:", parseInt(chainId, 16)); // Should be 1337 for local

const accounts = await ethereum.request({ method: 'eth_accounts' });
console.log("Connected accounts:", accounts);
```

### **5. View Console Logs**
```typescript
// Enable detailed logging
localStorage.setItem('debug', 'ethers:*');

// Disable logging
localStorage.removeItem('debug');
```

---

## 📚 Additional Resources

### **Learn More**
- **React Documentation**: https://react.dev
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **ethers.js Docs**: https://docs.ethers.org/v6/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Radix UI**: https://www.radix-ui.com/primitives/docs
- **MetaMask Docs**: https://docs.metamask.io/

### **Key Concepts to Study**
1. **React Hooks**: useState, useEffect, useContext, custom hooks
2. **TypeScript Interfaces**: Type definitions, generics, type guards
3. **Async/Await**: Promises, error handling, try-catch
4. **Blockchain Basics**: Wallets, transactions, gas fees, NFTs
5. **ethers.js**: Providers, signers, contracts, ABI encoding
6. **Tailwind Utilities**: Flexbox, grid, responsive design
7. **Component Composition**: Props, children, render props

---

## 🎓 Study Path

### **Week 1: React Fundamentals**
- [ ] Understand component lifecycle
- [ ] Master useState and useEffect
- [ ] Learn props and prop drilling
- [ ] Practice conditional rendering

### **Week 2: TypeScript**
- [ ] Basic types and interfaces
- [ ] Generic types
- [ ] Type inference
- [ ] Working with external libraries

### **Week 3: Blockchain Basics**
- [ ] What is Ethereum?
- [ ] How do smart contracts work?
- [ ] Understanding gas fees
- [ ] NFT standards (ERC721)

### **Week 4: ethers.js**
- [ ] Connecting to MetaMask
- [ ] Reading contract data
- [ ] Sending transactions
- [ ] Handling errors

### **Week 5: Advanced Patterns**
- [ ] Context API deep dive
- [ ] Custom hooks
- [ ] Error boundaries
- [ ] Performance optimization

### **Week 6: Build Your Own Feature**
- [ ] Add auction functionality
- [ ] Implement plot transfer
- [ ] Add favorites system
- [ ] Create admin dashboard

---

## 🚀 Next Steps

Now that you understand the frontend architecture:

1. **Experiment**: Modify existing components
2. **Debug**: Use browser DevTools and console.log
3. **Extend**: Add new features (favorites, ratings, etc.)
4. **Optimize**: Reduce bundle size, improve performance
5. **Test**: Write unit tests for components
6. **Deploy**: Build production version and host it

---

## 📧 Questions?

If you need clarification on any part:
1. Re-read the relevant section
2. Check the actual code files
3. Use browser DevTools to inspect runtime behavior
4. Experiment in a separate branch

Happy coding! 🎉
