import { BrowserProvider, Contract, formatEther, parseEther, type Eip1193Provider } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contract";

export interface LandProject {
  landId: bigint;
  landName: string;
  totalArea: bigint;
  plotSize: bigint;
  numPlots: bigint;
  imageHash: string;
  description: string;
  contactNumber: string;
  location: string;
  basePrice: bigint;
  active: boolean;
}

export interface PlotInfo {
  landId: bigint;
  plotNumber: bigint;
  price: bigint;
  isFirstSale: boolean;
}

declare global {
  interface Window {
    ethereum?: Eip1193Provider & {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}

export async function getProvider() {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed. Please install MetaMask to use this DApp.");
  }
  return new BrowserProvider(window.ethereum);
}

export async function getSigner() {
  const provider = await getProvider();
  return await provider.getSigner();
}

export async function getContract() {
  const signer = await getSigner();
  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}

export async function getReadOnlyContract() {
  const provider = await getProvider();
  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
}

export async function connectWallet(): Promise<string> {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }
  
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  
  return accounts[0];
}

export async function getNetwork() {
  const provider = await getProvider();
  const network = await provider.getNetwork();
  return {
    chainId: Number(network.chainId),
    name: network.name,
  };
}

export async function getContractOwner(): Promise<string> {
  const contract = await getReadOnlyContract();
  return await contract.owner();
}

export async function getLandCounter(): Promise<number> {
  const contract = await getReadOnlyContract();
  const counter = await contract.landCounter();
  return Number(counter);
}

export async function getAllLandProjects(): Promise<LandProject[]> {
  const contract = await getReadOnlyContract();
  const landCounter = await getLandCounter();
  
  const projects: LandProject[] = [];
  
  for (let i = 1; i <= landCounter; i++) {
    try {
      const project = await contract.getLandInfo(i);
      projects.push(project);
    } catch (error) {
      console.error(`Error fetching land project ${i}:`, error);
    }
  }
  
  return projects;
}

export async function getLandProject(landId: number): Promise<LandProject> {
  const contract = await getReadOnlyContract();
  return await contract.getLandInfo(landId);
}

export async function getPlotsMinted(landId: number): Promise<number> {
  const contract = await getReadOnlyContract();
  const count = await contract.getPlotsMinted(landId);
  return Number(count);
}

export async function getPlotInfo(tokenId: number): Promise<PlotInfo> {
  const contract = await getReadOnlyContract();
  return await contract.getPlotInfo(tokenId);
}

export async function getPlotOwner(tokenId: number): Promise<string> {
  const contract = await getReadOnlyContract();
  return await contract.ownerOf(tokenId);
}

export async function getResalePrice(tokenId: number): Promise<bigint> {
  const contract = await getReadOnlyContract();
  return await contract.getResalePrice(tokenId);
}

export async function isAvailableForPrimarySale(tokenId: number): Promise<boolean> {
  const contract = await getReadOnlyContract();
  return await contract.isAvailableForPrimarySale(tokenId);
}

export async function getTotalSupply(): Promise<number> {
  const contract = await getReadOnlyContract();
  const supply = await contract.totalSupply();
  return Number(supply);
}

export async function getUserPlots(userAddress: string): Promise<number[]> {
  const contract = await getReadOnlyContract();
  const totalSupply = await getTotalSupply();
  const userPlots: number[] = [];
  
  for (let tokenId = 1; tokenId <= totalSupply; tokenId++) {
    try {
      const owner = await contract.ownerOf(tokenId);
      if (owner.toLowerCase() === userAddress.toLowerCase()) {
        userPlots.push(tokenId);
      }
    } catch (error) {
      // Token doesn't exist or other error
    }
  }
  
  return userPlots;
}

export async function buyPlot(tokenId: number, priceInEther: string) {
  const contract = await getContract();
  const tx = await contract.buyPlot(tokenId, {
    value: parseEther(priceInEther),
  });
  return await tx.wait();
}

export async function buyResale(tokenId: number, priceInEther: string) {
  const contract = await getContract();
  const tx = await contract.buyResale(tokenId, {
    value: parseEther(priceInEther),
  });
  return await tx.wait();
}

export async function listForSale(tokenId: number, priceInEther: string) {
  const contract = await getContract();
  const tx = await contract.listForSale(tokenId, parseEther(priceInEther));
  return await tx.wait();
}

export async function unlistFromSale(tokenId: number) {
  const contract = await getContract();
  const tx = await contract.unlistFromSale(tokenId);
  return await tx.wait();
}

export async function createLandProject(params: {
  landName: string;
  totalArea: number;
  plotSize: number;
  imageHash: string;
  description: string;
  contactNumber: string;
  location: string;
  basePriceInEther: string;
}) {
  const contract = await getContract();
  const tx = await contract.createLandProject(
    params.landName,
    params.totalArea,
    params.plotSize,
    params.imageHash,
    params.description,
    params.contactNumber,
    params.location,
    parseEther(params.basePriceInEther)
  );
  return await tx.wait();
}

export async function mintPlot(landId: number) {
  const contract = await getContract();
  const tx = await contract.mintPlot(landId);
  return await tx.wait();
}

export async function deactivateLandProject(landId: number) {
  const contract = await getContract();
  const tx = await contract.deactivateLandProject(landId);
  return await tx.wait();
}

export function weiToEther(wei: bigint): string {
  return formatEther(wei);
}

export function etherToWei(ether: string): bigint {
  return parseEther(ether);
}
